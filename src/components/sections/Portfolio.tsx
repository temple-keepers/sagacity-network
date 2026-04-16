"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

const PLATFORMS = [
  {
    name: "Temple Keepers",
    desc: "Faith & wellness platform with AI devotionals, fasting cohorts, and community pods.",
    url: "https://templekeepers.app",
    gradient: "linear-gradient(135deg, #5B2D8E 0%, #7B3FA0 100%)",
    emoji: "\u26EA",
  },
  {
    name: "Rhythm & Roots",
    desc: "Cultural discovery platform connecting the Guyanese diaspora with events and creators.",
    url: "https://rhythmnroots.app",
    gradient: "linear-gradient(135deg, #C9A84C 0%, #A88B3D 100%)",
    emoji: "\uD83C\uDFB6",
  },
  {
    name: "Totenga",
    desc: "Community-powered platform bringing people together through shared experiences and connection.",
    url: "https://totenga.com",
    gradient: "linear-gradient(135deg, #3D8E6E 0%, #2D6E52 100%)",
    emoji: "\uD83C\uDF10",
  },
];

export default function Portfolio() {
  return (
    <section
      className="relative py-24 md:py-32 section-glow-top overflow-hidden section-surface"
    >
      {/* Background glow */}
      <div
        className="glow-orb glow-orb-purple w-[500px] h-[500px] -bottom-[200px] -right-[200px] opacity-10"
      />

      <div className="max-w-site section-px relative z-10">
        <ScrollReveal>
          <div className="mb-14">
            <span
              className="text-[12px] font-[500] tracking-[0.12em] uppercase mb-4 block"
              style={{ color: "var(--color-accent)" }}
            >
              Portfolio
            </span>
            <h2
              className="text-[32px] md:text-[42px] font-[800] tracking-heading md:tracking-display mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Not mockups.{" "}
              <span className="text-gradient-purple" style={{ WebkitTextFillColor: "transparent" }}>
                Live products.
              </span>
            </h2>
            <p
              className="text-[16px] font-[300] leading-[1.7] max-w-[480px]"
              style={{ color: "var(--color-muted)" }}
            >
              Every platform below is live, serving real users, and built
              end-to-end by our team.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {PLATFORMS.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 100}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block card-hover shadow-border overflow-hidden"
                style={{
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-0)",
                }}
              >
                {/* Gradient header */}
                <div
                  className="h-[140px] flex items-center justify-center relative overflow-hidden"
                  style={{ background: p.gradient }}
                >
                  <span className="text-[56px] transition-transform duration-500 group-hover:scale-125">
                    {p.emoji}
                  </span>
                  {/* Shine overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                    }}
                  />
                </div>

                <div className="p-6">
                  <h3
                    className="text-[20px] font-[700] mb-2 transition-colors duration-300 group-hover:text-[var(--color-accent)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="text-[14px] leading-[1.65] mb-5"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {p.desc}
                  </p>
                  <span
                    className="text-[13px] font-[500] flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all duration-300"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Visit platform <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  </span>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="text-center">
            <Link
              href="/work"
              className="link-underline text-[14px] font-[500] transition-opacity hover:opacity-80"
              style={{ color: "var(--color-accent)" }}
            >
              View all platforms &rarr;
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
