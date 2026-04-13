import Link from "next/link";

const PLATFORMS = [
  {
    name: "Temple Keepers",
    desc: "Faith & wellness platform with AI devotionals, fasting cohorts, and community pods.",
    tags: ["Next.js", "Supabase", "Claude AI"],
    url: "https://templekeepers.app",
  },
  {
    name: "Rhythm & Roots",
    desc: "Cultural discovery platform connecting the global Guyanese diaspora with events and creators.",
    tags: ["Next.js", "Supabase", "Resend"],
    url: "https://rhythmnroots.app",
  },
  {
    name: "Crack Solve",
    desc: "Caribbean education platform with CXC-aligned content, practice questions, and an AI tutor.",
    tags: ["React", "Supabase", "AI Tutor"],
    url: "https://cracksolve.com",
  },
];

export default function Portfolio() {
  return (
    <section className="py-20 md:py-28" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
      <div className="max-w-site section-px">
        <h2
          className="text-[28px] md:text-[36px] font-[800] tracking-[-0.02em] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What we&apos;ve built
        </h2>
        <p className="text-[15px] mb-12" style={{ color: "var(--color-muted)" }}>
          Live platforms &mdash; not mockups, not client work.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {PLATFORMS.slice(0, 2).map((p) => (
            <PlatformCard key={p.name} {...p} />
          ))}
        </div>
        <div className="max-w-[calc(50%-8px)] mx-auto md:max-w-none md:grid md:grid-cols-2 gap-4 mb-10">
          {PLATFORMS.slice(2).map((p) => (
            <PlatformCard key={p.name} {...p} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/work"
            className="text-[14px] font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--color-accent)" }}
          >
            View all platforms &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

function PlatformCard({ name, desc, tags, url }: { name: string; desc: string; tags: string[]; url: string }) {
  return (
    <div
      className="p-7 flex flex-col justify-between"
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        minHeight: 220,
      }}
    >
      <div>
        {/* TODO: replace with actual screenshot */}
        <div
          className="w-full h-[120px] mb-5 flex items-center justify-center"
          style={{ background: "var(--color-border)", borderRadius: "var(--radius-sm)" }}
        >
          <span className="text-[13px] opacity-40">Screenshot placeholder</span>
        </div>
        <h3
          className="text-[20px] font-[600] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {name}
        </h3>
        <p className="text-[14px] leading-[1.6] mb-4" style={{ color: "var(--color-muted)" }}>
          {desc}
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 text-[11px]"
              style={{ background: "var(--color-surface)", borderRadius: "var(--radius-sm)", color: "var(--color-ink)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[13px] font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--color-accent)" }}
      >
        View platform &rarr;
      </a>
    </div>
  );
}
