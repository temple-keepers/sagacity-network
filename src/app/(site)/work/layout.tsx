import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work — Sagacity Network",
  description:
    "Live platforms built end-to-end by Sagacity Network. Faith apps, cultural platforms, diaspora commerce, education technology, and more.",
  alternates: { canonical: "https://sagacitynetwork.net/work" },
  openGraph: {
    title: "Work — Sagacity Network",
    description: "Not mockups. Live products. See what we've built.",
    url: "https://sagacitynetwork.net/work",
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
