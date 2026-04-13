import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Sagacity Network",
  description:
    "UK-registered digital product studio founded by practitioners. Web development, data intelligence, automation, cybersecurity, and training.",
  openGraph: {
    title: "About — Sagacity Network",
    description: "Built by practitioners, not theorists. Meet the team behind Sagacity Network.",
    url: "https://sagacitynetwork.net/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
