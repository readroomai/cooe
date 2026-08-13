import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

const ROUTES = [
  { path: "", priority: 1 },
  { path: "/studio/check", priority: 0.9 },
  { path: "/studio/map", priority: 0.8 },
  { path: "/studio/rehearse", priority: 0.8 },
  { path: "/studio/repair", priority: 0.8 },
  { path: "/about", priority: 0.5 },
  { path: "/pricing", priority: 0.5 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route.priority,
  }));
}
