import Link from "next/link";
import Image from "next/image";

const COLS = {
  Services: [
    { href: "/services/web-dev", label: "Web & App Development" },
    { href: "/services/data", label: "Data Intelligence" },
    { href: "/services/automation", label: "Automation & AI" },
    { href: "/services/security", label: "Cybersecurity" },
    { href: "/services/training", label: "Training" },
  ],
  Platforms: [
    { href: "/work/temple-keepers", label: "Temple Keepers" },
    { href: "/work/rhythm-and-roots", label: "Rhythm & Roots" },
    { href: "/work/totenga", label: "Totenga" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
    { href: "/guyana", label: "Guyana" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-footer)", color: "#F0ECF4" }}>
      {/* Top gradient line */}
      <div
        className="h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(123, 63, 160, 0.4), rgba(201, 168, 76, 0.3), transparent)",
        }}
      />

      <div className="max-w-site section-px pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-tree.png"
                alt="Sagacity Network"
                width={36}
                height={36}
              />
              <div className="flex flex-col leading-none">
                <span
                  className="text-[17px] font-[800] tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  SAGACITY
                </span>
                <span
                  className="text-[8px] font-[300] tracking-[0.28em] opacity-50"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  NETWORK
                </span>
              </div>
            </Link>
            <p className="text-[13px] leading-[1.7] opacity-40 max-w-[240px]">
              UK digital product studio. Enterprise background, startup speed.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(COLS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11px] font-[500] tracking-[0.14em] uppercase mb-4 opacity-35">
                {title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] opacity-50 hover:opacity-100 transition-opacity duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(240, 236, 244, 0.08)" }}
        >
          <p className="text-[11px] opacity-35">
            &copy;&nbsp;{new Date().getFullYear()}&nbsp;Sagacity Network Ltd.
            Registered in England &amp; Wales.
          </p>
          <a
            href="mailto:hello@sagacitynetwork.net"
            className="text-[12px] opacity-40 hover:opacity-100 transition-opacity"
          >
            hello@sagacitynetwork.net
          </a>
        </div>
      </div>
    </footer>
  );
}
