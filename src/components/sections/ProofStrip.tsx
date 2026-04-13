"use client";

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ScrollReveal from "@/components/ui/ScrollReveal";

const STATS = [
  { value: 5, suffix: "", label: "Live platforms shipped" },
  { value: 2, suffix: "", label: "Expert founders" },
  { value: 11, suffix: "+", label: "Years enterprise experience" },
  { value: 5, suffix: "", label: "Services, one studio" },
];

export default function ProofStrip() {
  return (
    <section
      className="relative section-glow-top"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-site section-px py-12 md:py-16">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`text-center ${i > 0 ? "md:border-l" : ""}`}
                style={{ borderColor: "var(--color-border)" }}
              >
                <div
                  className="text-[36px] md:text-[44px] font-[800] leading-none mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span className="text-gradient-purple">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </span>
                </div>
                <div
                  className="text-[12px] tracking-[0.04em]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
