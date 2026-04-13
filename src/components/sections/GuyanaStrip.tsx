import Link from "next/link";

export default function GuyanaStrip() {
  return (
    <section className="py-20 md:py-28" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-site section-px">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 text-[12px] mb-6"
              style={{ border: "1px solid var(--color-accent)", color: "var(--color-accent)", borderRadius: 0 }}
            >
              {"\uD83C\uDDEC\uD83C\uDDFE"} Guyana
            </div>
            <h2
              className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Built for Guyana.
            </h2>
            <p
              className="text-[16px] font-[300] leading-[1.7] mb-8 max-w-[480px]"
              style={{ color: "var(--color-muted)" }}
            >
              Professional websites, secured from day one, live in 5 days.
              Built by people who understand the diaspora and the world
              you&apos;re trying to reach.
            </p>
            <Link
              href="/guyana"
              className="text-[14px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--color-accent)" }}
            >
              See the Guyana offer &rarr;
            </Link>
          </div>
          <div
            className="w-full h-[240px] flex items-center justify-center"
            style={{ background: "var(--color-border)", borderRadius: "var(--radius-md)" }}
          >
            <span className="text-[13px] opacity-40">Illustration placeholder</span>
          </div>
        </div>
      </div>
    </section>
  );
}
