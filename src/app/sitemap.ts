import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/").toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl("/legal/imprint").toString(),
      lastModified: new Date("2026-04-01"),
      changeFrequency: "yearly",
      priority: 0.2
    },
    {
      url: absoluteUrl("/legal/privacy").toString(),
      lastModified: new Date("2026-05-01"),
      changeFrequency: "yearly",
      priority: 0.2
    }
  ];
}