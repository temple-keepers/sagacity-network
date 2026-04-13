import Link from "next/link";

const COLS = {
  Services: [
    { href: "/services", label: "Web & App Development" },
    { href: "/services", label: "Data Intelligence" },
    { href: "/services", label: "Automation & AI" },
    { href: "/services", label: "Cybersecurity" },
    { href: "/services", label: "Training" },
  ],
  Platforms: [
    { href: "/work", label: "Temple Keepers" },
    { href: "/work", label: "Rhythm & Roots" },
    { href: "/work", label: "Crack Solve" },
    { href: "/work", label: "Totenga" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
    { href: "/guyana", label: "Guyana" },
    { href: "/contact", label: "Contact" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: "#1C1C1C", color: "#FFFFFF" }}>
      <div className="max-w-site section-px pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <div
              className="text-[20px] font-[800] tracking-[-0.02em] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span style={{ color: "var(--color-accent)" }}>●</span> SAGACITY
            </div>
            <p className="text-[13px] leading-[1.7] opacity-50 max-w-[240px]">
              UK digital product studio. Enterprise background, startup speed.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(COLS).map(([title, links]) => (
            <div key={title}>
              <h4
                className="text-[11px] font-medium tracking-[0.14em] uppercase mb-4 opacity-40"
              >
                {title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] opacity-60 hover:opacity-100 transition-opacity duration-200"
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
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-[11px] opacity-40">
            &copy;&nbsp;{new Date().getFullYear()}&nbsp;Sagacity Network Ltd.
            Registered in England &amp; Wales.
          </p>
          <a
            href="mailto:hello@sagacitynetwork.net"
            className="text-[12px] opacity-50 hover:opacity-100 transition-opacity"
          >
            hello@sagacitynetwork.net
          </a>
        </div>
      </div>
    </footer>
  );
}
