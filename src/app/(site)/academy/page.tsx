import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { listPublishedCourses } from "@/lib/academy/queries";
import CourseCard from "@/components/academy/CourseCard";

export const revalidate = 60; // ISR: refresh every 60s

export const metadata: Metadata = {
  title: "Academy \u2014 Sagacity Network",
  description:
    "Self-paced courses on AI, automation, and business intelligence \u2014 built for small business owners.",
};

export default async function AcademyCatalogPage() {
  if (!isAcademyEnabled()) notFound();

  const courses = await listPublishedCourses();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Hero band */}
      <section
        className="relative overflow-hidden section-glow-top"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-site section-px py-20 md:py-28 text-center relative z-10">
          <span
            className="inline-block text-[12px] font-[500] tracking-[0.12em] uppercase mb-4"
            style={{ color: "#D4B85A" }}
          >
            Sagacity Academy
          </span>
          <h1
            className="text-[40px] md:text-[56px] font-[800] tracking-display mb-5 max-w-[760px] mx-auto"
            style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
          >
            Practical training that{" "}
            <span className="text-gradient-gold" style={{ WebkitTextFillColor: "transparent" }}>
              pays for itself.
            </span>
          </h1>
          <p
            className="text-[16px] md:text-[18px] font-[300] leading-[1.7] max-w-[560px] mx-auto"
            style={{ color: "rgba(240, 236, 244, 0.7)" }}
          >
            Self-paced courses on AI, automation, and business intelligence — every lesson
            designed to be applied the same day you learn it.
          </p>
        </div>
      </section>

      {/* Catalog grid */}
      <section className="section-surface py-20">
        <div className="max-w-site section-px">
          {courses.length === 0 ? (
            <div
              className="max-w-[480px] mx-auto text-center p-10 rounded-[12px] shadow-border"
              style={{ background: "var(--surface-0)" }}
            >
              <h2
                className="text-[22px] font-[700] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                First courses dropping soon.
              </h2>
              <p className="text-[14px]" style={{ color: "var(--color-muted)" }}>
                We&apos;re polishing the first three courses right now. Check back next week.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
