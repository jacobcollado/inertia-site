import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllWork } from "@/lib/work";

const BASE = "https://byinertia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const work = getAllWork();

  const mostRecentPost = posts.length > 0
    ? new Date(Math.max(...posts.map(p => new Date(p.date).getTime())))
    : new Date("2025-01-01");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                        lastModified: mostRecentPost,          changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/aether`,            lastModified: new Date("2025-05-01"),  changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/aether/buy`,        lastModified: new Date("2025-05-01"),  changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/aether/enterprise`, lastModified: new Date("2025-04-01"),  changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/aether/changelog`,  lastModified: new Date(),              changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/work`,              lastModified: new Date("2025-04-01"),  changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`,              lastModified: mostRecentPost,          changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/docs`,              lastModified: new Date("2025-03-01"),  changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`,           lastModified: new Date("2025-01-01"),  changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE}/careers`,           lastModified: new Date("2025-03-01"),  changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/policies`,                      lastModified: new Date("2026-05-01"),  changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/policies/terms-of-service`,     lastModified: new Date("2026-05-01"),  changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/policies/privacy-policy`,       lastModified: new Date("2026-05-01"),  changeFrequency: "yearly",  priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const workRoutes: MetadataRoute.Sitemap = work.map((w) => ({
    url: `${BASE}/work/${w.slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...workRoutes];
}
