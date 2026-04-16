import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { getPreviewLesson } from "@/lib/academy/queries";
import BlockRenderer from "@/components/academy/BlockRenderer";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = await getPreviewLesson(slug, lessonSlug);
  if (!lesson) return { title: "Not found" };
  return {
    title: `${lesson.title} \u2014 Free preview \u2014 ${lesson.course.title}`,
    description: lesson.summary,
    robots: { index: true, follow: true },
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default async function PreviewLessonPage({ params }: Props) {
  if (!isAcademyEnabled()) notFound();

  const { slug, lessonSlug } = await params;
  const lesson = await getPreviewLesson(slug, lessonSlug);
  if (!lesson) notFound();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header band */}
      <section
        className="border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--surface-0)" }}
      >
        <div className="max-w-site section-px py-6">
          <Link
            href={`/academy/${lesson.course.slug}`}
            className="text-[13px] mb-3 inline-block"
            style={{ color: "var(--color-muted)" }}
          >
            ← {lesson.course.title}
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-[11px] px-2 py-0.5 rounded-[4px] font-[600] tracking-[0.04em] uppercase"
              style={{ background: "rgba(201, 168, 76, 0.15)", color: "#C9A84C" }}
            >
              Free preview
            </span>
            <span className="text-[12px]" style={{ color: "var(--color-muted)" }}>
              Module {lesson.module.position + 1} · {lesson.module.title}
            </span>
            <span className="text-[12px]" style={{ color: "var(--color-muted)" }}>
              · {formatDuration(lesson.duration_minutes)}
            </span>
          </div>
          <h1
            className="text-[28px] md:text-[36px] font-[800] tracking-heading mt-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {lesson.title}
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="py-12">
        <div className="max-w-site section-px">
          <article className="max-w-[720px] mx-auto">
            <BlockRenderer blocks={lesson.body} isPreview={true} />
          </article>
        </div>
      </section>

      {/* Enrol CTA */}
      <section className="section-elevated py-14">
        <div className="max-w-site section-px">
          <div
            className="max-w-[560px] mx-auto text-center p-8 rounded-[14px] shadow-border"
            style={{ background: "var(--surface-0)" }}
          >
            <h2
              className="text-[22px] md:text-[26px] font-[800] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Enjoyed that? Keep going.
            </h2>
            <p className="text-[15px] mb-6" style={{ color: "var(--color-muted)" }}>
              That was the free preview. Enrol to unlock the rest of {lesson.course.title}.
            </p>
            <Link
              href={`/academy/${lesson.course.slug}`}
              className="inline-block px-6 py-3 text-[14px] font-[500] rounded-[8px]"
              style={{ background: "var(--gradient-purple)", color: "#fff" }}
            >
              See the full course
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
