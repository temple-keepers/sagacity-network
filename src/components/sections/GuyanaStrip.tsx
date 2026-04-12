"use client";

import { useState } from "react";
import RevealWrapper from "@/components/ui/RevealWrapper";
import Button from "@/components/ui/Button";

const FEATURES = [
  {
    icon: "\u26A1",
    title: "Live in 5 Days",
    desc: "AI-powered generation means your site is professional and ready in days, not weeks.",
  },
  {
    icon: "\uD83D\uDD12",
    title: "Secured from Day One",
    desc: "Every site is security-hardened as standard. No extra charge \u2014 it\u2019s how we build.",
  },
  {
    icon: "\uD83C\uDF0D",
    title: "Diaspora-Ready",
    desc: "Credible to customers in Georgetown, London, Toronto, and New York simultaneously.",
  },
  {
    icon: "\uD83D\uDCAC",
    title: "WhatsApp-First",
    desc: "Your customers are already on WhatsApp. We build automations that meet them there.",
  },
];

const PACKAGES = [
  {
    name: "Starter",
    setup: "$297",
    monthly: "$39/mo",
    tagline: "Get your business online in 5 days",
    features: [
      "5-page professional website",
      "AI-written copy in your voice",
      "Security hardening included as standard",
      "Google Business profile setup",
      "Hosting & monthly maintenance",
    ],
    highlight: false,
  },
  {
    name: "Starter + Shield",
    setup: "$494",
    monthly: "$79/mo",
    tagline: "Website plus full security protection",
    features: [
      "Everything in Starter",
      "Full written security audit report",
      "Monthly vulnerability scans",
      "Dark web breach monitoring",
      "30-minute security consultation call",
    ],
    highlight: true,
  },
  {
    name: "Business",
    setup: "$597",
    monthly: "$149/mo",
    tagline: "Complete digital infrastructure",
    features: [
      "Everything in Starter + Shield",
      "WhatsApp chatbot \u2014 24/7 enquiry handling",
      "Booking & lead capture automation",
      "CRM setup and integration",
      "Quarterly staff security awareness training",
    ],
    highlight: false,
  },
];

export default function GuyanaStrip() {
  const [hoveredPkg, setHoveredPkg] = useState<number | null>(null);

  return (
    <section
      id="guyana"
      className="section-padding relative overflow-hidden"
      style={{ background: "var(--bg-secondary)" }}
    >
      {/* Purple glow */}
      <div
        className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(109,40,217,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="max-container relative z-10">
        {/* Header + features */}
        <RevealWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-14">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[2px] mb-5 border border-gold-border bg-gold-dim">
                <span className="text-[14px]">{"\uD83C\uDDEC\uD83C\uDDFE"}</span>
                <span className="text-[11px] tracking-[0.16em] text-gold uppercase font-semibold">
                  Guyana Digital
                </span>
              </div>

              <h2 className="mb-6">
                Putting Guyanese Businesses
                <br />
                <em className="text-gold italic">on the World Stage.</em>
              </h2>

              <p className="text-[15px] text-text-secondary font-light leading-[1.8] mb-7 max-w-[520px]">
                Professional websites secured from day one, live in 5 days,
                maintained so you never have to think about it. Built by people
                who understand Guyana, the diaspora, and the world you&apos;re
                trying to reach.
              </p>

              <div
                className="px-5 py-3.5 rounded-[2px] text-[13px] font-medium leading-[1.5]"
                style={{
                  background: "var(--gold-dim)",
                  border: "1px solid var(--gold-border)",
                  color: "var(--gold)",
                }}
              >
                No agency in Guyana combines website + cybersecurity + automation
                at this price.
              </div>
            </div>

            {/* Right: feature tiles */}
            <div className="flex flex-col gap-3">
              {FEATURES.map((f, i) => (
                <RevealWrapper key={f.title} delay={i * 60}>
                  <div
                    className="flex gap-4 px-5 py-4 rounded-[2px] border border-border-line transition-all duration-300 hover:border-gold-border"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <span className="text-[20px] shrink-0">{f.icon}</span>
                    <div>
                      <div className="text-[14px] font-semibold text-text-primary mb-1">
                        {f.title}
                      </div>
                      <div className="text-[13px] text-text-secondary font-light leading-[1.6]">
                        {f.desc}
                      </div>
                    </div>
                  </div>
                </RevealWrapper>
              ))}
            </div>
          </div>
        </RevealWrapper>

        {/* Pricing packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map((pkg, i) => {
            const isHovered = hoveredPkg === i;

            return (
              <RevealWrapper key={pkg.name} delay={i * 80}>
                <div
                  onMouseEnter={() => setHoveredPkg(i)}
                  onMouseLeave={() => setHoveredPkg(null)}
                  className="relative rounded-[2px] overflow-hidden h-full flex flex-col justify-between"
                  style={{
                    padding: "40px 32px",
                    background: pkg.highlight
                      ? "rgba(212,175,55,0.04)"
                      : "var(--bg-card)",
                    border: `${pkg.highlight ? "2px" : "1px"} solid ${
                      pkg.highlight ? "var(--gold-border)" : "var(--border)"
                    }`,
                    transition: "all 0.3s ease",
                    transform: isHovered ? "translateY(-4px)" : "none",
                    boxShadow: isHovered
                      ? "0 12px 32px rgba(0,0,0,0.15)"
                      : "none",
                  }}
                >
                  {/* Top accent */}
                  {pkg.highlight && (
                    <div
                      className="absolute top-0 left-[15%] right-[15%] h-[2px]"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, var(--gold), transparent)",
                      }}
                    />
                  )}

                  {/* Most Popular badge */}
                  {pkg.highlight && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-gold text-bg-primary text-[9px] font-extrabold tracking-[0.12em] uppercase rounded-[2px]">
                      Most Popular
                    </div>
                  )}

                  <div>
                    {/* Name */}
                    <div className="text-[10px] tracking-[0.18em] text-gold uppercase font-semibold mb-3">
                      {pkg.name}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="font-display text-[46px] font-semibold text-text-primary leading-none">
                        {pkg.setup}
                      </span>
                      <span className="text-[11px] text-text-muted">setup</span>
                    </div>
                    <div className="text-[14px] text-gold font-semibold mb-2">
                      then {pkg.monthly}
                    </div>
                    <div className="text-[13px] text-text-secondary font-light leading-[1.5] mb-7">
                      {pkg.tagline}
                    </div>

                    {/* Features */}
                    <div className="flex flex-col gap-2.5 mb-7">
                      {pkg.features.map((f) => (
                        <div
                          key={f}
                          className="flex gap-2.5 items-start"
                        >
                          <span className="text-gold text-[13px] font-bold shrink-0 mt-0.5">
                            {"\u2713"}
                          </span>
                          <span className="text-[13px] text-text-secondary leading-[1.4]">
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    href="#contact"
                    variant={pkg.highlight ? "primary" : "outline"}
                    className="w-full justify-center"
                  >
                    Get Started
                  </Button>
                </div>
              </RevealWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
