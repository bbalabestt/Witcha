import { describe, expect, it } from "vitest";
import { FixtureRepository } from "@/lib/data/fixtures/repository";
import { PRODUCTS } from "@/lib/data/fixtures/data";
import { CartUserError } from "@/lib/data/repository";
import { formatMoney } from "@/lib/data/money";
import { EnvError, parseServerEnv } from "@/lib/config/env";

const repo = new FixtureRepository();
const variant = (handle: string, size: string) => PRODUCTS.find((p) => p.handle === handle)!.variants.find((v) => v.size === size)!.id;

describe("FixtureRepository catalogue", () => {
  it("serves the matcha collection with sorting", async () => {
    const page = await repo.getCollection("matcha", { sort: "price-asc" });
    expect(page?.collection.title).toBe("Which Matcha Today?");
    expect(page?.products.nodes.map((p) => p.handle)).toEqual(["daily", "yame"]);
    expect(page?.products.totalCount).toBe(2);
  });

  it("paginates with a cursor", async () => {
    const first = await repo.getCollection("gifts", { first: 3 });
    expect(first?.products.nodes).toHaveLength(3);
    expect(first?.products.pageInfo.hasNextPage).toBe(true);
    const next = await repo.getCollection("gifts", { first: 3, after: first?.products.pageInfo.endCursor });
    expect(next?.products.nodes.map((p) => p.handle)).toEqual(["daily"]);
    expect(next?.products.pageInfo.hasNextPage).toBe(false);
  });

  it("filters", async () => {
    const page = await repo.getCollection("matcha", { filters: [{ kind: "size", value: "100 g" }] });
    expect(page?.products.nodes.map((p) => p.handle)).toEqual(["yame"]);
  });

  it("returns null for unknown handles", async () => {
    expect(await repo.getCollection("nope")).toBeNull();
    expect(await repo.getProduct("nope")).toBeNull();
  });

  it("keeps fixture prices visibly placeholder", async () => {
    const yame = await repo.getProduct("yame");
    expect(formatMoney(yame!.variants[0]!.price)).toBe("$[48.00]");
    expect(yame!.badges).toEqual(["new"]);
  });

  it("searches products and guides with a 2-character minimum", async () => {
    expect((await repo.search("y")).products).toHaveLength(0);
    const r = await repo.search("deep");
    expect(r.products.map((p) => p.handle)).toEqual(["yame"]);
    const g = await repo.search("iced");
    expect(g.articles.map((a) => a.handle)).toContain("iced-latte-poured-over");
  });
});

describe("FixtureRepository cart", () => {
  it("creates, merges lines and caps by stock", async () => {
    const cart = await repo.createCart([{ variantId: variant("yame", "30 g"), quantity: 10 }]);
    expect(cart.totalQuantity).toBe(10);
    const merged = await repo.addCartLines(cart.id, [{ variantId: variant("yame", "30 g"), quantity: 5 }]);
    expect(merged?.lines).toHaveLength(1);
    expect(merged?.totalQuantity).toBe(12); // only 12 in stock
    expect(merged?.cost.subtotal).toEqual({ amount: 57600, currencyCode: "AUD", placeholder: true });
    expect(merged?.checkoutUrl).toMatch(/^https:\/\/checkout\.fixtures\.invalid\/cart\/c\//);
  });

  it("rejects sold-out variants", async () => {
    const cart = await repo.createCart();
    await expect(repo.addCartLines(cart.id, [{ variantId: variant("yame", "100 g"), quantity: 1 }])).rejects.toBeInstanceOf(CartUserError);
  });

  it("updates, removes and zeroes lines", async () => {
    const cart = await repo.createCart([
      { variantId: variant("daily", "30 g"), quantity: 1 },
      { variantId: variant("yame", "30 g"), quantity: 1 },
    ]);
    const [a, b] = cart.lines;
    const updated = await repo.updateCartLines(cart.id, [{ lineId: a!.id, quantity: 9 }]);
    expect(updated?.lines.find((l) => l.id === a!.id)?.quantity).toBe(3); // daily has 3 left
    const removed = await repo.removeCartLines(cart.id, [b!.id]);
    expect(removed?.lines).toHaveLength(1);
    const zeroed = await repo.updateCartLines(cart.id, [{ lineId: a!.id, quantity: 0 }]);
    expect(zeroed?.lines).toHaveLength(0);
    expect(zeroed?.cost.subtotal.amount).toBe(0);
  });

  it("stores gift attributes, trimming the note to 150 characters", async () => {
    const cart = await repo.createCart();
    const updated = await repo.updateCartAttributes(cart.id, { gift: true, giftNote: "x".repeat(200) });
    expect(updated?.attributes.giftNote).toHaveLength(150);
    const off = await repo.updateCartAttributes(cart.id, { gift: false, giftNote: "kept?" });
    expect(off?.attributes).toEqual({ gift: false, giftNote: "" });
  });

  it("returns null for unknown cart ids", async () => {
    expect(await repo.getCart("missing")).toBeNull();
    expect(await repo.addCartLines("missing", [])).toBeNull();
  });
});

describe("env validation", () => {
  it("defaults to fixtures with no Shopify credentials", () => {
    const env = parseServerEnv({});
    expect(env.COMMERCE_SOURCE).toBe("fixtures");
    expect(env.SHOPIFY_API_VERSION).toBe("2026-10");
    expect(env.NEXT_PUBLIC_FEATURE_SHOP_PAY).toBe(false);
  });

  it("requires domain and private token in shopify mode", () => {
    expect(() => parseServerEnv({ COMMERCE_SOURCE: "shopify" })).toThrow(EnvError);
    const env = parseServerEnv({
      COMMERCE_SOURCE: "shopify",
      SHOPIFY_STORE_DOMAIN: "witcha-matcha.myshopify.com",
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "shpat_x",
      FREE_SHIPPING_THRESHOLD_AUD: "80",
    });
    expect(env.FREE_SHIPPING_THRESHOLD_AUD).toBe(80);
  });

  it("rejects malformed values", () => {
    expect(() => parseServerEnv({ SHOPIFY_STORE_DOMAIN: "https://x.myshopify.com/" })).toThrow(/SHOPIFY_STORE_DOMAIN/);
    expect(() => parseServerEnv({ SHOPIFY_API_VERSION: "2026-11" })).toThrow(/SHOPIFY_API_VERSION/);
    expect(() => parseServerEnv({ NEXT_PUBLIC_SITE_MODE: "beta" })).toThrow(EnvError);
  });
});
