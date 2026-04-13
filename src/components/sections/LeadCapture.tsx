"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function LeadCapture() {
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Ambient orbs */}
      <div className="glow-orb glow-orb-purple w-[400px] h-[400px] top-[-100px] left-[10%] opacity-20" />
      <div className="glow-orb glow-orb-gold w-[300px] h-[300px] bottom-[-100px] right-[15%] opacity-15" />

      <div className="max-w-site section-px relative z-10 text-center">
        <ScrollReveal>
          <span
            className="inline-block text-[12px] font-[500] tracking-[0.12em] uppercase mb-5"
            style={{ color: "#D4B85A" }}
          >
            Free Assessment
          </span>
          <h2
            className="text-[32px] md:text-[44px] font-[800] tracking-[-0.03em] mb-5 max-w-[600px] mx-auto"
            style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
          >
            Not sure where
            <br />
            <span className="text-gradient-gold" style={{ WebkitTextFillColor: "transparent" }}>
              to start?
            </span>
          </h2>
          <p
            className="text-[16px] font-[300] leading-[1.7] mb-10 max-w-[440px] mx-auto"
            style={{ color: "rgba(240, 236, 244, 0.55)" }}
          >
            Take the 5-minute Digital Readiness Assessment.
            Get a free action plan tailored to your business.
          </p>
          <Link
            href="/assessment"
            className="shimmer-btn inline-block px-10 py-4 text-[14px] font-[500] tracking-[0.02em] transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #D4B85A 0%, #C9A84C 100%)",
              color: "#1A1128",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Start the assessment
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
