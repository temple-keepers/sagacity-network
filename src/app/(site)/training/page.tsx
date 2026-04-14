"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  Code2,
  ShieldCheck,
  Bot,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const PROGRAMMES = [
  {
    icon: Code2,
    title: "Full-Stack Web Development",
    format: "8-week bootcamp",
    level: "Beginner to Intermediate",
    body: "From HTML to production-grade Next.js apps. Covers React, TypeScript, Supabase, authentication, deployment, and everything in between.",
    topics: [
      "React & Next.js App Router",
      "TypeScript fundamentals",
      "Database design with Supabase",
      "Authentication & authorisation",
      "API design & integration",
      "Deployment on Vercel",
    ],
    gradient: "linear-gradient(135deg, #5B2D8E 0%, #7B3FA0 100%)",
  },
  {
    icon: Bot,
    title: "AI & Business Automation",
    format: "4-week intensive",
    level: "Intermediate",
    body: "Build AI-powered tools and workflow automations using Claude API, n8n, and Make. Real projects, real deployments — not demos.",
    topics: [
      "Claude API & prompt engineering",
      "n8n & Make workflow design",
      "WhatsApp & Telegram bots",
      "Document processing with AI",
      "CRM & email automation",
      "Custom API integrations",
    ],
    gradient: "linear-gradient(135deg, #2D8E6E 0%, #3DA882 100%)",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity Fundamentals",
    format: "6-week programme",
    level: "All levels",
    body: "Security awareness training, OWASP Top 10, penetration testing basics, and incident response. Ideal for developers and non-technical staff alike.",
    topics: [
      "OWASP Top 10 vulnerabilities",
      "Web application security testing",
      "Network security fundamentals",
      "Incident response planning",
      "Security monitoring & logging",
      "Staff awareness & phishing defence",
    ],
    gradient: "linear-gradient(135deg, #8E2D2D 0%, #A04040 100%)",
  },
  {
    icon: BarChart3,
    title: "Data & Analytics",
    format: "4-week course",
    level: "Beginner to Intermediate",
    body: "Power BI, SQL, and data storytelling. Learn to build dashboards that executives actually use and data pipelines that don't break.",
    topics: [
      "SQL & database querying",
      "Power BI dashboard design",
      "Data visualisation principles",
      "ETL & data pipeline basics",
      "KPI tracking & reporting",
      "Executive data storytelling",
    ],
    gradient: "linear-gradient(135deg, #C9A84C 0%, #A88B3D 100%)",
  },
];

const FORMATS = [
  {
    icon: Users,
    title: "Corporate Training",
    body: "Custom curriculum tailored to your team's stack and skill gaps. On-site or remote delivery. Includes assessments and certification.",
  },
  {
    icon: Code2,
    title: "Developer Bootcamps",
    body: "Intensive cohort-based programmes with hands-on projects, code reviews, and mentorship. Limited to 15 per cohort.",
  },
  {
    icon: Clock,
    title: "On-Demand Courses",
    body: "Self-paced video courses with exercises, quizzes, and community access. Learn on your own schedule.",
  },
];

export default function TrainingPage() {
  return (
    <div className="pt-[120px] pb-20">
      {/* Hero */}
      <div className="max-w-site section-px mb-20">
        <ScrollReveal>
          <span
            className="text-[12px] font-[500] tracking-[0.12em] uppercase mb-5 block"
            style={{ color: "var(--color-accent)" }}
          >
            Training & Academy
          </span>
          <h1
            className="text-[40px] md:text-[56px] font-[800] tracking-[-0.03em] leading-[1.1] mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Learn from people who{" "}
            <span
              className="text-gradient-gold"
              style={{ WebkitTextFillColor: "transparent" }}
            >
              build.
            </span>
          </h1>
          <p
            className="text-[17px] font-[300] leading-[1.7] max-w-[560px]"
            style={{ color: "var(--color-muted)" }}
          >
            Practitioner-led training in web development, AI, cybersecurity, and
            data. Every session is hands-on, project-based, and taught by
            engineers who ship production code daily.
          </p>
        </ScrollReveal>
      </div>

      {/* Delivery formats */}
      <section
        className="py-16 md:py-20"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-site section-px">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FORMATS.map((f, i) => {
              const Icon = f.icon;
              return (
                <ScrollReveal key={f.title} delay={i * 80}>
                  <div
                    className="p-7 h-full"
                    style={{
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center mb-4"
                      style={{
                        background: "rgba(123, 63, 160, 0.08)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-accent)",
                      }}
                    >
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <h3
                      className="text-[18px] font-[700] mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-[14px] font-[300] leading-[1.7]"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {f.body}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="py-20 md:py-28" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-site section-px">
          <ScrollReveal>
            <h2
              className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-12"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Programmes
            </h2>
          </ScrollReveal>

          <div className="flex flex-col gap-8">
            {PROGRAMMES.map((p, i) => {
              const Icon = p.icon;
              return (
                <ScrollReveal key={p.title} delay={i * 60}>
                  <div
                    className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 p-7 md:p-9"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    {/* Left - Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 flex items-center justify-center"
                          style={{
                            background: p.gradient,
                            borderRadius: "var(--radius-sm)",
                            color: "#FFFFFF",
                          }}
                        >
                          <Icon size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                          <h3
                            className="text-[20px] font-[700]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {p.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <span
                          className="tag-purple px-3 py-1 text-[11px]"
                          style={{ borderRadius: "var(--radius-sm)" }}
                        >
                          {p.format}
                        </span>
                        <span
                          className="px-3 py-1 text-[11px]"
                          style={{
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-muted)",
                          }}
                        >
                          {p.level}
                        </span>
                      </div>

                      <p
                        className="text-[14px] font-[300] leading-[1.7]"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {p.body}
                      </p>
                    </div>

                    {/* Right - Topics */}
                    <div>
                      <h4
                        className="text-[13px] font-[600] uppercase tracking-[0.06em] mb-4"
                        style={{ color: "var(--color-muted)" }}
                      >
                        What you&apos;ll learn
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {p.topics.map((t) => (
                          <li
                            key={t}
                            className="flex items-start gap-2 text-[13px]"
                          >
                            <CheckCircle2
                              size={15}
                              className="flex-shrink-0 mt-0.5"
                              style={{ color: "var(--color-accent)" }}
                            />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="glow-orb glow-orb-gold w-[300px] h-[300px] bottom-[-100px] right-[15%] opacity-15" />
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
                upskill?
              </span>
            </h2>
            <p
              className="text-[16px] font-[300] leading-[1.7] mb-10 max-w-[440px] mx-auto"
              style={{ color: "rgba(240, 236, 244, 0.55)" }}
            >
              Whether it&apos;s your whole team or just you — we&apos;ll build a
              programme that fits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="shimmer-btn inline-block px-10 py-4 text-[14px] font-[500] tracking-[0.02em] transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "var(--gradient-purple)",
                  color: "#FFFFFF",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Enquire about training
              </Link>
              <Link
                href="/assessment"
                className="inline-block px-10 py-4 text-[14px] font-[500] tracking-[0.02em] transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid rgba(240, 236, 244, 0.2)",
                  color: "#F0ECF4",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Take the free assessment
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
