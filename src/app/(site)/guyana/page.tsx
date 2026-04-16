"use client";

import { useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { CheckCircle2, Globe, Shield, Zap, Headphones } from "lucide-react";

const PACKAGES = [
  {
    name: "Starter",
    price: "$350",
    checkoutId: "starter",
    description: "Perfect for small businesses going online for the first time.",
    features: [
      "5-page responsive website",
      "Mobile-first design",
      "Contact form with email",
      "Basic SEO setup",
      "SSL & security basics",
      "30 days of support",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$850",
    checkoutId: "professional",
    description: "For established businesses ready to compete online.",
    features: [
      "Up to 12 custom pages",
      "Brand-aligned design system",
      "CMS for content management",
      "Advanced SEO & analytics",
      "Security audit & hardening",
      "WhatsApp integration",
      "90 days of support",
      "Performance optimisation",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    checkoutId: null,
    description: "Full-scale digital transformation for larger organisations.",
    features: [
      "Custom web application",
      "Database & backend systems",
      "Payment processing",
      "User authentication",
      "Business automation",
      "Ongoing maintenance",
      "Dedicated account manager",
      "Priority support",
    ],
    highlighted: false,
  },
];

const WHY_US = [
  {
    icon: Globe,
    title: "Diaspora-connected",
    body: "We understand the Guyanese market because we're part of the diaspora. We know the audience, the culture, and the opportunity.",
  },
  {
    icon: Zap,
    title: "Live in 5 days",
    body: "Starter sites go live within 5 business days. No months of back-and-forth — just clean, professional work delivered fast.",
  },
  {
    icon: Shield,
    title: "Security from day one",
    body: "Every site ships with SSL, security headers, and best-practice configuration. No afterthought — it's built into the process.",
  },
  {
    icon: Headphones,
    title: "Ongoing support",
    body: "We don't disappear after launch. Every package includes post-launch support and we offer monthly retainers for ongoing work.",
  },
];

export default function GuyanaPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(packageId: string) {
    setLoading(packageId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert(data.error || "Something went wrong. Please try again.");
        setLoading(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="pt-[120px] pb-20">
      {/* Hero */}
      <div className="max-w-site section-px mb-20">
        <ScrollReveal>
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
          <h1
            className="text-[40px] md:text-[56px] font-[800] tracking-[-0.03em] leading-[1.1] mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built for{" "}
            <span
              className="text-gradient-gold"
              style={{ WebkitTextFillColor: "transparent" }}
            >
              Guyana.
            </span>
          </h1>
          <p
            className="text-[17px] font-[300] leading-[1.7] max-w-[600px]"
            style={{ color: "var(--color-muted)" }}
          >
            Professional websites and digital systems for businesses in Guyana
            and across the Caribbean. Built by people who understand the
            diaspora and the world you&apos;re trying to reach. Live in 5 days,
            secured from day one.
          </p>
        </ScrollReveal>
      </div>

      {/* Why us */}
      <section
        className="py-16 md:py-20"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-site section-px">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((w, i) => {
              const Icon = w.icon;
              return (
                <ScrollReveal key={w.title} delay={i * 80}>
                  <div
                    className="p-6 h-full"
                    style={{
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div
                      className="w-14 h-14 flex items-center justify-center mb-4"
                      style={{
                        background: "rgba(201, 168, 76, 0.1)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-gold)",
                      }}
                    >
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                    <h3
                      className="text-[16px] font-[700] mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {w.title}
                    </h3>
                    <p
                      className="text-[13px] font-[300] leading-[1.7]"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {w.body}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-28" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-site section-px">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2
                className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Simple,{" "}
                <span
                  className="text-gradient-gold"
                  style={{ WebkitTextFillColor: "transparent" }}
                >
                  transparent pricing.
                </span>
              </h2>
              <p
                className="text-[15px] font-[300] leading-[1.7] max-w-[480px] mx-auto"
                style={{ color: "var(--color-muted)" }}
              >
                Fixed prices. No hidden fees. No hourly billing surprises.
                Pick the package that fits and we&apos;ll handle the rest.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg, i) => (
              <ScrollReveal key={pkg.name} delay={i * 100}>
                <div
                  className="relative p-7 md:p-9 h-full flex flex-col"
                  style={{
                    background: pkg.highlighted
                      ? "var(--gradient-hero)"
                      : "var(--color-surface)",
                    border: pkg.highlighted
                      ? "1px solid rgba(123, 63, 160, 0.3)"
                      : "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {pkg.highlighted && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 text-[11px] font-[600] tracking-[0.06em] uppercase"
                      style={{
                        background: "var(--color-gold)",
                        color: "#1A1128",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      Most popular
                    </span>
                  )}

                  <h3
                    className="text-[22px] font-[700] mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: pkg.highlighted ? "#F0ECF4" : "var(--color-ink)",
                    }}
                  >
                    {pkg.name}
                  </h3>
                  <div
                    className="text-[36px] font-[800] mb-2"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: pkg.highlighted ? "#F0ECF4" : "var(--color-ink)",
                    }}
                  >
                    {pkg.price}
                  </div>
                  <p
                    className="text-[13px] font-[300] leading-[1.6] mb-6"
                    style={{
                      color: pkg.highlighted
                        ? "rgba(240, 236, 244, 0.6)"
                        : "var(--color-muted)",
                    }}
                  >
                    {pkg.description}
                  </p>

                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {pkg.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-[13px]"
                      >
                        <CheckCircle2
                          size={16}
                          className="flex-shrink-0 mt-0.5"
                          style={{
                            color: pkg.highlighted
                              ? "var(--color-gold)"
                              : "var(--color-accent)",
                          }}
                        />
                        <span
                          style={{
                            color: pkg.highlighted
                              ? "rgba(240, 236, 244, 0.8)"
                              : "var(--color-muted)",
                          }}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {pkg.checkoutId ? (
                    <button
                      onClick={() => handleCheckout(pkg.checkoutId!)}
                      disabled={loading === pkg.checkoutId}
                      className="block w-full text-center px-6 py-3.5 text-[14px] font-[500] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                      style={{
                        background: pkg.highlighted
                          ? "linear-gradient(135deg, #D4B85A 0%, #C9A84C 100%)"
                          : "var(--gradient-purple)",
                        color: pkg.highlighted ? "#1A1128" : "#FFFFFF",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      {loading === pkg.checkoutId ? "Redirecting..." : "Get started"}
                    </button>
                  ) : (
                    <Link
                      href="/contact"
                      className="block text-center px-6 py-3.5 text-[14px] font-[500] transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: "var(--gradient-purple)",
                        color: "#FFFFFF",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      Contact us
                    </Link>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-site section-px">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2
                className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                How it works.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Brief", body: "Tell us about your business, audience, and goals. 30-minute call or form." },
              { step: "02", title: "Design", body: "We create a custom design tailored to your brand and market." },
              { step: "03", title: "Build", body: "We develop, test, and secure your site. You review and approve." },
              { step: "04", title: "Launch", body: "Your site goes live. We train you on updates and provide ongoing support." },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={i * 100}>
                <div className="text-center">
                  <div
                    className="text-[40px] font-[800] mb-3"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-accent)",
                      opacity: 0.3,
                    }}
                  >
                    {s.step}
                  </div>
                  <h3
                    className="text-[18px] font-[700] mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-[13px] font-[300] leading-[1.7]"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {s.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="glow-orb glow-orb-gold w-[400px] h-[400px] top-[-100px] left-[10%] opacity-15" />
        <div className="max-w-site section-px relative z-10 text-center">
          <ScrollReveal>
            <div className="text-[60px] mb-6">{"\uD83C\uDDEC\uD83C\uDDFE"}</div>
            <h2
              className="text-[32px] md:text-[44px] font-[800] tracking-[-0.03em] mb-5"
              style={{
                fontFamily: "var(--font-display)",
                color: "#F0ECF4",
              }}
            >
              Let&apos;s build your{" "}
              <span
                className="text-gradient-gold"
                style={{ WebkitTextFillColor: "transparent" }}
              >
                digital presence.
              </span>
            </h2>
            <p
              className="text-[16px] font-[300] leading-[1.7] mb-10 max-w-[440px] mx-auto"
              style={{ color: "rgba(240, 236, 244, 0.55)" }}
            >
              Get a free consultation and see how we can help your business
              stand out online.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="shimmer-btn inline-block px-10 py-4 text-[14px] font-[500] tracking-[0.02em] transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "linear-gradient(135deg, #D4B85A 0%, #C9A84C 100%)",
                  color: "#1A1128",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Book a free consultation
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
