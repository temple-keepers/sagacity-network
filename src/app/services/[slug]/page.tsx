import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code2,
  BarChart3,
  Bot,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import type { Metadata } from "next";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  "web-dev": Code2,
  data: BarChart3,
  automation: Bot,
  security: ShieldCheck,
  training: GraduationCap,
};

interface Service {
  slug: string;
  title: string;
  hero: string;
  body: string;
  deliverables: string[];
  tags: string[];
  gradient: string;
  whoFor: string[];
  process: { step: string; title: string; body: string }[];
  seoTitle: string;
  seoDescription: string;
}

const SERVICES: Service[] = [
  {
    slug: "web-dev",
    title: "Web & App Development",
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
    whoFor: [
      "Startups building their first product",
      "Businesses replacing legacy systems",
      "Founders who need a technical co-builder",
      "Teams who want enterprise-grade code without enterprise pricing",
    ],
    process: [
      { step: "01", title: "Discovery", body: "We learn your business, audience, and goals. Then we define the scope, stack, and timeline." },
      { step: "02", title: "Build", body: "Iterative sprints with weekly demos. You see progress every week, not just at the end." },
      { step: "03", title: "Ship", body: "We deploy to production with CI/CD, monitoring, and security configured from day one." },
      { step: "04", title: "Support", body: "Post-launch support, performance monitoring, and ongoing development as your product grows." },
    ],
    seoTitle: "Web & App Development — Sagacity Network",
    seoDescription: "Full-stack web development with Next.js, React, and Supabase. Production-grade digital products built by a UK-registered studio.",
  },
  {
    slug: "data",
    title: "Data & Programme Intelligence",
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
    whoFor: [
      "Programme directors needing real-time project visibility",
      "Executives who want dashboards, not spreadsheets",
      "Operations teams drowning in manual reporting",
      "Organisations with data but no insight",
    ],
    process: [
      { step: "01", title: "Audit", body: "We map your current data sources, reporting gaps, and decision-making needs." },
      { step: "02", title: "Design", body: "We design the dashboard layout, KPI framework, and data model before building anything." },
      { step: "03", title: "Build", body: "We connect your data sources, build the pipelines, and deploy interactive dashboards." },
      { step: "04", title: "Train", body: "We train your team to use and maintain the dashboards independently." },
    ],
    seoTitle: "Data & Programme Intelligence — Sagacity Network",
    seoDescription: "Power BI dashboards, KPI tracking, and programme intelligence. Turn your data into actionable decisions with a UK-based data studio.",
  },
  {
    slug: "automation",
    title: "Business Automation & AI",
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
    whoFor: [
      "Businesses spending hours on repetitive tasks",
      "Teams manually copying data between systems",
      "Founders who want AI without hiring a data scientist",
      "Operations managers looking to scale without scaling headcount",
    ],
    process: [
      { step: "01", title: "Map", body: "We map your current workflows and identify the highest-impact automation opportunities." },
      { step: "02", title: "Prototype", body: "We build a working prototype in days, not weeks. You test it with real data before we commit." },
      { step: "03", title: "Deploy", body: "We deploy the automation with monitoring, error handling, and documentation." },
      { step: "04", title: "Optimise", body: "We monitor performance and refine the automation based on real-world usage." },
    ],
    seoTitle: "Business Automation & AI — Sagacity Network",
    seoDescription: "AI-powered automation, WhatsApp bots, and workflow integration. Eliminate manual work with a UK-based automation studio.",
  },
  {
    slug: "security",
    title: "Cybersecurity",
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
    whoFor: [
      "Businesses handling sensitive customer data",
      "Startups preparing for enterprise clients or compliance",
      "Organisations that have never had a security audit",
      "Teams who want ongoing security, not a one-off report",
    ],
    process: [
      { step: "01", title: "Scope", body: "We define the testing scope, rules of engagement, and what we are looking for." },
      { step: "02", title: "Test", body: "We run the audit or penetration test using industry-standard tools and manual techniques." },
      { step: "03", title: "Report", body: "You get a clear, prioritised report with findings, risk ratings, and remediation steps." },
      { step: "04", title: "Fix", body: "We can remediate the findings directly or support your team in doing so." },
    ],
    seoTitle: "Cybersecurity Services — Sagacity Network",
    seoDescription: "Penetration testing, security audits, and vulnerability assessments. Protect your business with a UK-based cybersecurity studio.",
  },
  {
    slug: "training",
    title: "Training & Workshops",
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
    whoFor: [
      "Corporate teams needing technical upskilling",
      "Professionals looking for hands-on AI training",
      "Organisations meeting CPD or compliance requirements",
      "Individuals switching into tech careers",
    ],
    process: [
      { step: "01", title: "Brief", body: "We learn your team's current skill level, goals, and preferred format." },
      { step: "02", title: "Design", body: "We design a custom curriculum or select from our existing programme library." },
      { step: "03", title: "Deliver", body: "Live sessions with hands-on exercises, real-world examples, and Q&A." },
      { step: "04", title: "Follow-up", body: "Post-training resources, recordings, and optional ongoing mentoring." },
    ],
    seoTitle: "Training & Workshops — Sagacity Network",
    seoDescription: "Corporate training, developer bootcamps, and AI workshops. Hands-on technical training from UK-based practitioners.",
  },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};

  return {
    title: service.seoTitle,
    description: service.seoDescription,
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url: `https://sagacitynetwork.net/services/${service.slug}`,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const Icon = ICON_MAP[service.slug] || Code2;

  return (
    <div className="pt-[120px] pb-20">
      <div className="max-w-site section-px">
        {/* Back link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-[13px] font-[500] mb-10 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-accent)" }}
        >
          <ArrowLeft size={14} /> All services
        </Link>

        {/* Hero */}
        <div className="mb-16">
          <div
            className="w-14 h-14 flex items-center justify-center mb-6"
            style={{
              background: service.gradient,
              borderRadius: "var(--radius-md)",
            }}
          >
            <Icon size={28} strokeWidth={1.6} color="#FFFFFF" />
          </div>
          <h1
            className="text-[36px] md:text-[48px] font-[800] tracking-[-0.03em] leading-[1.1] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {service.title}
          </h1>
          <p
            className="text-[18px] font-[400] mb-6"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-accent)",
            }}
          >
            {service.hero}
          </p>
          <p
            className="text-[15px] font-[300] leading-[1.75] max-w-[640px]"
            style={{ color: "var(--color-muted)" }}
          >
            {service.body}
          </p>
        </div>

        {/* Deliverables + Who it's for */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          <div
            className="p-8"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <h2
              className="text-[18px] font-[700] mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What&apos;s included
            </h2>
            <div className="flex flex-col gap-3">
              {service.deliverables.map((d) => (
                <div key={d} className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "var(--color-accent)" }}
                  />
                  <span
                    className="text-[14px] font-[300]"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {d}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-8"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <h2
              className="text-[18px] font-[700] mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Who this is for
            </h2>
            <div className="flex flex-col gap-3">
              {service.whoFor.map((w) => (
                <div key={w} className="flex items-start gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ background: "var(--color-accent)" }}
                  />
                  <span
                    className="text-[14px] font-[300]"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {w}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="mb-20">
          <h2
            className="text-[24px] font-[800] tracking-[-0.02em] mb-10"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((p) => (
              <div key={p.step}>
                <div
                  className="text-[36px] font-[800] mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-accent)",
                    opacity: 0.3,
                  }}
                >
                  {p.step}
                </div>
                <h3
                  className="text-[16px] font-[700] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-[13px] font-[300] leading-[1.7]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-2 mb-20">
          {service.tags.map((t) => (
            <span
              key={t}
              className="tag-purple px-4 py-2 text-[12px]"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div
          className="relative p-10 md:p-16 text-center overflow-hidden"
          style={{
            background: "var(--gradient-hero)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <h2
            className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-4"
            style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
          >
            Ready to get started?
          </h2>
          <p
            className="text-[15px] font-[300] leading-[1.7] mb-8 max-w-[420px] mx-auto"
            style={{ color: "rgba(240, 236, 244, 0.55)" }}
          >
            Book a free consultation and we&apos;ll walk through your project
            together. No commitment, no sales pitch.
          </p>
          <Link
            href="/contact"
            className="shimmer-btn inline-flex items-center gap-2 px-10 py-4 text-[14px] font-[500] tracking-[0.02em] transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "var(--gradient-purple)",
              color: "#FFFFFF",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Book a free consultation <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
