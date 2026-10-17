import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";

export default function robots(): MetadataRoute.Robots {
  const e = env();
  // Fixture previews and the waitlist mode are never indexed; live Shopify data is.
  const indexable = e.commerceSource === "shopify" && e.siteMode === "live";
  return {
    rules: indexable ? [{ userAgent: "*", allow: "/", disallow: ["/cart", "/search", "/api/", "/dev/", "/account"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${e.siteUrl}/sitemap.xml`,
  };
}
