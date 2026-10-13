import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getServerEnv } from "@/lib/config/env";
import { SITE_SETTINGS_FALLBACK } from "@/lib/config/site";
import { createShopifyClient } from "@/lib/shopify/client";
import { ShopifyRepository } from "@/lib/shopify/repository";
import { FixtureRepository } from "./fixtures/repository";
import { money } from "./money";
import type { CommerceRepository } from "./repository";
import type { CollectionQuery } from "./types";

/** Revalidation tags. `/api/revalidate` maps Shopify webhook topics onto these. */
export const TAGS = {
  products: "products",
  product: (handle: string) => `product:${handle}`,
  collections: "collections",
  collection: (handle: string) => `collection:${handle}`,
  menus: "menus",
  settings: "settings",
  content: "content",
} as const;

let repo: CommerceRepository | undefined;

export function getRepository(): CommerceRepository {
  if (repo) return repo;
  const env = getServerEnv();
  if (env.COMMERCE_SOURCE === "shopify") {
    // env validation guarantees these are set in shopify mode.
    const storeDomain = env.SHOPIFY_STORE_DOMAIN as string;
    const fetchImpl = createShopifyClient({
      storeDomain,
      privateToken: env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN as string,
      apiVersion: env.SHOPIFY_API_VERSION,
    });
    repo = new ShopifyRepository({
      fetch: fetchImpl,
      internalHosts: [storeDomain, new URL(env.NEXT_PUBLIC_SITE_URL).hostname],
      freeShippingThresholdAud: env.FREE_SHIPPING_THRESHOLD_AUD,
    });
  } else {
    const threshold = env.FREE_SHIPPING_THRESHOLD_AUD;
    repo = new FixtureRepository(
      threshold === undefined ? SITE_SETTINGS_FALLBACK : { ...SITE_SETTINGS_FALLBACK, freeShippingThreshold: money(Math.round(threshold * 100), "AUD") },
    );
  }
  return repo;
}

/* ---------- Cached reads (catalogue and content). Cart reads are never cached. ---------- */

export async function getProduct(handle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products, TAGS.product(handle));
  return getRepository().getProduct(handle);
}

export async function getProductHandles() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products);
  return getRepository().getProductHandles();
}

export async function getRelatedProducts(handle: string, limit = 4) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products, TAGS.product(handle));
  return getRepository().getRelatedProducts(handle, limit);
}

export async function getPairings(excludeHandles: string[], limit = 2) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products);
  return getRepository().getPairings(excludeHandles, limit);
}

export async function getCollection(handle: string, query: CollectionQuery = {}) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.collections, TAGS.collection(handle), TAGS.products);
  return getRepository().getCollection(handle, query);
}

export async function getCollectionHandles() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.collections);
  return getRepository().getCollectionHandles();
}

export async function search(query: string, first = 24) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.products, TAGS.content);
  return getRepository().search(query, { first });
}

export async function predictiveSearch(query: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.products, TAGS.content);
  return getRepository().predictiveSearch(query);
}

export async function getMenu(handle: string) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.menus);
  return getRepository().getMenu(handle);
}

export async function getSiteSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.settings);
  return getRepository().getSiteSettings();
}

export async function getFaqEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return getRepository().getFaqEntries();
}

export async function getArticles(blogHandle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return getRepository().getArticles(blogHandle);
}

export async function getArticle(blogHandle: string, handle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return getRepository().getArticle(blogHandle, handle);
}

export async function getPage(handle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return getRepository().getPage(handle);
}

export async function getPolicy(handle: string) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  return getRepository().getPolicy(handle);
}
