import type { MetadataRoute } from "next";
import { BLOG_HANDLE } from "@/lib/config/site";
import { getArticles, getCollectionHandles, getProduct, getProductHandles } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo/json-ld";

const STATIC = ["/", "/pages/academy", "/pages/our-story", "/pages/faq", "/pages/shipping-returns", "/pages/contact", `/blogs/${BLOG_HANDLE}`];
const POLICIES = ["privacy-policy", "terms-of-service", "refund-policy", "shipping-policy"];

/** Generated from the repository so it always matches what is live. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [handles, collections, articles] = await Promise.all([getProductHandles(), getCollectionHandles(), getArticles(BLOG_HANDLE)]);
  const products = await Promise.all(handles.map((h) => getProduct(h)));
  return [
    ...STATIC.map((p) => ({ url: absoluteUrl(p), changeFrequency: "weekly" as const })),
    ...collections.map((h) => ({ url: absoluteUrl(`/collections/${h}`), changeFrequency: "daily" as const })),
    ...products.filter((p) => p !== null).map((p) => ({ url: absoluteUrl(`/products/${p.handle}`), lastModified: p.updatedAt, changeFrequency: "daily" as const })),
    ...articles.map((a) => ({ url: absoluteUrl(`/blogs/${a.blogHandle}/${a.handle}`), lastModified: a.publishedAt })),
    ...POLICIES.map((h) => ({ url: absoluteUrl(`/policies/${h}`), changeFrequency: "yearly" as const })),
  ];
}
