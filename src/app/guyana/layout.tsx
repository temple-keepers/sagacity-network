import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Design for Guyana & Caribbean — Sagacity Network",
  description:
    "Professional websites for Guyanese businesses. Live in 5 days, secured from day one. Starting at $350. Built by the diaspora, for the diaspora.",
  keywords: [
    "website design Guyana",
    "web design Georgetown",
    "professional website Guyana",
    "cybersecurity Guyana",
    "web developer Caribbean",
  ],
  openGraph: {
    title: "Web Design for Guyana & Caribbean — Sagacity Network",
    description: "Professional websites for Guyanese businesses. Live in 5 days. Starting at $350.",
    url: "https://sagacitynetwork.net/guyana",
  },
};

export default function GuyanaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
