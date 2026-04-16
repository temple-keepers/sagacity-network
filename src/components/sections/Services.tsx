"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Code2, BarChart3, Bot, ShieldCheck, GraduationCap } from "lucide-react";

const SERVICES = [
  {
    icon: Code2,
    title: "Web & App Development",
    body: "Full-stack platforms and mobile-ready web apps built to production standard.",
    tags: ["Next.js", "React", "TypeScript", "Supabase"],
    gradient: "from-purple-500/10 to-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Data & Programme Intelligence",
    body: "Power BI dashboards and capital programme tooling that makes your data actionable.",
    tags: ["Power BI", "Dashboards", "KPI Tracking"],
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: Bot,
    title: "Business Automation & AI",
    body: "WhatsApp bots, workflow automation, and Claude-powered tools that save hours weekly.",
    tags: ["Claude API", "n8n", "Make", "WhatsApp"],
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity",
    body: "Security audits, penetration testing, monitoring, and staff training. Certified.",
    tags: ["Audits", "Pen Testing", "Monitoring"],
    gradient: "from-red-500/10 to-rose-500/10",
  },
  {
    icon: GraduationCap,
    title: "Training & Workshops",
    body: "Live workshops, cohort programmes, and on-demand courses in AI, security, and data.",
    tags: ["AI Workshops", "Corporate", "CPD"],
    gradient: "from-violet-500/10 to-purple-500/10",
  },
];

export default function Services() {
  return (
    <section
      className="relative py-24 md:py-32 section-glow-top section-elevated"
    >
      <div className="max-w-site section-px">
        <ScrollReveal>
          <div className="mb-14">
            <span
              className="text-[12px] font-[500] tracking-[0.12em] uppercase mb-4 block"
              style={{ color: "var(--color-accent)" }}
            >
              Services
            </span>
            <h2
              className="text-[32px] md:text-[42px] font-[800] tracking-heading md:tracking-display mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything you need.
              <br />
              <span className="text-gradient-gold" style={{ WebkitTextFillColor: "transparent" }}>
                One studio.
              </span>
            </h2>
            <p
              className="text-[16px] font-[300] leading-[1.7] max-w-[480px]"
              style={{ color: "var(--color-muted)" }}
            >
              Five disciplines under one roof — so your product, data, security,
              and team all move together.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={s.title} delay={i * 80}>
                <Link
                  href="/services"
                  className={`group block p-7 md:p-8 card-premium ${
                    i === SERVICES.length - 1 && SERVICES.length % 2 !== 0
                      ? "md:col-span-2 md:max-w-[calc(50%-10px)] md:mx-auto"
                      : ""
                  }`}
                  style={{
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-16 h-16 flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "rgba(123, 63, 160, 0.08)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--color-accent)",
                    }}
                  >
                    <Icon size={32} strokeWidth={1.5} />
                  </div>

                  <h3
                    className="text-[20px] font-[700] mb-2 text-center transition-colors duration-300 group-hover:text-[var(--color-accent)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-[14px] font-[400] leading-[1.7] mb-5 text-center"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {s.body}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="tag-purple px-2.5 py-1 text-[11px]" style={{ borderRadius: "var(--radius-sm)" }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Hover arrow */}
                  <div
                    className="mt-5 text-[13px] font-[500] flex items-center justify-center gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Learn more <span className="text-[16px]">&rarr;</span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
