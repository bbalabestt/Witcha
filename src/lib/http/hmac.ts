import { createHmac, timingSafeEqual } from "node:crypto";

/** Verifies Shopify's `X-Shopify-Hmac-Sha256` header (base64 HMAC-SHA256 of the raw body). */
export function verifyShopifyHmac(rawBody: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  let given: Buffer;
  try {
    given = Buffer.from(header, "base64");
  } catch {
    return false;
  }
  return given.length === digest.length && timingSafeEqual(given, digest);
}
