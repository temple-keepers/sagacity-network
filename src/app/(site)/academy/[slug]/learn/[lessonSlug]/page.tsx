import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { getCourseBySlug, getLessonForLearn } from "@/lib/academy/queries";
import {
  hasActiveEnrolment,
  getCompletedLessonIds,
} from "@/lib/academy/enrollment-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import BlockRenderer from "@/components/academy/BlockRenderer";
import LessonSidebar from "@/components/academy/LessonSidebar";
import LessonProgressBar from "@/components/academy/LessonProgressBar";
import LessonControls from "./LessonControls";

export const revalidate = 0; // always fresh for enrolled learners

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = await getLessonForLearn(slug, lessonSlug);
  if (!lesson) return { title: "Not found", robots: { index: false } };
  return {
    title: `${lesson.title} — ${lesson.course.title} — Sagacity Academy`,
    description: lesson.summary,
    robots: { index: false, follow: false },
  };
}

export default async function LearnLessonPage({ params }: Props) {
  if (!isAcademyEnabled()) notFound();

  const { slug, lessonSlug } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/academy/${slug}/learn/${lessonSlug}`);
  }

  const [lesson, course] = await Promise.all([
    getLessonForLearn(slug, lessonSlug),
    getCourseBySlug(slug),
  ]);
  if (!course) notFound();

  const enrolled = await hasActiveEnrolment(course.id);

  // If the lesson row came back null, it's either not found or RLS-blocked.
  if (!lesson || (!lesson.is_free_preview && !enrolled)) {
    redirect(`/academy/${slug}?enrol=needed`);
  }

  const completed = await getCompletedLessonIds(course.id);
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = completed.size;
  const isCompleted = completed.has(lesson.id);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <section
        className="border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--surface-0)" }}
      >
        <div className="max-w-site section-px py-6">
          <Link
            href={`/academy/my-learning`}
            className="text-[13px] mb-3 inline-block"
            style={{ color: "var(--color-muted)" }}
          >
            ← My Learning
          </Link>
          <h1
            className="text-[28px] md:text-[36px] font-[800] tracking-heading mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {lesson.title}
          </h1>
          <LessonProgressBar completed={completedCount} total={totalLessons} />
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-site section-px">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
            <LessonSidebar
              courseSlug={course.slug}
              courseTitle={course.title}
              modules={course.modules}
              currentLessonSlug={lesson.slug}
              completedLessonIds={completed}
              isEnrolled={enrolled}
              learnMode={true}
            />
            <article className="max-w-[720px] min-w-0">
              <BlockRenderer
                blocks={lesson.body}
                isPreview={false}
                isEnrolled={enrolled}
              />
              <LessonControls
                lessonId={lesson.id}
                alreadyCompleted={isCompleted}
                prevHref={
                  lesson.prevLessonSlug
                    ? `/academy/${slug}/learn/${lesson.prevLessonSlug}`
                    : null
                }
                nextHref={
                  lesson.nextLessonSlug
                    ? `/academy/${slug}/learn/${lesson.nextLessonSlug}`
                    : null
                }
              />
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
