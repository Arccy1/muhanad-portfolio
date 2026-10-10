import type { MetadataRoute } from "next";
import { getAllProjectSlugs } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/portfolio", "/about", "/services", "/showreel", "/cv", "/contact"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllProjectSlugs();
    projectRoutes = slugs.map((p) => ({
      url: `${BASE}/portfolio/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // database unavailable — ship static routes only
  }

  return [...staticRoutes, ...projectRoutes];
}
