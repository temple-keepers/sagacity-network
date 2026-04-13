"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  Code2,
  BarChart3,
  Bot,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const SERVICES = [
  {
    icon: Code2,
    title: "Web & App Development",
    slug: "web-dev",
    hero: "Ship production-grade digital products — fast.",
    body: "We build full-stack web applications, mobile-ready platforms, and custom SaaS products. From concept to deployment, every project ships with CI/CD, monitoring, and a scalable architecture you can grow on.",
    deliverables: [
      "Next.js / React production apps",
      "Supabase & PostgreSQL backends",
      "REST & GraphQL APIs",
      "Mobile-responsive PWAs",
      "CI/CD pipelines & Vercel deployment",
      "Performance audits & optimisation",
    ],
    tags: ["Next.js", "React", "TypeScript", "Supabase", "Vercel"],
    gradient: "linear-gradient(135deg, #5B2D8E 0%, #7B3FA0 100%)",
  },
  {
    icon: BarChart3,
    title: "Data & Programme Intelligence",
    slug: "data",
    hero: "Turn raw data into decisions your board can act on.",
    body: "We design dashboards, reporting systems, and capital programme tooling that makes your data visible and actionable. Whether it's Power BI, custom analytics, or programme-level KPI tracking — we make numbers tell the story.",
    deliverables: [
      "Power BI dashboards & reports",
      "Custom analytics platforms",
      "KPI tracking & programme dashboards",
      "Data pipeline design",
      "ETL workflows & automation",
      "Executive reporting systems",
    ],
    tags: ["Power BI", "Dashboards", "KPI Tracking", "ETL", "Analytics"],
    gradient: "linear-gradient(135deg, #C9A84C 0%, #A88B3D 100%)",
  },
  {
    icon: Bot,
    title: "Business Automation & AI",
    slug: "automation",
    hero: "Automate the work that slows your team down.",
    body: "From WhatsApp bots and CRM workflows to Claude-powered AI assistants — we build automations that save hours every week. Connect your tools, eliminate manual steps, and let your team focus on what matters.",
    deliverables: [
      "WhatsApp & Telegram bots",
      "Claude / GPT-powered AI tools",
      "n8n & Make workflow automation",
      "CRM & email automation",
      "Document processing pipelines",
      "Custom API integrations",
    ],
    tags: ["Claude API", "n8n", "Make", "WhatsApp", "AI Assistants"],
    gradient: "linear-gradient(135deg, #2D8E6E 0%, #3DA882 100%)",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity",
    slug: "security",
    hero: "Protect what you've built — before someone else tests it.",
    body: "We run security audits, penetration tests, and vulnerability assessments for web applications and infrastructure. We also build security monitoring, incident response plans, and train your team to stay sharp.",
    deliverables: [
      "Web application penetration testing",
      "Infrastructure security audits",
      "Vulnerability assessments & reports",
      "Security monitoring setup",
      "Incident response planning",
      "Staff security awareness training",
    ],
    tags: ["Pen Testing", "Audits", "Monitoring", "OWASP", "Compliance"],
    gradient: "linear-gradient(135deg, #8E2D2D 0%, #A04040 100%)",
  },
  {
    icon: GraduationCap,
    title: "Training & Workshops",
    slug: "training",
    hero: "Upskill your team with practitioners, not lecturers.",
    body: "Live workshops, cohort-based programmes, and on-demand courses in web development, AI, data, and cybersecurity. Every session is hands-on, practical, and taught by people who build production systems daily.",
    deliverables: [
      "Corporate team training",
      "Developer bootcamps",
      "AI & automation workshops",
      "Cybersecurity awareness sessions",
      "On-demand video courses",
      "Certification preparation",
    ],
    tags: ["Workshops", "Corporate", "Bootcamps", "CPD", "AI Training"],
    gradient: "linear-gradient(135deg, #5B2D8E 0%, #7B3FA0 100%)",
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-[120px] pb-20">
      {/* Hero */}
      <div className="max-w-site section-px mb-20">
        <ScrollReveal>
          <span
            className="text-[12px] font-[500] tracking-[0.12em] uppercase mb-5 block"
            style={{ color: "var(--color-accent)" }}
          >
            Services
          </span>
          <h1
            className="text-[40px] md:text-[56px] font-[800] tracking-[-0.03em] leading-[1.1] mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need.
            <br />
            <span
              className="text-gradient-gold"
              style={{ WebkitTextFillColor: "transparent" }}
            >
              One studio.
            </span>
          </h1>
          <p
            className="text-[17px] font-[300] leading-[1.7] max-w-[560px]"
            style={{ color: "var(--color-muted)" }}
          >
            Five disciplines under one roof — so your product, data, security,
            and team all move together. No handoffs between agencies, no lost
            context.
          </p>
        </ScrollReveal>
      </div>

      {/* Service blocks */}
      <div className="flex flex-col gap-0">
        {SERVICES.map((s, i) => {
          const Icon = s.icon;
          const even = i % 2 === 0;
          return (
            <section
              key={s.slug}
              id={s.slug}
              className="relative py-20 md:py-28 overflow-hidden"
              style={{
                background: even
                  ? "var(--color-bg)"
                  : "var(--color-surface)",
              }}
            >
              <div className="max-w-site section-px">
                <ScrollReveal>
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start ${
                      !even ? "lg:direction-rtl" : ""
                    }`}
                  >
                    {/* Content */}
                    <div style={{ direction: "ltr" }}>
                      <div
                        className="w-12 h-12 flex items-center justify-center mb-6"
                        style={{
                          background: s.gradient,
                          borderRadius: "var(--radius-sm)",
                          color: "#FFFFFF",
                        }}
                      >
                        <Icon size={24} strokeWidth={1.8} />
                      </div>

                      <h2
                        className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-3"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s.title}
                      </h2>
                      <p
                        className="text-[18px] font-[400] mb-4"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--color-accent)",
                        }}
                      >
                        {s.hero}
                      </p>
                      <p
                        className="text-[15px] font-[300] leading-[1.75] mb-8"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {s.body}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {s.tags.map((t) => (
                          <span
                            key={t}
                            className="tag-purple px-3 py-1.5 text-[11px]"
                            style={{ borderRadius: "var(--radius-sm)" }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-5">
                        <Link
                          href={`/services/${s.slug}`}
                          className="inline-flex items-center gap-2 text-[14px] font-[500] transition-opacity hover:opacity-80"
                          style={{ color: "var(--color-accent)" }}
                        >
                          Learn more <ArrowRight size={16} />
                        </Link>
                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 text-[14px] font-[500] transition-opacity hover:opacity-80"
                          style={{ color: "var(--color-muted)" }}
                        >
                          Discuss this service
                        </Link>
                      </div>
                    </div>

                    {/* Deliverables card */}
                    <div
                      className="p-7 md:p-9"
                      style={{
                        direction: "ltr",
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <h3
                        className="text-[16px] font-[600] mb-5 uppercase tracking-[0.06em]"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--color-muted)",
                        }}
                      >
                        What you get
                      </h3>
                      <ul className="flex flex-col gap-4">
                        {s.deliverables.map((d) => (
                          <li
                            key={d}
                            className="flex items-start gap-3 text-[14px] leading-[1.5]"
                          >
                            <CheckCircle2
                              size={18}
                              className="flex-shrink-0 mt-0.5"
                              style={{ color: "var(--color-accent)" }}
                            />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="glow-orb glow-orb-purple w-[400px] h-[400px] top-[-100px] right-[10%] opacity-20" />
        <div className="max-w-site section-px relative z-10 text-center">
          <ScrollReveal>
            <h2
              className="text-[32px] md:text-[44px] font-[800] tracking-[-0.03em] mb-5"
              style={{
                fontFamily: "var(--font-display)",
                color: "#F0ECF4",
              }}
            >
              Ready to{" "}
              <span
                className="text-gradient-gold"
                style={{ WebkitTextFillColor: "transparent" }}
              >
                start?
              </span>
            </h2>
            <p
              className="text-[16px] font-[300] leading-[1.7] mb-10 max-w-[440px] mx-auto"
              style={{ color: "rgba(240, 236, 244, 0.55)" }}
            >
              Tell us what you need. We'll come back with a plan and a fixed
              quote — no surprises.
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
              Get in touch
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
