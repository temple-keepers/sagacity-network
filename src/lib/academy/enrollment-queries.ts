import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface EnrolledCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  hero_image_url: string | null;
  total_lessons: number;
  completed_lessons: number;
  next_lesson_slug: string | null;
  enrolled_at: string;
}

/**
 * Returns true when the logged-in user has an active enrolment for the course.
 * Returns false if anonymous or if the enrolment is refunded/expired.
 */
export async function hasActiveEnrolment(courseId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Returns the set of lesson IDs the current user has completed for a course.
 * Empty set for anonymous users.
 */
export async function getCompletedLessonIds(courseId: string): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, lessons!inner(module_id, modules!inner(course_id))")
    .eq("user_id", user.id)
    .eq("lessons.modules.course_id", courseId);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.lesson_id));
}

/**
 * Returns courses the current user is actively enrolled in, with progress counts
 * and the next unfinished lesson slug for the "Continue" button.
 */
export async function getMyEnrolledCourses(): Promise<EnrolledCourse[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      id, enrolled_at,
      courses!inner (
        id, slug, title, subtitle, hero_image_url,
        modules (
          lessons ( id, slug, position, module_id )
        )
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  if (error) throw error;

  const completed = new Set<string>();
  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id);
  (progressRows ?? []).forEach((r) => completed.add(r.lesson_id));

  return (data ?? []).map((row) => {
    const course = row.courses;
    const lessons = (course.modules ?? [])
      .flatMap((m) => m.lessons ?? [])
      .sort((a, b) => a.position - b.position);
    const nextLesson = lessons.find((l) => !completed.has(l.id));
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle ?? "",
      hero_image_url: course.hero_image_url,
      total_lessons: lessons.length,
      completed_lessons: lessons.filter((l) => completed.has(l.id)).length,
      next_lesson_slug: nextLesson?.slug ?? null,
      enrolled_at: row.enrolled_at,
    };
  });
}
