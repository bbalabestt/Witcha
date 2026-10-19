import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";
import { getCollectionHandles, getGuides, getPolicies, getProducts } from "@/lib/data/catalog";

const PAGES = ["/", "/pages/academy", "/pages/our-story", "/pages/faq", "/pages/shipping-returns", "/pages/contact", "/blogs/brewing-guides"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env().siteUrl;
  const [products, collections, guides, policies] = await Promise.all([getProducts(), getCollectionHandles(), getGuides(), getPolicies()]);
  return [
    ...PAGES.map((p) => ({ url: `${base}${p}` })),
    ...collections.map((h) => ({ url: `${base}/collections/${h}` })),
    ...products.filter((p) => p.kind === "tea").map((p) => ({ url: `${base}/products/${p.handle}` })),
    ...guides.map((g) => ({ url: `${base}/blogs/brewing-guides/${g.handle}` })),
    ...policies.map((p) => ({ url: `${base}/policies/${p.handle}` })),
  ];
}
