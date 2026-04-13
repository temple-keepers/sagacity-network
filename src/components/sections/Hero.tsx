"use client";

import Image from "next/image";
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
    <section className="relative min-h-screen flex items-center overflow-hidden grid-bg">
      {/* Animated gradient mesh orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large purple orb — top right */}
        <div
          className="mesh-orb mesh-orb-1 w-[400px] md:w-[600px] lg:w-[800px] h-[400px] md:h-[600px] lg:h-[800px]"
          style={{
            top: "-10%",
            right: "-5%",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.12) 0%, rgba(159,122,234,0.06) 40%, transparent 70%)",
          }}
        />
        {/* Gold orb — bottom left */}
        <div
          className="mesh-orb mesh-orb-2 w-[350px] md:w-[500px] lg:w-[650px] h-[350px] md:h-[500px] lg:h-[650px]"
          style={{
            bottom: "0%",
            left: "-8%",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.09) 0%, rgba(212,175,55,0.03) 45%, transparent 70%)",
          }}
        />
        {/* Small accent orb — center */}
        <div
          className="mesh-orb mesh-orb-3 w-[200px] md:w-[300px] lg:w-[400px] h-[200px] md:h-[300px] lg:h-[400px]"
          style={{
            top: "40%",
            left: "35%",
            background:
              "radial-gradient(circle, rgba(159,122,234,0.06) 0%, rgba(212,175,55,0.04) 50%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-container w-full section-px pt-[110px] md:pt-[130px] lg:pt-[140px] pb-24 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16 items-center">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 md:order-1"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[2px] border border-border-line bg-bg-card mb-8 md:mb-10">
              <span className="pulse-dot" />
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-secondary">
                UK Registered Digital Product Studio
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 md:mb-8">
              <span className="block text-text-primary leading-[1.05]">
                We Build
              </span>
              <span className="block shimmer-text leading-[1.05]">
                Digital Infrastructure
              </span>
              <span className="block text-text-muted leading-[1.05]">
                That Endures.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-[15px] md:text-[17px] leading-[1.75] text-text-secondary max-w-[480px] mb-8 md:mb-10">
              Founded by an enterprise capital programme manager and a
              cybersecurity specialist — bringing Fortune 500 discipline to
              businesses and communities that deserve to operate at a higher
              level.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10 md:mb-14">
              <Button href="/contact">Start a Project</Button>
              <Button href="/work" variant="outline">
                View Our Work
              </Button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 pt-6 border-t border-gold-border/20">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex items-center ${
                    i > 0
                      ? "sm:border-l sm:border-gold-border sm:pl-6 md:pl-8"
                      : ""
                  }`}
                >
                  <div>
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

          {/* Right column — Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center order-1 md:order-2"
          >
            <div
              className="absolute w-[220px] md:w-[300px] lg:w-[400px] h-[220px] md:h-[300px] lg:h-[400px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(159,122,234,0.1) 0%, rgba(212,175,55,0.04) 50%, transparent 70%)",
              }}
            />
            <div className="absolute w-[180px] md:w-[260px] lg:w-[340px] h-[180px] md:h-[260px] lg:h-[340px] rounded-full border border-gold-border/15 animate-[pulse-ring_3s_ease-out_infinite] hidden sm:block" />
            <div className="float-animation relative z-10">
              <Image
                src="/logo-tree.png"
                alt="Sagacity Network"
                width={340}
                height={260}
                className="w-[160px] md:w-[240px] lg:w-[340px] h-auto drop-shadow-[0_0_20px_rgba(212,175,55,0.3)] drop-shadow-[0_0_60px_rgba(159,122,234,0.15)]"
                style={{ filter: "brightness(1.3)" }}
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hidden lg:flex">
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
