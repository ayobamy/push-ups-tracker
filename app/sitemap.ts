import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
