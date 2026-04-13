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

      {/* Glowing arc ring — intro → spin → outro on loop (10s cycle) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[650px] h-[650px] md:w-[850px] md:h-[850px] lg:w-[1000px] lg:h-[1000px]">
          {/* Left half-arc — cycles in and out */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "inset(0 50% 0 0)",
              animation: "ring-left-cycle 10s cubic-bezier(0.22,1,0.36,1) infinite",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 90deg, rgba(212,175,55,0.5) 0%, rgba(245,240,232,0.8) 20%, rgba(159,122,234,0.5) 40%, transparent 50%, transparent 100%)",
                filter: "blur(1px)",
                mask: "radial-gradient(circle, transparent 60%, black 62%, black 68%, transparent 70%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 60%, black 62%, black 68%, transparent 70%)",
              }}
            />
          </div>

          {/* Right half-arc — cycles in and out */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "inset(0 0 0 50%)",
              animation: "ring-right-cycle 10s cubic-bezier(0.22,1,0.36,1) infinite",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 270deg, rgba(159,122,234,0.5) 0%, rgba(245,240,232,0.8) 20%, rgba(212,175,55,0.5) 40%, transparent 50%, transparent 100%)",
                filter: "blur(1px)",
                mask: "radial-gradient(circle, transparent 60%, black 62%, black 68%, transparent 70%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 60%, black 62%, black 68%, transparent 70%)",
              }}
            />
          </div>

          {/* Full ring — visible while halves are joined */}
          <div
            className="absolute inset-0"
            style={{
              animation: "ring-body-cycle 10s ease infinite",
            }}
          >
            {/* Base ring — bright and thick */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(245,240,232,0.15) 0%, rgba(212,175,55,0.3) 10%, rgba(245,240,232,0.22) 20%, rgba(159,122,234,0.3) 35%, rgba(245,240,232,0.22) 50%, rgba(212,175,55,0.3) 65%, rgba(245,240,232,0.22) 80%, rgba(159,122,234,0.25) 90%, rgba(245,240,232,0.15) 100%)",
                mask: "radial-gradient(circle, transparent 60%, black 62%, black 68%, transparent 70%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 60%, black 62%, black 68%, transparent 70%)",
                animation: "hero-ring-rotate 30s linear infinite",
              }}
            />

            {/* Comet — traveling bright spot */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 85%, rgba(245,240,232,0.6) 92%, rgba(255,255,255,0.95) 95%, rgba(212,175,55,0.7) 97%, transparent 100%)",
                filter: "blur(2px)",
                mask: "radial-gradient(circle, transparent 59%, black 62%, black 68%, transparent 71%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 59%, black 62%, black 68%, transparent 71%)",
                animation: "hero-ring-rotate 6s linear infinite",
              }}
            />

            {/* Outer glow halo */}
            <div
              className="absolute inset-[-4%] rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(159,122,234,0.08) 25%, rgba(245,240,232,0.1) 50%, rgba(212,175,55,0.08) 75%, transparent 100%)",
                filter: "blur(20px)",
                mask: "radial-gradient(circle, transparent 55%, black 60%, black 70%, transparent 75%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 55%, black 60%, black 70%, transparent 75%)",
                animation: "hero-ring-rotate 20s linear infinite reverse",
              }}
            />
          </div>

          {/* Inner ambient glow — also cycles */}
          <div
            className="absolute inset-[22%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(159,122,234,0.04) 0%, rgba(212,175,55,0.02) 50%, transparent 70%)",
              animation: "ring-body-cycle 10s ease infinite",
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

          {/* Headline */}
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
              We Build
            </span>
            <span className="block shimmer-text leading-[1.05]">
              Digital Infrastructure
            </span>
            <span className="block text-text-muted leading-[1.05]">
              That Endures.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-[15px] md:text-[17px] leading-[1.75] text-text-secondary max-w-[540px] mb-8 md:mb-10"
          >
            Founded by an enterprise capital programme manager and a
            cybersecurity specialist — bringing Fortune 500 discipline to
            businesses and communities that deserve to operate at a higher level.
          </motion.p>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mb-8 md:mb-10"
          >
            <span className="text-[15px] md:text-[17px] text-text-primary font-light">
              Where Enterprise{" "}
              <em
                className="italic font-display text-[17px] md:text-[19px]"
                style={{ color: "var(--gold)" }}
              >
                Meets Imagination
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
            <Button href="/contact">Start a Project</Button>
            <Button href="/work" variant="outline">
              View Our Work
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
