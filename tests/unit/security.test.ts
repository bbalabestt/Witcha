import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/html";
import { verifyShopifyHmac } from "@/lib/http/hmac";
import { productJsonLd } from "@/lib/seo";
import { PRODUCTS } from "@/lib/data/fixtures/catalog";

describe("sanitizeHtml", () => {
  it("keeps basic text markup and drops everything else", () => {
    const out = sanitizeHtml('<p class="x" onclick="evil()">Hi <b>there</b></p><script>alert(1)</script><img src=x onerror=alert(1)>');
    expect(out).toBe("<p>Hi <b>there</b></p>");
  });

  it("allows only safe link targets", () => {
    expect(sanitizeHtml('<a href="https://ex.com">a</a>')).toBe('<a href="https://ex.com" rel="noopener">a</a>');
    expect(sanitizeHtml('<a href="javascript:alert(1)">a</a>')).toBe("<a>a</a>");
    expect(sanitizeHtml('<a href="//evil.com">a</a>')).toBe("<a>a</a>");
  });
});

describe("verifyShopifyHmac", () => {
  const body = '{"id":1}';
  const sig = createHmac("sha256", "secret").update(body, "utf8").digest("base64");

  it("accepts a correct signature and rejects others", () => {
    expect(verifyShopifyHmac(body, sig, "secret")).toBe(true);
    expect(verifyShopifyHmac(body, sig, "other")).toBe(false);
    expect(verifyShopifyHmac(body + " ", sig, "secret")).toBe(false);
    expect(verifyShopifyHmac(body, null, "secret")).toBe(false);
    expect(verifyShopifyHmac(body, sig, "")).toBe(false);
  });
});

describe("Product JSON-LD", () => {
  it("never publishes placeholder prices and cannot break out of the script tag", () => {
    const fixture = PRODUCTS[0]!;
    const ld = productJsonLd({ ...fixture, title: "</script><b>" }, "https://witcha.example");
    expect(ld).not.toContain("</script>");
    expect(JSON.parse(ld).offers).toBeUndefined();
  });
});
