import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-[140px] pb-20 md:pb-28" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-site section-px">
        {/* Pill */}
        <div
          className="reveal inline-flex items-center px-4 py-1.5 mb-8 text-[12px] tracking-[0.04em]"
          style={{
            border: "1px solid var(--color-accent)",
            color: "var(--color-accent)",
            borderRadius: 0,
          }}
        >
          UK Digital Product Studio
        </div>

        {/* Headline */}
        <h1
          className="reveal reveal-d1 text-[40px] md:text-[56px] lg:text-[64px] font-[800] leading-[1.08] tracking-[-0.02em] mb-6 max-w-[780px]"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          We build digital products that work.
        </h1>

        {/* Subheadline */}
        <p
          className="reveal reveal-d2 text-[17px] md:text-[20px] font-[300] leading-[1.7] mb-10 max-w-[560px]"
          style={{ color: "var(--color-muted)" }}
        >
          Web apps, data systems, automation, and security. Built by
          practitioners &mdash; for businesses that deserve to operate at a
          higher level.
        </p>

        {/* CTAs */}
        <div className="reveal reveal-d3 flex flex-wrap gap-3 mb-12">
          <Link
            href="/work"
            className="px-7 py-3.5 text-[13px] font-[500] tracking-[0.04em] transition-all duration-200 hover:opacity-85 hover:-translate-y-0.5"
            style={{ background: "var(--color-accent)", color: "#FFFFFF", borderRadius: 0 }}
          >
            See our work
          </Link>
          <Link
            href="/contact"
            className="px-7 py-3.5 text-[13px] font-[500] tracking-[0.04em] transition-all duration-200 hover:opacity-85 hover:-translate-y-0.5"
            style={{
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
              borderRadius: 0,
            }}
          >
            Talk to us
          </Link>
        </div>

        {/* Trust strip */}
        <p
          className="reveal reveal-d4 text-[13px] font-[300] tracking-[0.02em]"
          style={{ color: "var(--color-muted)" }}
        >
          5 live platforms &nbsp;&middot;&nbsp; UK Registered &nbsp;&middot;&nbsp;
          Enterprise background, startup speed
        </p>
      </div>
    </section>
  );
}
