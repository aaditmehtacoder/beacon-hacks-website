import type { MetadataRoute } from "next";
import { EVENT } from "@/lib/event";

/** The public pages. /admin is deliberately not here. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: EVENT.url, changeFrequency: "weekly", priority: 1 },
    { url: `${EVENT.url}/apply`, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${EVENT.url}/code-of-conduct`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
