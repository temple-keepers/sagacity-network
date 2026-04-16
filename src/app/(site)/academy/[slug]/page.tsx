import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { getCourseBySlug } from "@/lib/academy/queries";
import CurriculumAccordion from "@/components/academy/CurriculumAccordion";
import FaqSection from "@/components/academy/FaqSection";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Not found" };
  return {
    title: `${course.title} \u2014 Sagacity Academy`,
    description: course.subtitle,
  };
}

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `\u00a3${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default async function CourseLandingPage({ params }: Props) {
  if (!isAcademyEnabled()) notFound();

  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const firstPreview = course.modules
    .flatMap((m) => m.lessons.map((l) => ({ module: m, lesson: l })))
    .find(({ lesson }) => lesson.is_free_preview);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden section-glow-top"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-site section-px py-16 md:py-20 relative z-10">
          <Link
            href="/academy"
            className="inline-block text-[13px] mb-6"
            style={{ color: "rgba(240, 236, 244, 0.6)" }}
          >
            ← All courses
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-start">
            <div>
              <span
                className="inline-block px-3 py-1 text-[11px] tracking-[0.08em] uppercase mb-4 rounded-[6px]"
                style={{ background: "rgba(201, 168, 76, 0.15)", color: "#C9A84C" }}
              >
                {course.level}
              </span>
              <h1
                className="text-[36px] md:text-[48px] font-[800] tracking-display mb-4"
                style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
              >
                {course.title}
              </h1>
              <p
                className="text-[17px] font-[300] leading-[1.6] max-w-[620px]"
                style={{ color: "rgba(240, 236, 244, 0.75)" }}
              >
                {course.subtitle}
              </p>
              <div
                className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-[13px]"
                style={{ color: "rgba(240, 236, 244, 0.55)" }}
              >
                <span>{course.modules.length} modules</span>
                <span>·</span>
                <span>{lessonCount} lessons</span>
                <span>·</span>
                <span>{formatDuration(course.duration_minutes)}</span>
                <span>·</span>
                <span>Lifetime access</span>
              </div>
            </div>

            <div
              className="p-6 rounded-[14px]"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                className="text-[32px] font-[800] mb-4"
                style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
              >
                {formatPrice(course.price_cents)}
              </div>
              <button
                type="button"
                disabled
                className="w-full px-5 py-3 text-[14px] font-[500] rounded-[8px] mb-3 cursor-not-allowed"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(240, 236, 244, 0.5)",
                }}
              >
                Enrol — coming soon
              </button>
              {firstPreview ? (
                <Link
                  href={`/academy/${course.slug}/preview/${firstPreview.lesson.slug}`}
                  className="block w-full px-5 py-3 text-[14px] font-[500] rounded-[8px] text-center"
                  style={{ background: "var(--gradient-purple)", color: "#fff" }}
                >
                  Try free lesson
                </Link>
              ) : null}
              <p
                className="text-[12px] text-center mt-4"
                style={{ color: "rgba(240, 236, 244, 0.45)" }}
              >
                14-day refund. Lifetime access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="section-surface py-14">
        <div className="max-w-site section-px">
          <div className="max-w-[720px]">
            <h2
              className="text-[24px] md:text-[28px] font-[700] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              About this course
            </h2>
            <p
              className="text-[16px] leading-[1.75] whitespace-pre-wrap"
              style={{ color: "var(--color-muted)" }}
            >
              {course.description}
            </p>
          </div>
        </div>
      </section>

      {/* Instructor */}
      {course.instructor_name ? (
        <section className="section-elevated py-14">
          <div className="max-w-site section-px">
            <div
              className="max-w-[720px] p-6 rounded-[14px] shadow-border"
              style={{ background: "var(--surface-0)" }}
            >
              <div
                className="text-[11px] tracking-[0.12em] uppercase mb-2"
                style={{ color: "var(--color-accent)" }}
              >
                Your instructor
              </div>
              <h3
                className="text-[22px] font-[700] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {course.instructor_name}
              </h3>
              {course.instructor_bio ? (
                <p
                  className="text-[15px] leading-[1.7]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {course.instructor_bio}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Curriculum */}
      <section className="section-surface py-14">
        <div className="max-w-site section-px">
          <h2
            className="text-[24px] md:text-[28px] font-[700] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Curriculum
          </h2>
          <CurriculumAccordion courseSlug={course.slug} modules={course.modules} />
        </div>
      </section>

      {/* FAQ */}
      <section className="section-elevated py-14">
        <div className="max-w-site section-px max-w-[760px]">
          <h2
            className="text-[24px] md:text-[28px] font-[700] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Frequently asked questions
          </h2>
          <FaqSection />
        </div>
      </section>
    </div>
  );
}
