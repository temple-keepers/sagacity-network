"use client";

import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

const STATS = [
  { value: "5", label: "Live Platforms" },
  { value: "\u00A3200M+", label: "Programmes Managed" },
  { value: "700+", label: "Projects Delivered" },
  { value: "11+", label: "Years Enterprise" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep dark background */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--bg-primary)" }}
      />

      {/* Animated gradient mesh orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="mesh-orb mesh-orb-1 w-[400px] md:w-[600px] lg:w-[800px] h-[400px] md:h-[600px] lg:h-[800px]"
          style={{
            top: "-15%",
            right: "-10%",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.1) 0%, rgba(159,122,234,0.04) 40%, transparent 70%)",
          }}
        />
        <div
          className="mesh-orb mesh-orb-2 w-[350px] md:w-[500px] lg:w-[650px] h-[350px] md:h-[500px] lg:h-[650px]"
          style={{
            bottom: "-5%",
            left: "-10%",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.02) 45%, transparent 70%)",
          }}
        />
        <div
          className="mesh-orb mesh-orb-3 w-[200px] md:w-[300px] lg:w-[400px] h-[200px] md:h-[300px] lg:h-[400px]"
          style={{
            top: "35%",
            left: "30%",
            background:
              "radial-gradient(circle, rgba(159,122,234,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Luminous ring — intro → spin → outro loop (12s cycle) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[650px] h-[650px] md:w-[850px] md:h-[850px] lg:w-[1000px] lg:h-[1000px]">
          {/* Left half — bright line + bloom */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 50.5% 0, 50.5% 100%, 0 100%)",
              animation: "ring-left-cycle 12s ease-in-out infinite",
            }}
          >
            <div className="absolute inset-0 rounded-full hero-ring-bloom" />
            <div className="absolute inset-0 rounded-full hero-ring-line" />
          </div>

          {/* Right half — overlaps 0.5% to eliminate seam */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(49.5% 0, 100% 0, 100% 100%, 49.5% 100%)",
              animation: "ring-right-cycle 12s ease-in-out infinite",
            }}
          >
            <div className="absolute inset-0 rounded-full hero-ring-bloom" />
            <div className="absolute inset-0 rounded-full hero-ring-line" />
          </div>

          {/* Full ring — visible while joined */}
          <div
            className="absolute inset-0"
            style={{ animation: "ring-body-cycle 12s ease infinite" }}
          >
            {/* Wide bloom glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(200,195,220,0.08) 0%, rgba(255,255,255,0.12) 25%, rgba(200,195,220,0.08) 50%, rgba(255,255,255,0.12) 75%, rgba(200,195,220,0.08) 100%)",
                filter: "blur(14px)",
                mask: "radial-gradient(circle, transparent 58%, black 62%, black 72%, transparent 76%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 58%, black 62%, black 72%, transparent 76%)",
                animation: "hero-ring-rotate 40s linear infinite",
              }}
            />

            {/* Crisp bright white ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(255,255,255,0.4) 0%, rgba(220,215,235,0.6) 20%, rgba(255,255,255,0.75) 40%, rgba(230,225,210,0.6) 60%, rgba(255,255,255,0.75) 80%, rgba(220,215,235,0.6) 95%, rgba(255,255,255,0.4) 100%)",
                mask: "radial-gradient(circle, transparent 66%, black 67%, black 67.8%, transparent 68.8%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 66%, black 67%, black 67.8%, transparent 68.8%)",
                animation: "hero-ring-rotate 30s linear infinite",
              }}
            />

            {/* Comet — bright white spot */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 90%, rgba(255,255,255,0.5) 94%, rgba(255,255,255,1) 97%, rgba(255,255,255,0.3) 99%, transparent 100%)",
                filter: "blur(2px)",
                mask: "radial-gradient(circle, transparent 64%, black 66%, black 69%, transparent 71%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 64%, black 66%, black 69%, transparent 71%)",
                animation: "hero-ring-rotate 6s linear infinite",
              }}
            />

            {/* Comet bloom trail */}
            <div
              className="absolute inset-[-1%] rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 85%, rgba(255,255,255,0.08) 90%, rgba(255,255,255,0.2) 95%, rgba(255,255,255,0.08) 98%, transparent 100%)",
                filter: "blur(10px)",
                mask: "radial-gradient(circle, transparent 60%, black 63%, black 72%, transparent 75%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 60%, black 63%, black 72%, transparent 75%)",
                animation: "hero-ring-rotate 6s linear infinite",
              }}
            />
          </div>

          {/* Inner subtle glow */}
          <div
            className="absolute inset-[25%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(200,195,220,0.025) 0%, transparent 70%)",
              animation: "ring-body-cycle 12s ease infinite",
            }}
          />
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 max-container w-full section-px pt-[120px] md:pt-[140px] pb-16 md:pb-20">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-[2px] border border-border-line bg-bg-card mb-8 md:mb-10 backdrop-blur-sm">
              <span className="pulse-dot" />
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-secondary">
                UK Registered Digital Product Studio
              </span>
            </div>
          </motion.div>

          {/* Headline — client-focused */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mb-6 md:mb-8"
          >
            <span className="block text-text-primary leading-[1.05]">
              Your Business Deserves
            </span>
            <span className="block shimmer-text leading-[1.05]">
              Digital Infrastructure
            </span>
            <span className="block text-text-muted leading-[1.05]">
              That Actually Works.
            </span>
          </motion.h1>

          {/* Subheading — client pain + solution */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-[15px] md:text-[17px] leading-[1.75] text-text-secondary max-w-[560px] mb-8 md:mb-10"
          >
            Tired of agencies that over-promise and under-deliver? We build
            web platforms, dashboards, automations, and security systems that
            are production-grade from day one &mdash; so you can focus on
            growing your business.
          </motion.p>

          {/* Value prop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mb-8 md:mb-10"
          >
            <span className="text-[15px] md:text-[17px] text-text-primary font-light">
              Enterprise quality.{" "}
              <em
                className="italic font-display text-[17px] md:text-[19px]"
                style={{ color: "var(--gold)" }}
              >
                Human scale pricing.
              </em>
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-wrap gap-4 justify-center mb-16 md:mb-20"
          >
            <Button href="/contact">Get a Free Assessment</Button>
            <Button href="/work" variant="outline">
              See What We&apos;ve Built
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full max-w-[700px]"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 pt-6 border-t border-gold-border/20">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex items-center justify-center ${
                    i > 0
                      ? "sm:border-l sm:border-gold-border/20"
                      : ""
                  }`}
                >
                  <div className="text-center">
                    <div className="font-display text-[26px] md:text-[34px] font-light text-text-primary leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-text-muted mt-2 whitespace-nowrap">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hidden lg:flex z-10">
        <span className="text-[10px] tracking-[0.15em] uppercase text-text-muted">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent"
        />
      </div>
    </section>
  );
}
