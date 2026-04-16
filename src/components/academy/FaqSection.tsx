"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = [
  {
    q: "How long do I have access to the course?",
    a: "Lifetime access. Pay once, watch as many times as you like, forever.",
  },
  {
    q: "Do I get a certificate?",
    a: "Not yet. Our current focus is the quality of the course content. Certificates are on the roadmap for 2026.",
  },
  {
    q: "What if the course isn't right for me?",
    a: "Email hello@sagacitynetwork.net within 14 days of purchase for a full refund, no questions asked.",
  },
  {
    q: "Can I expense this through my business?",
    a: "Yes \u2014 we provide a VAT receipt on purchase. Sagacity Network Ltd is UK VAT-registered.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className="rounded-[10px] shadow-border overflow-hidden"
            style={{ background: "var(--surface-0)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[15px] font-[500]" style={{ color: "var(--color-ink)" }}>
                {f.q}
              </span>
              <ChevronDown
                size={18}
                className="flex-shrink-0 transition-transform duration-200"
                style={{
                  color: "var(--color-muted)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </button>
            {isOpen ? (
              <div
                className="px-4 pb-4 text-[14px] leading-[1.7]"
                style={{ color: "var(--color-muted)" }}
              >
                {f.a}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
