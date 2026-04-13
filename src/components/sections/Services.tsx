"use client";

import { useState } from "react";
import Link from "next/link";
import RevealWrapper from "@/components/ui/RevealWrapper";
import { SERVICES } from "@/lib/data/services";

export default function Services() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="services"
      className="section-padding"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-container">
        {/* Header */}
        <RevealWrapper>
          <div className="mb-12">
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-5">
              Services
            </div>
            <h2>
              What We
              <em className="text-gold italic"> Deliver.</em>
            </h2>
          </div>
        </RevealWrapper>

        {/* Service rows */}
        <div className="border-t border-border-line">
          {SERVICES.map((service, i) => (
            <RevealWrapper key={service.slug} delay={i * 60}>
              <Link
                href={`/services#${service.slug}`}
                className="group block grid grid-cols-[1fr] md:grid-cols-[60px_1fr_auto] gap-3 md:gap-8 items-center py-6 md:py-8 border-b border-border-line transition-all duration-[400ms]"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  paddingLeft: hovered === i ? 12 : 0,
                  background:
                    hovered === i
                      ? "rgba(212, 175, 55, 0.02)"
                      : "transparent",
                }}
              >
                {/* Number */}
                <div
                  className="font-display text-[32px] md:text-[40px] font-light leading-none transition-colors duration-300 hidden md:block"
                  style={{
                    color:
                      hovered === i
                        ? "var(--gold)"
                        : "rgba(245, 240, 232, 0.15)",
                  }}
                >
                  {service.number}
                </div>

                {/* Title + description */}
                <div>
                  <h3
                    className="font-display text-[20px] md:text-[22px] lg:text-[26px] font-light mb-1.5 transition-colors duration-300"
                    style={{
                      color:
                        hovered === i
                          ? "var(--gold)"
                          : "var(--text-primary)",
                    }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-[13px] lg:text-[14px] text-text-secondary font-light leading-[1.75] max-w-[560px]">
                    {service.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="hidden lg:flex gap-2 flex-wrap justify-end max-w-[240px]">
                  {service.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[10px] tracking-[0.06em] rounded-[2px] whitespace-nowrap transition-colors duration-300"
                      style={{
                        border: "1px solid var(--gold-border)",
                        color:
                          hovered === i
                            ? "var(--gold)"
                            : "var(--text-muted)",
                        background:
                          hovered === i
                            ? "var(--gold-dim)"
                            : "transparent",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
