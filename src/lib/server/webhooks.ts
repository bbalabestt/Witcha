import { createHmac, timingSafeEqual } from "node:crypto";
import { TAGS } from "@/lib/data/tags";

/** Verifies `X-Shopify-Hmac-Sha256` (base64 HMAC-SHA256 of the raw body) in constant time. */
export function verifyShopifyHmac(rawBody: string, header: string | null, secret: string | undefined): boolean {
  if (!header || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  let given: Buffer;
  try {
    given = Buffer.from(header, "base64");
  } catch {
    return false;
  }
  return given.length === expected.length && timingSafeEqual(given, expected);
}

type Payload = { handle?: unknown; type?: unknown } | null;

/** Maps a Shopify webhook topic to the cache tags it invalidates. Unknown topics invalidate nothing. */
export function tagsForWebhook(topic: string | null, payload: Payload): string[] {
  const handle = typeof payload?.handle === "string" ? payload.handle : null;
  switch (topic) {
    case "products/create":
    case "products/update":
    case "products/delete":
      return [TAGS.products, ...(handle ? [TAGS.product(handle)] : []), TAGS.collections];
    case "inventory_levels/update":
    case "inventory_items/update":
      // Inventory payloads carry no product handle.
      return [TAGS.products];
    case "collections/create":
    case "collections/update":
    case "collections/delete":
      return [TAGS.collections, ...(handle ? [TAGS.collection(handle)] : [])];
    case "metaobjects/create":
    case "metaobjects/update":
    case "metaobjects/delete": {
      const type = typeof payload?.type === "string" ? payload.type : "";
      if (type === "site_settings") return [TAGS.settings];
      if (type === "faq_entry") return [TAGS.content];
      // Characters and prep methods are read through products.
      return [TAGS.products, TAGS.content];
    }
    case "shop/update":
      return [TAGS.settings, TAGS.content];
    default:
      return [];
  }
}
