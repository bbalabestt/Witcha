import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { repository } from "./index";
import type { CollectionQuery } from "./repository";

/**
 * Cached catalogue reads. Tags match the webhook topics in `/api/revalidate`, which calls
 * `revalidateTag(tag, "max")` so shoppers get stale-while-revalidate content.
 */
export const TAGS = {
  products: "products",
  collections: "collections",
  content: "content",
  settings: "settings",
} as const;

export async function getProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products);
  return repository().getProducts();
}

export async function getProduct(handle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products, `product:${handle}`);
  return repository().getProduct(handle);
}

export async function getCollection(handle: string, query: CollectionQuery = {}) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.collections, TAGS.products, `collection:${handle}`);
  return repository().getCollection(handle, query);
}

export async function getCollectionHandles() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.collections);
  return repository().getCollectionHandles();
}

export async function search(query: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.products, TAGS.content);
  return repository().search(query);
}

export async function getGuides() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return repository().getGuides();
}

export async function getGuide(handle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return repository().getGuide(handle);
}

export async function getPrepMethods() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return repository().getPrepMethods();
}

export async function getFaq() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return repository().getFaq();
}

export async function getCharacters() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);
  return repository().getCharacters();
}

export async function getPolicies() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  return repository().getPolicies();
}

export async function getSiteSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.settings);
  return repository().getSiteSettings();
}
