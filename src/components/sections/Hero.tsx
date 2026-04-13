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

      {/* Glowing arc ring — two halves fly in and join */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] lg:w-[960px] lg:h-[960px]">
          {/* Left half-arc — flies in from left */}
          <motion.div
            initial={{ x: -200, opacity: 0, rotate: -30 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
            style={{
              clipPath: "inset(0 50% 0 0)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 90deg, rgba(212,175,55,0.2) 0%, rgba(245,240,232,0.4) 15%, rgba(159,122,234,0.25) 30%, rgba(212,175,55,0.1) 45%, transparent 50%, transparent 100%)",
                filter: "blur(1.5px)",
                mask: "radial-gradient(circle, transparent 62%, black 64%, black 67%, transparent 69%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 62%, black 64%, black 67%, transparent 69%)",
              }}
            />
          </motion.div>

          {/* Right half-arc — flies in from right */}
          <motion.div
            initial={{ x: 200, opacity: 0, rotate: 30 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
            style={{
              clipPath: "inset(0 0 0 50%)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 270deg, rgba(159,122,234,0.2) 0%, rgba(245,240,232,0.4) 15%, rgba(212,175,55,0.25) 30%, rgba(159,122,234,0.1) 45%, transparent 50%, transparent 100%)",
                filter: "blur(1.5px)",
                mask: "radial-gradient(circle, transparent 62%, black 64%, black 67%, transparent 69%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 62%, black 64%, black 67%, transparent 69%)",
              }}
            />
          </motion.div>

          {/* Full ring — fades in after halves join, then rotates */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.8 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 180deg, transparent 0%, rgba(212,175,55,0.15) 12%, rgba(159,122,234,0.22) 25%, rgba(245,240,232,0.38) 40%, rgba(159,122,234,0.22) 55%, rgba(212,175,55,0.15) 68%, transparent 80%, rgba(245,240,232,0.1) 90%, transparent 100%)",
                filter: "blur(1px)",
                mask: "radial-gradient(circle, transparent 62%, black 64%, black 67%, transparent 69%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 62%, black 64%, black 67%, transparent 69%)",
                animation: "hero-ring-rotate 24s linear infinite",
              }}
            />

            {/* Shimmer particles counter-rotating */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(245,240,232,0.1) 2%, transparent 4%, transparent 20%, rgba(212,175,55,0.08) 22%, transparent 24%, transparent 45%, rgba(159,122,234,0.1) 47%, transparent 49%, transparent 70%, rgba(245,240,232,0.08) 72%, transparent 74%)",
                mask: "radial-gradient(circle, transparent 61%, black 63%, black 68%, transparent 70%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 61%, black 63%, black 68%, transparent 70%)",
                animation: "hero-ring-rotate 32s linear infinite reverse",
              }}
            />
          </motion.div>

          {/* Inner glow fill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
            className="absolute inset-[20%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(159,122,234,0.03) 0%, rgba(212,175,55,0.015) 50%, transparent 70%)",
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
