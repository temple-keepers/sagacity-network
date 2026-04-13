"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/training", label: "Training" },
  { href: "/guyana", label: "Guyana" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "color-mix(in srgb, var(--color-bg) 96%, transparent)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <nav className="max-w-site section-px flex items-center justify-between h-[72px]">
        {/* Wordmark logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span
            className="text-[20px] font-[800] tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            <span style={{ color: "var(--color-accent)" }}>●</span>{" "}SAGACITY
          </span>
          <span
            className="text-[10px] font-[300] tracking-[0.28em] ml-[18px]"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-muted)" }}
          >
            NETWORK
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-[400] transition-colors duration-200 hover:text-[var(--color-ink)]"
              style={{ color: "var(--color-muted)" }}
            >
              {l.label}
            </Link>
          ))}

          <ThemeToggle />

          <Link
            href="/contact"
            className="px-6 py-2.5 text-[12px] font-[500] tracking-[0.04em] transition-opacity duration-200 hover:opacity-85"
            style={{
              background: "var(--color-accent)",
              color: "#FFFFFF",
              borderRadius: 0,
            }}
          >
            Get in touch
          </Link>
        </div>

        {/* Mobile right side */}
        <div className="lg:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 top-[72px] z-40 flex flex-col items-center justify-center gap-8"
          style={{ background: "var(--color-bg)" }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[28px] font-[600] transition-colors"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-4 px-8 py-3.5 text-[14px] font-[500]"
            style={{ background: "var(--color-accent)", color: "#FFFFFF", borderRadius: 0 }}
          >
            Get in touch
          </Link>
        </div>
      )}
    </header>
  );
}
