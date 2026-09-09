import type { MetadataRoute } from "next";
import { EVENT } from "@/lib/event";

/** Two public pages. No application route exists until Gate 3 opens one. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: EVENT.url, changeFrequency: "weekly", priority: 1 },
    {
      url: `${EVENT.url}/code-of-conduct`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
