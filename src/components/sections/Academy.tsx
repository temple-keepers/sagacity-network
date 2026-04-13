"use client";

import { useState } from "react";
import RevealWrapper from "@/components/ui/RevealWrapper";
import Button from "@/components/ui/Button";
import {
  LIVE_COURSES,
  EVERGREEN_COURSES,
  COURSE_CATEGORIES,
} from "@/lib/data/courses";

/* Visual icon mapping for course topics */
const COURSE_ICONS: Record<string, string> = {
  "AI & Automation": "⟡",
  Cybersecurity: "⬢",
  "Data & Reporting": "◈",
  "Caribbean & Guyana": "◎",
};

function LiveCourseCard({
  course,
  index,
}: {
  course: (typeof LIVE_COURSES)[0];
  index: number;
}) {
  return (
    <RevealWrapper delay={index * 60}>
      <div
        className="course-card relative overflow-hidden rounded-[2px] flex flex-col h-full"
        style={{
          background: course.hot ? "var(--gold-dim)" : "var(--bg-card)",
          border: `1px solid ${
            course.hot ? "var(--gold-border)" : "var(--border)"
          }`,
        }}
      >
        {/* Accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: course.accent, opacity: course.hot ? 1 : 0.4 }}
        />

        {/* Decorative graphic area */}
        <div
          className="relative flex items-center justify-center py-8 md:py-10"
          style={{
            background: `linear-gradient(135deg, ${course.accent}08 0%, ${course.accent}03 100%)`,
          }}
        >
          <span
            className="text-[48px] md:text-[56px] leading-none opacity-20"
            style={{ color: course.accent }}
          >
            {COURSE_ICONS[course.category] || "⟡"}
          </span>
          {course.hot && (
            <span className="absolute top-3 right-3 text-[9px] font-extrabold tracking-[0.1em] uppercase px-2.5 py-1 rounded-[2px] bg-gold text-bg-primary">
              Booking Now
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-5 md:p-6">
          <div className="flex-grow">
            <span
              className="text-[9px] tracking-[0.16em] uppercase font-bold"
              style={{ color: course.accent }}
            >
              {course.tag}
            </span>
            <h3 className="font-display text-[19px] md:text-[21px] font-light text-text-primary leading-[1.3] mt-2 mb-4">
              {course.title}
            </h3>
          </div>

          {/* Price + CTA */}
          <div className="pt-4 border-t border-border-line">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span
                  className="font-display text-[24px] font-semibold"
                  style={{ color: course.accent }}
                >
                  {course.price}
                </span>
                <span className="text-[11px] text-text-muted ml-2">
                  {course.format}
                </span>
              </div>
            </div>
            <a
              href={course.bookingUrl}
              target={
                course.bookingUrl.startsWith("http") ? "_blank" : undefined
              }
              rel="noopener noreferrer"
              className="block text-center py-2.5 text-[11px] font-bold tracking-[0.1em] uppercase rounded-[2px] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: course.hot ? "var(--gold)" : "transparent",
                border: `1.5px solid ${course.accent}`,
                color: course.hot ? "var(--bg-primary)" : course.accent,
              }}
            >
              {course.hot ? "Book Now" : "Register Interest"}
            </a>
          </div>
        </div>
      </div>
    </RevealWrapper>
  );
}

function EvergreenCourseCard({
  course,
  index,
}: {
  course: (typeof EVERGREEN_COURSES)[0];
  index: number;
}) {
  const badgeColors: Record<string, string> = {
    Bestseller: "#D4AF37",
    New: "#34D399",
    Bundle: "#9F7AEA",
    "Coming Soon": "rgba(245,240,232,0.15)",
  };

  return (
    <RevealWrapper delay={index * 50}>
      <div
        className="course-card relative overflow-hidden rounded-[2px] flex flex-col h-full"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-40"
          style={{ background: course.accent }}
        />

        {/* Decorative graphic area */}
        <div
          className="relative flex items-center justify-center py-8 md:py-10"
          style={{
            background: `linear-gradient(135deg, ${course.accent}06 0%, transparent 100%)`,
          }}
        >
          <span
            className="text-[48px] md:text-[56px] leading-none opacity-15"
            style={{ color: course.accent }}
          >
            {COURSE_ICONS[course.category] || "⟡"}
          </span>
          {course.badge && (
            <span
              className="absolute top-3 right-3 text-[9px] font-extrabold tracking-[0.1em] uppercase px-2.5 py-1 rounded-[2px]"
              style={{
                background: badgeColors[course.badge] || "var(--border)",
                color:
                  course.badge === "Coming Soon"
                    ? "var(--text-muted)"
                    : "#FFFFFF",
              }}
            >
              {course.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-5 md:p-6">
          <div className="flex-grow">
            <h3 className="font-display text-[19px] md:text-[21px] font-light text-text-primary leading-[1.3] mb-3">
              {course.title}
            </h3>
            <div className="flex gap-3 items-center text-[11px] text-text-muted">
              <span>{course.lessons} lessons</span>
              <span className="opacity-30">|</span>
              <span>{course.hours}h</span>
              <span className="opacity-30">|</span>
              <span style={{ color: course.accent }}>{course.level}</span>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex justify-between items-center pt-5 mt-5 border-t border-border-line">
            <span
              className="font-display text-[26px] font-semibold"
              style={{ color: course.accent }}
            >
              {course.price}
            </span>
            <a
              href="#contact"
              className="px-5 py-2 text-[11px] font-bold tracking-[0.1em] uppercase rounded-[2px] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                border: `1.5px solid ${course.accent}`,
                color: course.accent,
                background: "transparent",
              }}
            >
              {course.badge === "Coming Soon" ? "Notify Me" : "Enrol"}
            </a>
          </div>
        </div>
      </div>
    </RevealWrapper>
  );
}

export default function Academy() {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? EVERGREEN_COURSES
      : EVERGREEN_COURSES.filter((c) => c.category === filter);

  return (
    <section
      id="training"
      className="section-padding relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-container relative z-10">
        {/* Header */}
        <RevealWrapper>
          <div className="mb-12">
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-5">
              Academy
            </div>
            <h2>
              Learn From
              <em className="text-gold italic"> Practitioners.</em>
            </h2>
          </div>
        </RevealWrapper>

        {/* Live & Upcoming */}
        <RevealWrapper>
          <div className="flex items-center gap-3 mb-8">
            <span className="pulse-dot" />
            <span className="font-display text-[22px] font-light text-text-primary">
              Live &amp; Upcoming
            </span>
          </div>
        </RevealWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {LIVE_COURSES.map((course, i) => (
            <LiveCourseCard key={course.slug} course={course} index={i} />
          ))}
        </div>

        {/* On-Demand */}
        <RevealWrapper>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2.5 h-2.5 bg-purple rotate-45 rounded-[1px]" />
            <span className="font-display text-[22px] font-light text-text-primary">
              On-Demand
            </span>
          </div>
        </RevealWrapper>

        {/* Category filter */}
        <RevealWrapper delay={60}>
          <div className="flex gap-2.5 mb-10 flex-wrap">
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-1.5 text-[11px] font-medium tracking-[0.08em] rounded-[2px] cursor-pointer transition-all duration-200"
                style={{
                  background:
                    filter === cat ? "var(--purple)" : "transparent",
                  border: `1.5px solid ${
                    filter === cat
                      ? "var(--purple)"
                      : "rgba(159,122,234,0.25)"
                  }`,
                  color: filter === cat ? "#FFFFFF" : "var(--purple)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </RevealWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {filtered.map((course, i) => (
            <EvergreenCourseCard
              key={course.slug}
              course={course}
              index={i}
            />
          ))}
        </div>

        {/* CTA */}
        <RevealWrapper delay={100}>
          <div
            className="rounded-[2px] p-8 md:p-12 border border-gold-border text-center"
            style={{ background: "rgba(212,175,55,0.03)" }}
          >
            <h3 className="font-display text-[clamp(22px,2.5vw,30px)] font-light text-text-primary mb-6">
              Not sure where to start?
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="#contact">Get a Recommendation</Button>
              <Button href="#contact" variant="outline">
                Corporate Enquiry
              </Button>
            </div>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
