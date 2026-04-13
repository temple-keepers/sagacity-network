"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ExternalLink, ArrowRight } from "lucide-react";

const PLATFORMS = [
  {
    name: "Temple Keepers",
    tagline: "Faith & wellness, reimagined for the modern believer.",
    description:
      "A full-stack faith platform with AI-powered devotionals, fasting cohorts, community pods, and personalised spiritual growth tracking. Built on Next.js with Supabase, real-time features, and a subscription model.",
    url: "https://templekeepers.app",
    gradient: "linear-gradient(135deg, #5B2D8E 0%, #7B3FA0 100%)",
    emoji: "\u26EA",
    stack: ["Next.js", "Supabase", "Claude API", "Vercel", "Stripe"],
    highlights: [
      "AI devotional engine generating daily personalised content",
      "Community pods with real-time messaging",
      "Fasting cohorts with accountability tracking",
      "Subscription billing via Stripe",
    ],
  },
  {
    name: "Rhythm & Roots",
    tagline: "Connecting the Guyanese diaspora with culture, events, and creators.",
    description:
      "A cultural discovery platform that brings the Caribbean diaspora together through curated events, creator spotlights, and community stories. Features event listings, artist profiles, and a blog powered by a headless CMS.",
    url: "https://rhythmnroots.app",
    gradient: "linear-gradient(135deg, #C9A84C 0%, #A88B3D 100%)",
    emoji: "\uD83C\uDFB6",
    stack: ["Next.js", "Supabase", "Vercel", "Tailwind CSS"],
    highlights: [
      "Event discovery with location-based search",
      "Creator and artist profile pages",
      "Cultural blog with rich media content",
      "SEO-optimised for diaspora search terms",
    ],
  },
  {
    name: "Totenga",
    tagline: "Community-powered experiences and shared connections.",
    description:
      "A community platform bringing people together through shared experiences, local events, and meaningful connections. Built for scale with real-time features and a modern, accessible interface.",
    url: "https://totenga.com",
    gradient: "linear-gradient(135deg, #3D8E6E 0%, #2D6E52 100%)",
    emoji: "\uD83C\uDF10",
    stack: ["Next.js", "React", "Supabase", "Vercel"],
    highlights: [
      "Community-driven event creation",
      "User profiles and connection features",
      "Real-time notifications and updates",
      "Mobile-first responsive design",
    ],
  },
];

export default function WorkPage() {
  return (
    <div className="pt-[120px] pb-20">
      {/* Hero */}
      <div className="max-w-site section-px mb-20">
        <ScrollReveal>
          <span
            className="text-[12px] font-[500] tracking-[0.12em] uppercase mb-5 block"
            style={{ color: "var(--color-accent)" }}
          >
            Portfolio
          </span>
          <h1
            className="text-[40px] md:text-[56px] font-[800] tracking-[-0.03em] leading-[1.1] mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Not mockups.{" "}
            <span
              className="text-gradient-purple"
              style={{ WebkitTextFillColor: "transparent" }}
            >
              Live products.
            </span>
          </h1>
          <p
            className="text-[17px] font-[300] leading-[1.7] max-w-[560px]"
            style={{ color: "var(--color-muted)" }}
          >
            Every platform below is live, serving real users, and built
            end-to-end by our team. We design, develop, deploy, and maintain.
          </p>
        </ScrollReveal>
      </div>

      {/* Platform deep dives */}
      <div className="flex flex-col gap-0">
        {PLATFORMS.map((p, i) => {
          const even = i % 2 === 0;
          return (
            <section
              key={p.name}
              className="relative py-20 md:py-28 overflow-hidden"
              style={{
                background: even ? "var(--color-bg)" : "var(--color-surface)",
              }}
            >
              <div className="max-w-site section-px">
                <ScrollReveal>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Visual */}
                    <div className={even ? "order-1" : "order-1 lg:order-2"}>
                      <div
                        className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden"
                        style={{
                          background: p.gradient,
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
                          className="text-[100px] md:text-[120px]"
                          style={{ animation: "float 5s ease-in-out infinite" }}
                        >
                          {p.emoji}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={even ? "order-2" : "order-2 lg:order-1"}>
                      <h2
                        className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-2"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {p.name}
                      </h2>
                      <p
                        className="text-[17px] font-[400] mb-4"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--color-accent)",
                        }}
                      >
                        {p.tagline}
                      </p>
                      <p
                        className="text-[15px] font-[300] leading-[1.75] mb-6"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {p.description}
                      </p>

                      {/* Highlights */}
                      <ul className="flex flex-col gap-3 mb-6">
                        {p.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-start gap-3 text-[14px]"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                              style={{ background: "var(--color-accent)" }}
                            />
                            <span style={{ color: "var(--color-muted)" }}>
                              {h}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Stack tags */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {p.stack.map((t) => (
                          <span
                            key={t}
                            className="tag-purple px-3 py-1.5 text-[11px]"
                            style={{ borderRadius: "var(--radius-sm)" }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[14px] font-[500] transition-opacity hover:opacity-80"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Visit {p.name} <ExternalLink size={15} />
                      </a>
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
        <div className="glow-orb glow-orb-gold w-[400px] h-[400px] bottom-[-100px] left-[10%] opacity-15" />
        <div className="max-w-site section-px relative z-10 text-center">
          <ScrollReveal>
            <h2
              className="text-[32px] md:text-[44px] font-[800] tracking-[-0.03em] mb-5"
              style={{
                fontFamily: "var(--font-display)",
                color: "#F0ECF4",
              }}
            >
              Got a project{" "}
              <span
                className="text-gradient-gold"
                style={{ WebkitTextFillColor: "transparent" }}
              >
                in mind?
              </span>
            </h2>
            <p
              className="text-[16px] font-[300] leading-[1.7] mb-10 max-w-[440px] mx-auto"
              style={{ color: "rgba(240, 236, 244, 0.55)" }}
            >
              We'd love to hear about it. Tell us what you're building and we'll
              show you how we can help.
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
              Start a conversation <ArrowRight size={16} className="inline ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
