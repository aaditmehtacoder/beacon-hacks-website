import type { MetadataRoute } from "next";
import { EVENT } from "@/lib/event";

/** The public pages. */
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
