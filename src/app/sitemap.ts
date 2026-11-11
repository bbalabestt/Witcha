import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";
import { LIVE } from "@/lib/config/launch";
import { TEAS_HREF } from "@/lib/config/site";
import { getGuides, getPolicies, getProducts } from "@/lib/data/catalog";

const PAGES = [
  "/",
  TEAS_HREF,
  "/pages/academy",
  "/pages/recipes",
  "/pages/faq",
  ...(LIVE.ourStory ? ["/pages/our-story"] : []),
  ...(LIVE.shippingReturns ? ["/pages/shipping-returns"] : []),
  ...(LIVE.contact ? ["/pages/contact"] : []),
  ...(LIVE.guides ? ["/blogs/brewing-guides"] : []),
  ...(LIVE.gifts ? ["/collections/gifts"] : []),
  ...(LIVE.accessories ? ["/collections/accessories"] : []),
];

/** Live routes only: a held page never reaches a search engine. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env().siteUrl;
  const [products, guides, policies] = await Promise.all([getProducts(), getGuides(), getPolicies()]);
  return [
    ...PAGES.map((p) => ({ url: `${base}${p}` })),
    ...products.filter((p) => p.kind === "tea").map((p) => ({ url: `${base}/products/${p.handle}` })),
    ...(LIVE.guides ? guides.map((g) => ({ url: `${base}/blogs/brewing-guides/${g.handle}` })) : []),
    ...(LIVE.policies ? policies.filter((p) => p.body).map((p) => ({ url: `${base}/policies/${p.handle}` })) : []),
  ];
}
