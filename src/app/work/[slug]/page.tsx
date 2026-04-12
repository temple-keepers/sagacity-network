import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PORTFOLIO } from "@/lib/data/portfolio";
import CaseStudyContent from "./CaseStudyContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PORTFOLIO.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PORTFOLIO.find((p) => p.slug === slug);
  if (!project) return { title: "Not Found" };

  return {
    title: `${project.name} — Case Study | Sagacity Network`,
    description: project.description,
    openGraph: {
      title: `${project.name} — ${project.category}`,
      description: project.description,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = PORTFOLIO.find((p) => p.slug === slug);
  if (!project) notFound();

  return <CaseStudyContent project={project} />;
}
