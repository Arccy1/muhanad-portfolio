import type { MetadataRoute } from "next";
import { getAllProjectSlugs, getPublishedPosts } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/portfolio",
    "/about",
    "/services",
    "/showreel",
    "/cv",
    "/blog",
    "/start",
    "/contact",
  ].map((path) => ({
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

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    postRoutes = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // database unavailable
  }

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
