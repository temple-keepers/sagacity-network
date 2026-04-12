"use client";

import Link from "next/link";
import RevealWrapper from "@/components/ui/RevealWrapper";
import Button from "@/components/ui/Button";
import type { PORTFOLIO } from "@/lib/data/portfolio";

type Project = (typeof PORTFOLIO)[number];

export default function CaseStudyContent({ project }: { project: Project }) {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: project.bg,
          padding: "160px 24px 100px",
        }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 30%, ${project.accent}12 0%, transparent 70%)`,
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${project.accent}40 1px, transparent 1px), linear-gradient(90deg, ${project.accent}40 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="max-container relative z-10">
          <RevealWrapper>
            {/* Back link */}
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-[12px] tracking-[0.08em] uppercase mb-10 transition-colors duration-300 hover:opacity-80"
              style={{ color: project.accent }}
            >
              &larr; All Projects
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
              <div>
                <div
                  className="text-[11px] tracking-[0.16em] uppercase font-semibold mb-4"
                  style={{ color: project.accent }}
                >
                  {project.category}
                </div>
                <h1
                  className="font-display text-[clamp(48px,6vw,80px)] font-light leading-[1.05] mb-4"
                  style={{ color: "#F5F0E8" }}
                >
                  {project.name}
                </h1>
                <p
                  className="font-display text-[20px] italic"
                  style={{ color: `${project.accent}CC` }}
                >
                  {project.tagline}
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:items-end">
                <Button href={project.url} external>
                  Visit Live Platform &rarr;
                </Button>
              </div>
            </div>
          </RevealWrapper>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${project.accent}, transparent)`,
          }}
        />
      </section>

      {/* Problem / Solution / Outcome */}
      <section
        className="section-padding relative"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="max-container">
          <RevealWrapper>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                { label: "The Problem", text: project.problem },
                { label: "The Solution", text: project.solution },
                { label: "The Outcome", text: project.description },
              ].map((block, i) => (
                <div
                  key={block.label}
                  className="rounded-[2px] p-8 lg:p-10 relative"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[2px]"
                    style={{
                      background: project.accent,
                      opacity: 0.5 + i * 0.2,
                    }}
                  />

                  <div
                    className="text-[11px] tracking-[0.16em] uppercase font-semibold mb-4"
                    style={{ color: project.accent }}
                  >
                    {block.label}
                  </div>
                  <p className="text-[14px] text-text-secondary font-light leading-[1.8]">
                    {block.text}
                  </p>
                </div>
              ))}
            </div>
          </RevealWrapper>
        </div>
      </section>

      {/* Tech Stack + Features */}
      <section
        className="section-padding relative"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="max-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Tech Stack */}
            <RevealWrapper>
              <div>
                <h3
                  className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-8"
                  style={{ color: project.accent }}
                >
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-3">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-5 py-2.5 text-[13px] font-medium tracking-[0.04em] rounded-[2px] transition-colors duration-300"
                      style={{
                        border: `1.5px solid ${project.accent}33`,
                        color: project.accent,
                        background: `${project.accent}08`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </RevealWrapper>

            {/* Key Features */}
            <RevealWrapper delay={100}>
              <div>
                <h3
                  className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-8"
                  style={{ color: project.accent }}
                >
                  Key Features
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {project.features.map((feature, i) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 p-4 rounded-[2px]"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          background: `${project.accent}18`,
                          color: project.accent,
                          border: `1px solid ${project.accent}30`,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-text-primary font-light">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="section-padding relative"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="max-container">
          <RevealWrapper>
            <div
              className="rounded-[2px] p-10 lg:p-14 border"
              style={{ borderColor: `${project.accent}25` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                  <h3 className="font-display text-[clamp(24px,3vw,34px)] font-light text-text-primary mb-2">
                    Want something like{" "}
                    <em style={{ color: project.accent }} className="italic">
                      {project.name}?
                    </em>
                  </h3>
                  <p className="text-[14px] text-text-secondary font-light leading-[1.7]">
                    Tell us about your project &mdash; we&apos;ll show you
                    what&apos;s possible.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Button href="/#contact">Start a Conversation</Button>
                  <Button href="/work" variant="outline">
                    View All Work
                  </Button>
                </div>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </section>
    </>
  );
}
