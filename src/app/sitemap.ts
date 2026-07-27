import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Only publicly useful pages. The dashboard and admin areas are behind auth
 * and are excluded here as well as in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/docs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
