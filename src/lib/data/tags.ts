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

/** Tags that can be revalidated by name through the manual (secret-protected) path. */
export const MANUAL_TAGS = new Set<string>(["products", "collections", "menus", "settings", "content"]);
