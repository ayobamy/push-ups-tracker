import type { MetadataRoute } from "next";
import { publicSiteOrigin, ROBOTS_DISALLOW } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const origin = publicSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ROBOTS_DISALLOW,
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
