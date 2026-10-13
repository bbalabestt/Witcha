import type { MetadataRoute } from "next";

/** Only production on the real domain is indexable; previews and waitlist mode are not. */
export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const indexable = process.env.NODE_ENV === "production" && !site.includes("localhost") && process.env.NEXT_PUBLIC_SITE_MODE !== "waitlist";
  return {
    rules: indexable ? [{ userAgent: "*", allow: "/", disallow: ["/cart", "/search", "/api/", "/account", "/dev/"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${site.replace(/\/$/, "")}/sitemap.xml`,
  };
}
