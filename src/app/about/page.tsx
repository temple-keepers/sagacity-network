"use client";

import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowRight } from "lucide-react";

const VALUES = [
  {
    title: "Practitioner-led",
    body: "Every person on our team builds production systems daily. We don't outsource, we don't offshore, we don't hand you a PDF and walk away.",
  },
  {
    title: "End-to-end ownership",
    body: "Design, development, security, deployment, and ongoing support — all under one roof. No handoffs, no lost context.",
  },
  {
    title: "Built to last",
    body: "We write code that future engineers will thank us for. Clean architecture, proper testing, thorough documentation.",
  },
  {
    title: "Diaspora-connected",
    body: "We understand the Caribbean diaspora because we're part of it. Our platforms serve communities from Georgetown to London.",
  },
];

const TIMELINE = [
  {
    year: "2023",
    title: "Founded in London",
    body: "Sagacity Network launched with a focus on web development and cybersecurity consulting for SMEs.",
  },
  {
    year: "2024",
    title: "Platform portfolio grows",
    body: "Launched Temple Keepers, Rhythm & Roots, and Totenga — three live platforms serving real communities.",
  },
  {
    year: "2025",
    title: "AI & Automation expansion",
    body: "Added business automation and AI services. Began corporate training programmes for enterprise clients.",
  },
  {
    year: "2026",
    title: "Guyana & Caribbean",
    body: "Expanded operations to serve businesses in Guyana and across the Caribbean with localised packages.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-[120px] pb-20">
      {/* Hero */}
      <div className="max-w-site section-px mb-20">
        <ScrollReveal>
          <span
            className="text-[12px] font-[500] tracking-[0.12em] uppercase mb-5 block"
            style={{ color: "var(--color-accent)" }}
          >
            About
          </span>
          <h1
            className="text-[40px] md:text-[56px] font-[800] tracking-[-0.03em] leading-[1.1] mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built by{" "}
            <span
              className="text-gradient-purple"
              style={{ WebkitTextFillColor: "transparent" }}
            >
              practitioners.
            </span>
          </h1>
          <p
            className="text-[17px] font-[300] leading-[1.7] max-w-[600px]"
            style={{ color: "var(--color-muted)" }}
          >
            Sagacity Network is a UK-based digital product studio. We build web
            applications, data systems, automations, and security infrastructure
            for organisations that need things done properly.
          </p>
        </ScrollReveal>
      </div>

      {/* Founder section */}
      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-site section-px">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-12 lg:gap-20 items-center">
              <div
                className="relative w-full max-w-[280px] mx-auto lg:mx-0 aspect-square overflow-hidden flex items-center justify-center"
                style={{
                  background: "var(--gradient-hero)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <Image
                  src="/logo-tree.png"
                  alt="Sagacity Network"
                  width={120}
                  height={120}
                  className="opacity-60"
                />
              </div>
              <div>
                <h2
                  className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Our story
                </h2>
                <p
                  className="text-[15px] font-[300] leading-[1.8] mb-4"
                  style={{ color: "var(--color-muted)" }}
                >
                  Sagacity Network was founded to bridge the gap between
                  aesthetic design and robust engineering. Too many agencies
                  deliver beautiful mockups that fall apart in production — or
                  solid backends wrapped in generic templates.
                </p>
                <p
                  className="text-[15px] font-[300] leading-[1.8]"
                  style={{ color: "var(--color-muted)" }}
                >
                  We do both. Every project ships with production-grade
                  architecture, proper security, and design that reflects the
                  ambition of the people behind it. We work with SMEs, startups,
                  and enterprise teams across the UK, Guyana, and the Caribbean
                  diaspora.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-site section-px">
          <ScrollReveal>
            <h2
              className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-12"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What we{" "}
              <span
                className="text-gradient-gold"
                style={{ WebkitTextFillColor: "transparent" }}
              >
                stand for.
              </span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 80}>
                <div
                  className="p-7 md:p-9 h-full"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <h3
                    className="text-[20px] font-[700] mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {v.title}
                  </h3>
                  <p
                    className="text-[14px] font-[300] leading-[1.7]"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {v.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-site section-px">
          <ScrollReveal>
            <h2
              className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-12"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Our journey.
            </h2>
          </ScrollReveal>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px"
              style={{ background: "var(--color-border)" }}
            />

            <div className="flex flex-col gap-10">
              {TIMELINE.map((t, i) => (
                <ScrollReveal key={t.year} delay={i * 100}>
                  <div className="flex items-start gap-6 md:gap-8 relative">
                    {/* Dot */}
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 z-10 text-[12px] md:text-[13px] font-[600]"
                      style={{
                        background: "var(--color-accent)",
                        color: "#FFFFFF",
                        borderRadius: "50%",
                      }}
                    >
                      {t.year.slice(2)}
                    </div>
                    <div className="pt-1">
                      <span
                        className="text-[12px] font-[500] tracking-[0.08em] uppercase mb-1 block"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {t.year}
                      </span>
                      <h3
                        className="text-[20px] font-[700] mb-2"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {t.title}
                      </h3>
                      <p
                        className="text-[14px] font-[300] leading-[1.7] max-w-[480px]"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {t.body}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="glow-orb glow-orb-purple w-[400px] h-[400px] top-[-100px] left-[20%] opacity-20" />
        <div className="max-w-site section-px relative z-10 text-center">
          <ScrollReveal>
            <h2
              className="text-[32px] md:text-[44px] font-[800] tracking-[-0.03em] mb-5"
              style={{
                fontFamily: "var(--font-display)",
                color: "#F0ECF4",
              }}
            >
              Let&apos;s build{" "}
              <span
                className="text-gradient-gold"
                style={{ WebkitTextFillColor: "transparent" }}
              >
                together.
              </span>
            </h2>
            <p
              className="text-[16px] font-[300] leading-[1.7] mb-10 max-w-[440px] mx-auto"
              style={{ color: "rgba(240, 236, 244, 0.55)" }}
            >
              Whether you need a product built, a system secured, or a team
              trained — we&apos;re ready.
            </p>
            <Link
              href="/contact"
              className="shimmer-btn inline-block px-10 py-4 text-[14px] font-[500] tracking-[0.02em] transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--gradient-purple)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Get in touch <ArrowRight size={16} className="inline ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
