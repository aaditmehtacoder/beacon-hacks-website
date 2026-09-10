import type { MetadataRoute } from "next";
import { EVENT } from "@/lib/event";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/outreachdashboard"] },
    sitemap: `${EVENT.url}/sitemap.xml`,
  };
}
