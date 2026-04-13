import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Readiness Assessment — Sagacity Network",
  description:
    "Find out how digitally ready your business is. Free 2-minute assessment covering web presence, automation, data, and security.",
  alternates: { canonical: "https://sagacitynetwork.net/assessment" },
  openGraph: {
    title: "Digital Readiness Assessment — Sagacity Network",
    description: "Free 2-minute assessment. Find out where your business stands digitally.",
    url: "https://sagacitynetwork.net/assessment",
  },
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
