import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training — Sagacity Network Academy",
  description:
    "Corporate training, developer bootcamps, AI workshops, and cybersecurity awareness. Hands-on courses taught by practitioners.",
  alternates: { canonical: "https://sagacitynetwork.net/training" },
  openGraph: {
    title: "Training — Sagacity Network Academy",
    description: "Upskill your team with practitioners, not lecturers.",
    url: "https://sagacitynetwork.net/training",
  },
};

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
