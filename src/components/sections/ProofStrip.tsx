const STATS = [
  { value: "5", label: "Live platforms built" },
  { value: "2", label: "Expert founders" },
  { value: "UK", label: "Registered company" },
  { value: "5", label: "Services in one studio" },
];

export default function ProofStrip() {
  return (
    <section style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="max-w-site section-px py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`text-center ${i > 0 ? "md:border-l" : ""}`}
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="text-[28px] md:text-[32px] font-[800] leading-none mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}
              >
                {s.value}
              </div>
              <div className="text-[13px]" style={{ color: "var(--color-muted)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
