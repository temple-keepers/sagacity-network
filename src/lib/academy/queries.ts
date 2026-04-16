import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Block } from "./schema";

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  hero_image_url: string | null;
  price_cents: number;
  level: string;
  duration_minutes: number;
  module_count: number;
  lesson_count: number;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  duration_minutes: number;
  is_free_preview: boolean;
  position: number;
}

export interface ModuleWithLessons {
  id: string;
  title: string;
  summary: string;
  position: number;
  lessons: LessonSummary[];
}

export interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  hero_image_url: string | null;
  price_cents: number;
  level: string;
  duration_minutes: number;
  instructor_name: string;
  instructor_bio: string | null;
  modules: ModuleWithLessons[];
}

export interface LessonPreview {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: Block[];
  duration_minutes: number;
  course: { slug: string; title: string };
  module: { title: string; position: number };
}

export interface LearnLesson {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: Block[];
  duration_minutes: number;
  is_free_preview: boolean;
  position: number;
  course: { id: string; slug: string; title: string };
  module: { id: string; title: string; position: number };
  prevLessonSlug: string | null;
  nextLessonSlug: string | null;
}

/**
 * Returns published courses for the /academy catalog.
 * RLS filters to status='published' automatically for anon role.
 */
export async function listPublishedCourses(): Promise<CourseSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id, slug, title, subtitle, hero_image_url, price_cents, level, duration_minutes,
      modules:modules ( id, lessons:lessons ( id ) )
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle ?? "",
    hero_image_url: c.hero_image_url,
    price_cents: c.price_cents,
    level: c.level ?? "beginner",
    duration_minutes: c.duration_minutes ?? 0,
    module_count: c.modules?.length ?? 0,
    lesson_count:
      c.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0,
  }));
}

/**
 * Returns one published course with its module tree + lesson summaries (no bodies).
 * Null if not found OR not published (RLS blocks drafts from anon reads).
 */
export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id, slug, title, subtitle, description, hero_image_url, price_cents, level,
      duration_minutes, instructor_name, instructor_bio,
      modules:modules (
        id, title, summary, position,
        lessons:lessons ( id, slug, title, summary, duration_minutes, is_free_preview, position )
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const modules: ModuleWithLessons[] = (data.modules ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      id: m.id,
      title: m.title,
      summary: m.summary ?? "",
      position: m.position,
      lessons: (m.lessons ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          summary: l.summary ?? "",
          duration_minutes: l.duration_minutes ?? 0,
          is_free_preview: l.is_free_preview,
          position: l.position,
        })),
    }));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle ?? "",
    description: data.description ?? "",
    hero_image_url: data.hero_image_url,
    price_cents: data.price_cents,
    level: data.level ?? "beginner",
    duration_minutes: data.duration_minutes ?? 0,
    instructor_name: data.instructor_name ?? "",
    instructor_bio: data.instructor_bio,
    modules,
  };
}

/**
 * Returns a lesson only when is_free_preview=true. RLS also enforces this for
 * anon; the explicit filter here is defense-in-depth.
 */
export async function getPreviewLesson(
  courseSlug: string,
  lessonSlug: string
): Promise<LessonPreview | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      `
      id, slug, title, summary, body, duration_minutes, is_free_preview,
      modules!inner (
        title, position,
        courses!inner ( slug, title, status )
      )
    `
    )
    .eq("slug", lessonSlug)
    .eq("is_free_preview", true)
    .eq("modules.courses.slug", courseSlug)
    .eq("modules.courses.status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const mod = Array.isArray(data.modules) ? data.modules[0] : data.modules;
  const course = Array.isArray(mod.courses) ? mod.courses[0] : mod.courses;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? "",
    body: (data.body as Block[]) ?? [],
    duration_minutes: data.duration_minutes ?? 0,
    course: { slug: course.slug, title: course.title },
    module: { title: mod.title, position: mod.position },
  };
}

/**
 * Returns a lesson only when the signed-in user can read it (RLS enforces).
 * Also computes prev/next lesson slugs within the course, in ordered position.
 */
export async function getLessonForLearn(
  courseSlug: string,
  lessonSlug: string
): Promise<LearnLesson | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("lessons")
    .select(
      `
      id, slug, title, summary, body, duration_minutes, is_free_preview, position, module_id,
      modules!inner (
        id, title, position,
        courses!inner ( id, slug, title, status )
      )
    `
    )
    .eq("slug", lessonSlug)
    .eq("modules.courses.slug", courseSlug)
    .eq("modules.courses.status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const mod = Array.isArray(data.modules) ? data.modules[0] : data.modules;
  const course = Array.isArray(mod.courses) ? mod.courses[0] : mod.courses;

  // Walk all lessons in order to find prev/next
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("slug, position, module_id, modules!inner(position, courses!inner(slug))")
    .eq("modules.courses.slug", courseSlug)
    .order("position", { ascending: true });

  const ordered = (allLessons ?? [])
    .slice()
    .sort((a, b) => {
      const ma = Array.isArray(a.modules) ? a.modules[0] : a.modules;
      const mb = Array.isArray(b.modules) ? b.modules[0] : b.modules;
      if (ma.position !== mb.position) return ma.position - mb.position;
      return a.position - b.position;
    })
    .map((l) => l.slug);

  const idx = ordered.indexOf(lessonSlug);

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? "",
    body: (data.body as Block[]) ?? [],
    duration_minutes: data.duration_minutes ?? 0,
    is_free_preview: data.is_free_preview,
    position: data.position,
    course: { id: course.id, slug: course.slug, title: course.title },
    module: { id: mod.id, title: mod.title, position: mod.position },
    prevLessonSlug: idx > 0 ? ordered[idx - 1] : null,
    nextLessonSlug: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
  };
}
