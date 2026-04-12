"use client";

import { useEffect } from "react";
import RevealWrapper from "@/components/ui/RevealWrapper";
import Button from "@/components/ui/Button";
import { SERVICES } from "@/lib/data/services";

export default function ServicesPage() {
  /* Auto-scroll to hash fragment on mount */
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      }
    }
  }, []);

  return (
    <>
      {/* Hero */}
      <section
        className="section-padding relative overflow-hidden"
        style={{ background: "var(--bg-primary)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 70%)",
          }}
        />
        <div className="max-container relative z-10 pt-20">
          <RevealWrapper>
            <div className="text-center max-w-[740px] mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[2px] mb-6 border border-gold-border bg-gold-dim">
                <span className="text-[11px] tracking-[0.16em] text-gold uppercase font-semibold">
                  What We Do
                </span>
              </div>
              <h1 className="mb-5">
                Five Disciplines.
                <br />
                <em className="text-gold italic">One Studio.</em>
              </h1>
              <p className="text-[16px] text-text-secondary font-light leading-[1.8] max-w-[560px] mx-auto">
                Every service is delivered by the people who built this studio
                &mdash; not outsourced, not templated, not theoretical.
              </p>
            </div>
          </RevealWrapper>
        </div>
      </section>

      {/* Service blocks */}
      {SERVICES.map((service, i) => {
        const isEven = i % 2 === 0;
        return (
          <section
            key={service.slug}
            id={service.slug}
            className="relative overflow-hidden"
            style={{
              background: isEven ? "var(--bg-primary)" : "var(--bg-secondary)",
              padding: "100px 24px",
            }}
          >
            {/* Subtle accent glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: 500,
                height: 500,
                top: -100,
                [isEven ? "right" : "left"]: -100,
                background:
                  "radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 60%)",
              }}
            />

            <div className="max-container relative z-10">
              <RevealWrapper>
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start ${
                    isEven ? "" : "lg:direction-rtl"
                  }`}
                  style={!isEven ? { direction: "rtl" } : undefined}
                >
                  {/* Left: number + title + text */}
                  <div style={!isEven ? { direction: "ltr" } : undefined}>
                    <div className="flex items-center gap-4 mb-6">
                      <span
                        className="font-display text-[56px] lg:text-[72px] font-light leading-none"
                        style={{ color: "var(--gold)", opacity: 0.25 }}
                      >
                        {service.number}
                      </span>
                      <div>
                        <span
                          className="text-[28px] leading-none"
                          style={{ color: "var(--gold)", opacity: 0.6 }}
                        >
                          {service.icon}
                        </span>
                      </div>
                    </div>

                    <h2 className="font-display text-[clamp(32px,4vw,52px)] font-light text-text-primary leading-[1.1] mb-3">
                      {service.title}
                    </h2>

                    <p
                      className="font-display text-[18px] italic mb-6"
                      style={{ color: "var(--gold)" }}
                    >
                      {service.tagline}
                    </p>

                    <p className="text-[15px] text-text-secondary font-light leading-[1.8] mb-5">
                      {service.description}
                    </p>

                    <p className="text-[14px] text-text-secondary font-light leading-[1.8] mb-8">
                      {service.detail}
                    </p>

                    <Button href="#contact">Discuss This Service</Button>
                  </div>

                  {/* Right: tags + capabilities */}
                  <div style={!isEven ? { direction: "ltr" } : undefined}>
                    <div
                      className="rounded-[2px] p-8 lg:p-10"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <h4
                        className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-6"
                        style={{ color: "var(--gold)" }}
                      >
                        Capabilities
                      </h4>

                      <div className="flex flex-wrap gap-2.5">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-4 py-2 text-[12px] font-medium tracking-[0.04em] rounded-[2px]"
                            style={{
                              border: "1px solid var(--gold-border)",
                              color: "var(--text-primary)",
                              background: "var(--gold-dim)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Decorative divider */}
                      <div
                        className="my-8 h-[1px]"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--gold-border), transparent)",
                        }}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-[2px]" style={{ border: "1px solid var(--border)" }}>
                          <div className="font-display text-[24px] font-semibold text-gold leading-none mb-1">
                            {service.number === "01"
                              ? "5"
                              : service.number === "02"
                              ? "700+"
                              : service.number === "03"
                              ? "100s"
                              : service.number === "04"
                              ? "24/7"
                              : "6+"}
                          </div>
                          <div className="text-[10px] text-text-muted tracking-[0.08em] uppercase">
                            {service.number === "01"
                              ? "Live Platforms"
                              : service.number === "02"
                              ? "Projects Tracked"
                              : service.number === "03"
                              ? "Hours Saved"
                              : service.number === "04"
                              ? "Monitoring"
                              : "Courses"}
                          </div>
                        </div>
                        <div className="text-center p-4 rounded-[2px]" style={{ border: "1px solid var(--border)" }}>
                          <div className="font-display text-[24px] font-semibold text-gold leading-none mb-1">
                            {service.number === "01"
                              ? "Next.js"
                              : service.number === "02"
                              ? "Power BI"
                              : service.number === "03"
                              ? "Claude"
                              : service.number === "04"
                              ? "Certified"
                              : "CPD"}
                          </div>
                          <div className="text-[10px] text-text-muted tracking-[0.08em] uppercase">
                            {service.number === "01"
                              ? "Core Stack"
                              : service.number === "02"
                              ? "Primary Tool"
                              : service.number === "03"
                              ? "AI Engine"
                              : service.number === "04"
                              ? "Specialists"
                              : "Eligible"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealWrapper>
            </div>
          </section>
        );
      })}

      {/* Bottom CTA */}
      <section
        className="section-padding relative"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="max-container">
          <RevealWrapper>
            <div
              className="rounded-[2px] p-10 lg:p-16 text-center border border-gold-border"
              style={{ background: "rgba(212,175,55,0.03)" }}
            >
              <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-light text-text-primary mb-4">
                Not sure which service fits?{" "}
                <em className="text-gold italic">Let&apos;s talk.</em>
              </h2>
              <p className="text-[15px] text-text-secondary font-light leading-[1.7] mb-8 max-w-[500px] mx-auto">
                Tell us what you&apos;re building or what&apos;s not working
                &mdash; we&apos;ll recommend the right approach.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href="#contact">Start a Conversation</Button>
                <Button href="/work" variant="outline">
                  See Our Work
                </Button>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </section>
    </>
  );
}
