import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
  Services: [
    { href: "/services#web-app-development", label: "Web & App Development" },
    { href: "/services#data-intelligence", label: "Data & Intelligence" },
    { href: "/services#automation-ai", label: "Automation & AI" },
    { href: "/services#cybersecurity", label: "Cybersecurity" },
    { href: "/services#training", label: "Training & Workshops" },
  ],
  Company: [
    { href: "/work", label: "Our Work" },
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  Explore: [
    { href: "/training", label: "Sagacity Academy" },
    { href: "/guyana", label: "Guyana Digital" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative" style={{ background: "var(--bg-footer)" }}>
      {/* Top border — visible in both themes */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: "var(--border-hover)" }}
      />

      <div className="max-container px-6 md:px-12 lg:px-20">
        {/* Main grid — generous vertical padding */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-y-10 gap-x-8 lg:gap-x-16 items-start"
          style={{ paddingTop: 72, paddingBottom: 56 }}
        >
          {/* Brand column */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-tree.png"
                alt="Sagacity Network"
                width={38}
                height={29}
                className="w-[32px] h-auto"
                style={{
                  filter:
                    "brightness(1.3) drop-shadow(0 0 10px rgba(212,175,55,0.3))",
                }}
              />
              <span className="font-display text-[17px] font-light tracking-[0.02em] text-text-primary">
                Sagacity Network
              </span>
            </Link>
            <p className="text-[13px] leading-[1.75] text-text-secondary max-w-[260px] mb-4">
              UK-registered digital product studio. Enterprise discipline meets
              human scale.
            </p>
            <p className="text-[12px] text-text-muted tracking-[0.06em] flex items-center gap-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "var(--gold)" }}
              />
              Basildon, England
            </p>
          </div>

          {/* Link columns — aligned to top */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4
                className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-5"
                style={{ color: "var(--gold)" }}
              >
                {title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-text-secondary hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--border-hover)" }}
        >
          <p className="text-[11px] text-text-muted tracking-[0.02em]">
            &copy;&nbsp;{new Date().getFullYear()}&nbsp;Sagacity Network Ltd.
            Registered in England &amp; Wales.
          </p>
          <a
            href="mailto:hello@sagacitynetwork.net"
            className="text-[12px] transition-colors duration-300 tracking-[0.02em]"
            style={{ color: "var(--gold)" }}
          >
            hello@sagacitynetwork.net
          </a>
        </div>
      </div>
    </footer>
  );
}
