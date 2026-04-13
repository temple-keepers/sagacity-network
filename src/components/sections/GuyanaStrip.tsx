"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function GuyanaStrip() {
  return (
    <section
      className="relative py-24 md:py-32 section-glow-top overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-site section-px">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <ScrollReveal>
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] tracking-[0.04em] mb-6"
                style={{
                  border: "1px solid rgba(201, 168, 76, 0.4)",
                  color: "#C9A84C",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(201, 168, 76, 0.06)",
                }}
              >
                {"\uD83C\uDDEC\uD83C\uDDFE"} Guyana & Caribbean
              </div>
              <h2
                className="text-[32px] md:text-[42px] font-[800] tracking-[-0.03em] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Built for{" "}
                <span className="text-gradient-gold" style={{ WebkitTextFillColor: "transparent" }}>
                  Guyana.
                </span>
              </h2>
              <p
                className="text-[16px] font-[300] leading-[1.7] mb-8 max-w-[460px]"
                style={{ color: "var(--color-muted)" }}
              >
                Professional websites, secured from day one, live in 5 days.
                Built by people who understand the diaspora and the world
                you&apos;re trying to reach.
              </p>

              {/* Quick features */}
              <div className="flex flex-col gap-3 mb-8">
                {["Website live in 5 days", "Security included from day one", "Ongoing support & training"].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(123, 63, 160, 0.1)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-accent)",
                        fontSize: "11px",
                      }}
                    >
                      &#10003;
                    </div>
                    <span className="text-[14px]" style={{ color: "var(--color-muted)" }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/guyana"
                className="shimmer-btn inline-block px-7 py-3.5 text-[13px] font-[500] tracking-[0.04em] transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "var(--gradient-purple)",
                  color: "#FFFFFF",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                See the Guyana offer
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div
              className="relative w-full aspect-square max-w-[360px] mx-auto lg:mx-0 flex items-center justify-center"
              style={{
                background: "var(--gradient-hero)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {/* Decorative elements */}
              <div
                className="absolute w-[200px] h-[200px] rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, rgba(201, 168, 76, 0.5), transparent)" }}
              />
              <div
                className="text-[80px]"
                style={{ animation: "float 5s ease-in-out infinite" }}
              >
                {"\uD83C\uDDEC\uD83C\uDDFE"}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
