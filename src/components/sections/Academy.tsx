"use client";

import { useState } from "react";
import RevealWrapper from "@/components/ui/RevealWrapper";
import Button from "@/components/ui/Button";
import {
  LIVE_COURSES,
  EVERGREEN_COURSES,
  COURSE_CATEGORIES,
} from "@/lib/data/courses";

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
        className="course-card relative overflow-hidden rounded-[2px] flex flex-col h-full p-5 md:p-7"
        style={{
          background: course.hot ? "var(--gold-dim)" : "var(--bg-card)",
          border: `1px solid ${
            course.hot ? "var(--gold-border)" : "var(--border)"
          }`,
        }}
      >
        {/* Accent line */}
        {course.hot && (
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: course.accent }}
          />
        )}

        <div className="flex-grow">
          {/* Tag + hot badge */}
          <div className="flex justify-between items-start mb-3">
            <span
              className="text-[9px] tracking-[0.16em] uppercase font-bold px-2.5 py-1 rounded-[2px]"
              style={{
                color: course.accent,
                border: `1px solid ${course.accent}33`,
                background: `${course.accent}10`,
              }}
            >
              {course.tag}
            </span>
            {course.hot && (
              <span className="text-[9px] font-extrabold tracking-[0.1em] uppercase px-2 py-1 rounded-[2px] bg-gold text-bg-primary">
                Booking Now
              </span>
            )}
          </div>

          {/* Title + desc */}
          <h3 className="font-display text-[20px] font-light text-text-primary leading-[1.3] mb-2.5">
            {course.title}
          </h3>
          <p className="text-[13px] text-text-secondary font-light leading-[1.7] mb-5">
            {course.description}
          </p>
        </div>

        {/* Bottom: price/format + CTA */}
        <div>
          <div className="grid grid-cols-2 gap-2 py-3 border-t border-border-line mb-3">
            <div>
              <div
                className="font-display text-[26px] font-semibold leading-none"
                style={{ color: course.accent }}
              >
                {course.price}
              </div>
              <div className="text-[11px] text-text-muted mt-1">
                {course.format}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-text-primary font-medium">
                {course.date}
              </div>
              <div
                className="text-[11px] mt-1 font-medium"
                style={{ color: course.accent }}
              >
                {course.seats ? `${course.seats} seats` : "Org-wide delivery"}
              </div>
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
            {course.hot ? `Book Now \u2014 ${course.price}` : "Register Interest"}
          </a>
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
        className="course-card relative overflow-hidden rounded-[2px] flex flex-col h-full p-6 md:p-8"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-50"
          style={{ background: course.accent }}
        />

        <div className="flex-grow">
          {/* Tag + badge */}
          <div className="flex justify-between items-start mb-3">
            <span
              className="text-[9px] tracking-[0.16em] uppercase font-bold px-2.5 py-1 rounded-[2px]"
              style={{
                color: course.accent,
                border: `1px solid ${course.accent}33`,
                background: `${course.accent}10`,
              }}
            >
              On-Demand
            </span>
            {course.badge && (
              <span
                className="text-[9px] font-extrabold tracking-[0.1em] uppercase px-2.5 py-1 rounded-[2px]"
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

          {/* Title */}
          <h3 className="font-display text-[21px] font-light text-text-primary leading-[1.3] mb-2">
            {course.title}
          </h3>
        </div>

        {/* Bottom */}
        <div>
          <div className="flex gap-4 items-center py-2.5 border-t border-border-line mb-3">
            <span
              className="text-[11px] font-semibold"
              style={{ color: course.accent }}
            >
              {"\u25CF"} {course.level}
            </span>
            <span className="text-[11px] text-text-muted">
              {course.lessons} lessons
            </span>
            <span className="text-[11px] text-text-muted">
              {course.hours}h
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span
              className="font-display text-[28px] font-semibold"
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
      {/* Subtle purple tint */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(109,40,217,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="max-container relative z-10">
        {/* Header */}
        <RevealWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[2px] mb-5 border border-gold-border bg-gold-dim">
                <span className="text-[11px] tracking-[0.16em] text-gold uppercase font-semibold">
                  Sagacity Academy
                </span>
              </div>
              <h2>
                Taught by People
                <br />
                <em className="text-gold italic">Who Actually Build.</em>
              </h2>
            </div>
            <div>
              <p className="text-[15px] text-text-secondary font-light leading-[1.8] mb-6">
                We don&apos;t teach AI theory. We use these tools every day to
                build real platforms for real clients — and we teach from that
                experience.
              </p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { v: "6+", l: "Courses" },
                  { v: "Live", l: "Workshops" },
                  { v: "\u00A327", l: "Entry Point" },
                  { v: "CPD", l: "Eligible" },
                ].map((stat) => (
                  <div
                    key={stat.l}
                    className="px-4 py-2.5 border border-border-line rounded-[2px] text-center min-w-[68px]"
                  >
                    <div className="font-display text-[22px] font-semibold text-gold leading-none">
                      {stat.v}
                    </div>
                    <div className="text-[9px] text-text-muted tracking-[0.1em] uppercase mt-1">
                      {stat.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealWrapper>

        {/* Live & Upcoming header */}
        <RevealWrapper>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="pulse-dot" />
              <span className="font-display text-[24px] font-light text-text-primary">
                Live &amp; Upcoming
              </span>
            </div>
            <a
              href="#contact"
              className="text-[12px] text-purple font-medium tracking-[0.08em] border-b border-purple/30 pb-0.5"
            >
              Request Corporate Training &rarr;
            </a>
          </div>
        </RevealWrapper>

        {/* Live courses grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {LIVE_COURSES.map((course, i) => (
            <LiveCourseCard key={course.slug} course={course} index={i} />
          ))}
        </div>

        {/* On-Demand header */}
        <RevealWrapper>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-purple rotate-45 rounded-[1px]" />
              <span className="font-display text-[24px] font-light text-text-primary">
                On-Demand Courses
              </span>
            </div>
            <span className="text-[12px] text-text-muted">
              Lifetime access &middot; Certificate on completion &middot; CPD
              eligible
            </span>
          </div>
        </RevealWrapper>

        {/* Category filter */}
        <RevealWrapper delay={60}>
          <div className="flex gap-2.5 mb-8 flex-wrap">
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
                  color:
                    filter === cat ? "#FFFFFF" : "var(--purple)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </RevealWrapper>

        {/* Evergreen courses grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {filtered.map((course, i) => (
            <EvergreenCourseCard
              key={course.slug}
              course={course}
              index={i}
            />
          ))}
        </div>

        {/* Academy CTA strip */}
        <RevealWrapper delay={100}>
          <div
            className="rounded-[2px] p-6 md:p-10 lg:p-14 border border-gold-border"
            style={{ background: "rgba(212,175,55,0.03)" }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h3 className="font-display text-[26px] font-light text-text-primary mb-2">
                  Not sure where to start?{" "}
                  <em className="text-gold italic">
                    Let&apos;s find the right course for you.
                  </em>
                </h3>
                <p className="text-[14px] text-text-secondary font-light leading-[1.6]">
                  Tell us about your business and goals — we&apos;ll point you
                  to the right place.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Button href="#contact">Get a Recommendation</Button>
                <Button href="#contact" variant="outline">
                  Corporate Enquiry
                </Button>
              </div>
            </div>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
