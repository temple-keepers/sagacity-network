import type { MetadataRoute } from "next";
import { PLATFORMS } from "@/lib/data/portfolio";

const BASE = "https://sagacitynetwork.net";

const SERVICE_SLUGS = [
  "web-dev",
  "data",
  "automation",
  "security",
  "training",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/guyana`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/training`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/assessment`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = PLATFORMS.map((p) => ({
    url: `${BASE}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...serviceRoutes, ...portfolioRoutes];
}
