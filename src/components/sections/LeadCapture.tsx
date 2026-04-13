import Link from "next/link";

export default function LeadCapture() {
  return (
    <section className="py-16 md:py-20" style={{ background: "#1C1C1C" }}>
      <div className="max-w-site section-px text-center">
        <h2
          className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-4"
          style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}
        >
          Not sure where to start?
        </h2>
        <p
          className="text-[16px] font-[300] leading-[1.7] mb-8 max-w-[480px] mx-auto"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Take the 5-minute Digital Readiness Assessment and get a free action
          plan.
        </p>
        <Link
          href="/contact"
          className="inline-block px-8 py-3.5 text-[14px] font-medium transition-opacity hover:opacity-85"
          style={{ background: "#FFFFFF", color: "var(--color-ink)", borderRadius: 0 }}
        >
          Start the assessment
        </Link>
      </div>
    </section>
  );
}
