"use client";

import { useState } from "react";
import Link from "next/link";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { PORTFOLIO } from "@/lib/data/portfolio";

export default function Portfolio() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="work" className="section-padding relative overflow-hidden">
      {/* Gradient bg: primary → secondary → primary */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)",
        }}
      />

      <div className="max-container relative z-10">
        {/* Header */}
        <RevealWrapper>
          <div className="mb-14">
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-5">
              Our Platforms
            </div>
            <h2>
              Live. Functional.
              <br />
              <em className="text-gold italic">Production Ready.</em>
            </h2>
          </div>
        </RevealWrapper>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PORTFOLIO.map((project, i) => {
            const isHovered = hovered === i;

            return (
              <RevealWrapper key={project.slug} delay={i * 80}>
                <Link
                  href={`/work/${project.slug}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative rounded-[2px] overflow-hidden block course-card"
                  style={{
                    padding: "40px 36px",
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: isHovered
                      ? "var(--bg-card-hover)"
                      : "var(--bg-card)",
                    border: `1px solid ${
                      isHovered
                        ? project.accent + "30"
                        : "var(--border)"
                    }`,
                    transform: isHovered
                      ? "translateY(-4px)"
                      : "none",
                    cursor: "pointer",
                  }}
                >
                  {/* Accent line top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${project.accent}, transparent)`,
                      opacity: isHovered ? 1 : 0,
                    }}
                  />

                  {/* Top content */}
                  <div>
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <div
                          className="text-[10px] tracking-[0.14em] uppercase mb-2 font-semibold"
                          style={{ color: project.accent }}
                        >
                          {project.category}
                        </div>
                        <h3 className="font-display text-[32px] lg:text-[38px] font-light text-text-primary leading-none">
                          {project.name}
                        </h3>
                      </div>

                      {/* External link */}
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] shrink-0 transition-all duration-300 hover:scale-110"
                        style={{
                          border: `1.5px solid ${project.accent}33`,
                          color: project.accent,
                          background: isHovered
                            ? project.accent + "15"
                            : "transparent",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        &#8599;
                      </a>
                    </div>

                    <p className="text-[14px] text-text-secondary font-light leading-[1.78] mb-7 max-w-[480px]">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech pills */}
                  <div className="flex gap-2 flex-wrap">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 text-[10px] tracking-[0.05em] rounded-[2px] transition-colors duration-300"
                        style={{
                          border: `1px solid ${project.accent}22`,
                          color: isHovered
                            ? project.accent
                            : "var(--text-muted)",
                          background: isHovered
                            ? project.accent + "10"
                            : "transparent",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              </RevealWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
