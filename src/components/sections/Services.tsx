"use client";

import Link from "next/link";

const SERVICES = [
  {
    num: "01",
    title: "Web & App Development",
    body: "Full-stack platforms and mobile-ready web apps built to production standard. From a five-page site to a full SaaS platform.",
    tags: ["Next.js", "React", "TypeScript", "Supabase"],
  },
  {
    num: "02",
    title: "Data & Programme Intelligence",
    body: "Enterprise-grade reporting, Power BI dashboards, and capital programme tooling that makes your data visible and actionable.",
    tags: ["Power BI", "Dashboards", "KPI Tracking", "Reporting"],
  },
  {
    num: "03",
    title: "Business Automation & AI",
    body: "WhatsApp bots, workflow automation, document generation, and Claude-powered tools that give your team hours back every week.",
    tags: ["Claude API", "n8n", "Make", "WhatsApp"],
  },
  {
    num: "04",
    title: "Cybersecurity",
    body: "Security audits, monthly monitoring, penetration testing, and staff training. Delivered by a certified specialist.",
    tags: ["Audits", "Pen Testing", "Monitoring", "Training"],
  },
  {
    num: "05",
    title: "Training & Workshops",
    body: "Live workshops, cohort programmes, and on-demand courses. AI, cybersecurity, Power BI, and digital foundations.",
    tags: ["AI Workshops", "Corporate", "CPD Eligible"],
  },
];

export default function Services() {
  return (
    <section className="py-20 md:py-28" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-site section-px">
        <h2
          className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-12"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What we build
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICES.map((s, i) => (
            <Link
              key={s.num}
              href="/services"
              className={`group block p-7 transition-all duration-200 ${
                i === SERVICES.length - 1 && SERVICES.length % 2 !== 0
                  ? "md:col-span-2 md:max-w-[calc(50%-8px)] md:mx-auto"
                  : ""
              }`}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                borderLeft: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeft = "3px solid var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeft = "1px solid var(--color-border)";
              }}
            >
              <div
                className="text-[11px] font-[800] tracking-[0.12em] mb-3"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}
              >
                {s.num}
              </div>
              <h3
                className="text-[20px] font-[600] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.title}
              </h3>
              <p className="text-[15px] font-[400] leading-[1.65] mb-4" style={{ color: "var(--color-muted)" }}>
                {s.body}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-[11px]"
                    style={{
                      background: "var(--color-bg)",
                      color: "var(--color-ink)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
