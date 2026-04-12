import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Sagacity Network",
  description:
    "Web development, data intelligence, AI automation, cybersecurity, and training. Five disciplines delivered by one studio.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
