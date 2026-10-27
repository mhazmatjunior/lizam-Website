import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, API and per-order checkout pages have nothing worth indexing.
      disallow: ["/admin", "/api/", "/checkout"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
