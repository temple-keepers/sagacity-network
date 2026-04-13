import { notFound } from "next/navigation";
import Link from "next/link";
import { PLATFORMS } from "@/lib/data/portfolio";
import { ArrowLeft, ExternalLink, CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PLATFORMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const platform = PLATFORMS.find((p) => p.slug === slug);
  if (!platform) return {};

  return {
    title: `${platform.name} — Case Study | Sagacity Network`,
    description: platform.description,
    openGraph: {
      title: `${platform.name} — Case Study | Sagacity Network`,
      description: platform.tagline,
      url: `https://sagacitynetwork.net/work/${platform.slug}`,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const platform = PLATFORMS.find((p) => p.slug === slug);
  if (!platform) notFound();

  return (
    <div className="pt-[120px] pb-20">
      <div className="max-w-site section-px">
        {/* Back link */}
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-[13px] font-[500] mb-10 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-accent)" }}
        >
          <ArrowLeft size={14} /> All work
        </Link>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-20">
          <div>
            <span
              className="text-[12px] font-[500] tracking-[0.12em] uppercase mb-4 block"
              style={{ color: "var(--color-accent)" }}
            >
              {platform.category}
            </span>
            <h1
              className="text-[36px] md:text-[48px] font-[800] tracking-[-0.03em] leading-[1.1] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {platform.name}
            </h1>
            <p
              className="text-[18px] font-[400] mb-4"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-accent)",
              }}
            >
              {platform.tagline}
            </p>
            <p
              className="text-[15px] font-[300] leading-[1.75] mb-6"
              style={{ color: "var(--color-muted)" }}
            >
              {platform.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {platform.stack.map((t) => (
                <span
                  key={t}
                  className="tag-purple px-3 py-1.5 text-[11px]"
                  style={{ borderRadius: "var(--radius-sm)" }}
                >
                  {t}
                </span>
              ))}
            </div>

            {platform.url && (
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[14px] font-[500] transition-opacity hover:opacity-80"
                style={{ color: "var(--color-accent)" }}
              >
                Visit {platform.name} <ExternalLink size={15} />
              </a>
            )}
          </div>

          {/* Visual */}
          <div
            className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden"
            style={{
              background: platform.gradient,
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              className="absolute w-[200px] h-[200px] rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.3), transparent)",
              }}
            />
            <span
              className="text-[100px] md:text-[140px]"
              style={{ animation: "float 5s ease-in-out infinite" }}
            >
              {platform.emoji}
            </span>
          </div>
        </div>

        {/* Problem / Approach / Outcome */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          {[
            { label: "The problem", text: platform.problem },
            { label: "Our approach", text: platform.approach },
            { label: "The outcome", text: platform.outcome },
          ].map((section) => (
            <div key={section.label}>
              <h2
                className="text-[18px] font-[700] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {section.label}
              </h2>
              <p
                className="text-[14px] font-[300] leading-[1.75]"
                style={{ color: "var(--color-muted)" }}
              >
                {section.text}
              </p>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div
          className="p-8 md:p-12 mb-20"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <h2
            className="text-[22px] font-[700] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Key features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {platform.highlights.map((h) => (
              <div key={h} className="flex items-start gap-3">
                <CheckCircle2
                  size={16}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "var(--color-accent)" }}
                />
                <span
                  className="text-[14px] font-[300]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {h}
                </span>
              </div>
            ))}
          </div>
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
            Interested in something similar?
          </h2>
          <p
            className="text-[15px] font-[300] leading-[1.7] mb-8 max-w-[420px] mx-auto"
            style={{ color: "rgba(240, 236, 244, 0.55)" }}
          >
            We&apos;d love to hear about your project. Book a free consultation
            and let&apos;s explore what we can build together.
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
            Start a conversation <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
