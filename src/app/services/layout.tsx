import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Sagacity Network",
  description:
    "Web development, data intelligence, business automation, cybersecurity, and training. Everything you need from one UK-based digital studio.",
  openGraph: {
    title: "Services — Sagacity Network",
    description: "Full-stack digital services from a UK-registered product studio.",
    url: "https://sagacitynetwork.net/services",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
