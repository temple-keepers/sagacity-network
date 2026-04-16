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

export interface AdminEnrolmentRow {
  id: string;
  enrolled_at: string;
  status: "active" | "refunded" | "expired";
  amount_paid_cents: number;
  stripe_session_id: string | null;
  learner_name: string | null;
  learner_email: string;
  course_id: string;
  course_title: string;
  total_lessons: number;
  completed_lessons: number;
}

export interface AdminEnrolmentStats {
  total: number;
  revenueThisMonthPence: number;
  activeLearners: number;
}

/**
 * Admin listing. Uses service role via createClient; RLS bypassed.
 * Caller must enforce admin auth separately (done in the console layout).
 */
export async function getAdminEnrolments(): Promise<{
  rows: AdminEnrolmentRow[];
  stats: AdminEnrolmentStats;
}> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service env vars missing");
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: enrols, error } = await db
    .from("enrollments")
    .select(
      `id, enrolled_at, status, amount_paid_cents, stripe_session_id, user_id,
       courses!inner ( id, title, modules ( lessons ( id ) ) )`
    )
    .order("enrolled_at", { ascending: false });
  if (error) throw error;

  // gather user emails via admin.getUserById per unique user id
  const userIds = Array.from(new Set((enrols ?? []).map((e) => e.user_id)));
  const userMap = new Map<string, { name: string | null; email: string }>();
  for (const id of userIds) {
    const { data } = await db.auth.admin.getUserById(id);
    if (data?.user) {
      userMap.set(id, {
        name: (data.user.user_metadata?.full_name as string) ?? null,
        email: data.user.email ?? "unknown",
      });
    }
  }

  // progress counts per (user, course)
  const { data: progressRows } = await db
    .from("lesson_progress")
    .select(
      "user_id, lesson_id, lessons!inner(module_id, modules!inner(course_id))"
    );
  const progressMap = new Map<string, number>(); // key: user_id|course_id
  for (const row of progressRows ?? []) {
    const lessonsRef = row.lessons as
      | { modules: { course_id: string } | { course_id: string }[] }
      | { modules: { course_id: string } | { course_id: string }[] }[]
      | null;
    const lessonsObj = Array.isArray(lessonsRef) ? lessonsRef[0] : lessonsRef;
    const modulesObj = lessonsObj
      ? Array.isArray(lessonsObj.modules)
        ? lessonsObj.modules[0]
        : lessonsObj.modules
      : null;
    const courseId = modulesObj?.course_id;
    if (!courseId) continue;
    const k = `${row.user_id}|${courseId}`;
    progressMap.set(k, (progressMap.get(k) ?? 0) + 1);
  }

  const rows: AdminEnrolmentRow[] = (enrols ?? []).map((e) => {
    const courseRef = Array.isArray(e.courses) ? e.courses[0] : e.courses;
    const totalLessons = (courseRef?.modules ?? []).reduce(
      (s: number, m: { lessons?: { id: string }[] }) =>
        s + (m.lessons?.length ?? 0),
      0
    );
    const u = userMap.get(e.user_id) ?? { name: null, email: "unknown" };
    return {
      id: e.id,
      enrolled_at: e.enrolled_at,
      status: e.status as "active" | "refunded" | "expired",
      amount_paid_cents: e.amount_paid_cents ?? 0,
      stripe_session_id: e.stripe_session_id,
      learner_name: u.name,
      learner_email: u.email,
      course_id: courseRef.id,
      course_title: courseRef.title,
      total_lessons: totalLessons,
      completed_lessons: progressMap.get(`${e.user_id}|${courseRef.id}`) ?? 0,
    };
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const stats: AdminEnrolmentStats = {
    total: rows.length,
    revenueThisMonthPence: rows
      .filter((r) => r.status === "active" && r.enrolled_at >= monthStart)
      .reduce((s, r) => s + r.amount_paid_cents, 0),
    activeLearners: new Set(
      rows.filter((r) => r.status === "active").map((r) => r.learner_email)
    ).size,
  };

  return { rows, stats };
}
