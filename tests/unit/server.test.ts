import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "@/lib/server/security-headers.mjs";
import { tagsForWebhook, verifyShopifyHmac } from "@/lib/server/webhooks";

const sign = (body: string, secret: string) => createHmac("sha256", secret).update(body, "utf8").digest("base64");

describe("verifyShopifyHmac", () => {
  const body = JSON.stringify({ id: 1, handle: "yame" });
  it("accepts a valid signature", () => {
    expect(verifyShopifyHmac(body, sign(body, "s3cret"), "s3cret")).toBe(true);
  });
  it("rejects a wrong secret, tampered body, missing header or secret", () => {
    expect(verifyShopifyHmac(body, sign(body, "other"), "s3cret")).toBe(false);
    expect(verifyShopifyHmac(`${body} `, sign(body, "s3cret"), "s3cret")).toBe(false);
    expect(verifyShopifyHmac(body, null, "s3cret")).toBe(false);
    expect(verifyShopifyHmac(body, sign(body, "s3cret"), undefined)).toBe(false);
    expect(verifyShopifyHmac(body, "not-base64!!", "s3cret")).toBe(false);
  });
});

describe("tagsForWebhook", () => {
  it("maps product topics to product and collection tags", () => {
    expect(tagsForWebhook("products/update", { handle: "yame" })).toEqual(["products", "product:yame", "collections"]);
    expect(tagsForWebhook("inventory_levels/update", null)).toEqual(["products"]);
  });
  it("maps collections, metaobjects and shop", () => {
    expect(tagsForWebhook("collections/update", { handle: "matcha" })).toEqual(["collections", "collection:matcha"]);
    expect(tagsForWebhook("metaobjects/update", { type: "site_settings" })).toEqual(["settings"]);
    expect(tagsForWebhook("metaobjects/update", { type: "faq_entry" })).toEqual(["content"]);
    expect(tagsForWebhook("shop/update", null)).toEqual(["settings", "content"]);
  });
  it("ignores unknown topics", () => {
    expect(tagsForWebhook("orders/create", {})).toEqual([]);
    expect(tagsForWebhook(null, null)).toEqual([]);
  });
});

describe("security headers", () => {
  it("ships CSP report-only with locked-down framing and objects", () => {
    const csp = contentSecurityPolicy({ dev: false });
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("img-src 'self' data: blob: https://cdn.shopify.com");
    expect(csp).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy({ dev: true })).toContain("unsafe-eval");
    const names = securityHeaders({ dev: false }).map((h) => h.key);
    expect(names).toEqual(expect.arrayContaining(["Content-Security-Policy-Report-Only", "X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security"]));
    expect(securityHeaders({ dev: true }).map((h) => h.key)).not.toContain("Strict-Transport-Security");
  });
});
