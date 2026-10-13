import { describe, expect, it, vi } from "vitest";
import cartFixture from "../fixtures/shopify/cart.json";
import cartInvalid from "../fixtures/shopify/cart-invalid-id.json";
import cartSoldOut from "../fixtures/shopify/cart-sold-out.json";
import collectionFixture from "../fixtures/shopify/collection.json";
import menuFixture from "../fixtures/shopify/menu.json";
import productFixture from "../fixtures/shopify/product-yame.json";
import { CartUserError } from "@/lib/data/repository";
import { createShopifyClient, ShopifyError } from "@/lib/shopify/client";
import { filterFromShopifyInput, filterToShopify, mapCart, mapMenu, mapProduct, mapSiteSettings, sortToShopify, toStorefrontHref } from "@/lib/shopify/mappers";
import { ShopifyRepository } from "@/lib/shopify/repository";
import { sanitizeMerchantHtml } from "@/lib/shopify/sanitize";
import type { SfCart, SfProduct } from "@/lib/shopify/types";

const sfProduct = productFixture.data.product as unknown as SfProduct;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function repoWith(...bodies: unknown[]) {
  const fetchImpl = vi.fn<typeof fetch>();
  for (const b of bodies) fetchImpl.mockResolvedValueOnce(jsonResponse(b));
  const sf = createShopifyClient({ storeDomain: "witcha-matcha.myshopify.com", privateToken: "shpat_test", apiVersion: "2026-10", fetchImpl });
  return { repo: new ShopifyRepository({ fetch: sf, internalHosts: ["witcha-matcha.myshopify.com", "witchamatcha.com.au"] }), fetchImpl };
}

describe("mapProduct", () => {
  const p = mapProduct(sfProduct);

  it("maps core fields and metafields", () => {
    expect(p.handle).toBe("yame-no-mukashi");
    expect(p.kind).toBe("tea");
    expect(p.taste).toEqual({ position: 4, word: "Deep", tier: "Reserve" });
    expect(p.tastingNotes).toEqual(["Nutty", "Umami", "Mellow"]);
    expect(p.bestFor).toEqual(["Latte", "Straight"]);
    expect(p.facts.originRegion).toBe("Yame, Fukuoka");
    expect(p.facts.grade).toBeNull();
    expect(p.badges).toEqual(["sale", "new"]);
  });

  it("drops compare-at unless strictly higher", () => {
    expect(p.variants[0]!.compareAtPrice).toBeNull();
    expect(p.variants[1]!.compareAtPrice?.amount).toBe(16000);
  });

  it("uses variant servings, falling back to the product's", () => {
    expect(p.variants[0]!.servings).toBe(15);
    expect(p.variants[1]!.servings).toBe(50);
  });

  it("keeps stock data per variant", () => {
    expect(p.variants[0]).toMatchObject({ availableForSale: true, quantityAvailable: 4, size: "30 g" });
    expect(p.variants[1]).toMatchObject({ availableForSale: false, quantityAvailable: 0, size: "100 g" });
  });

  it("requires alt text, falling back to the title", () => {
    expect(p.media[0]).toMatchObject({ kind: "image", alt: "Yame no Mukashi tin on ivory" });
    expect(p.media[1]).toMatchObject({ kind: "image", alt: "Yame no Mukashi, image 2" });
  });

  it("maps character and prep metaobjects", () => {
    expect(p.character).toMatchObject({ name: "Pop", tasteRole: "Keeper of the deep tea", accessory: "A brass scoop" });
    expect(p.character?.art).toMatchObject({ kind: "image", alt: "Pop, Witcha Academy character art" });
    expect(p.prepMethods).toHaveLength(2);
    expect(p.prepMethods[0]).toMatchObject({ method: "Whisk", grams: "2 g", water: "70 ml · 80°C", milk: "—", steps: ["Sift 2 g into a warm bowl.", "Whisk for 15 seconds."] });
    expect(p.prepMethods[1]).toMatchObject({ method: "Shaker", icon: "shaker", water: "60 ml · cold", milk: "150 ml", videoUrl: "https://cdn.shopify.com/videos/shaker.mp4" });
    expect(p.prepMethods[1]!.steps).toHaveLength(2);
  });

  it("sanitises merchant HTML", () => {
    expect(p.descriptionHtml).not.toMatch(/script|onclick|javascript:/);
    expect(p.descriptionHtml).toContain("<h2>Yame</h2>");
    expect(p.descriptionHtml).toContain('rel="noopener noreferrer"');
  });

  it("renders a labelled placeholder when there are no images", () => {
    const bare = mapProduct({ ...sfProduct, images: { nodes: [] } });
    expect(bare.media).toEqual([{ kind: "placeholder", label: "PRODUCT IMAGE PENDING" }]);
  });
});

describe("mapCart", () => {
  const cart = mapCart(cartFixture.data.cartLinesAdd.cart as unknown as SfCart);

  it("maps lines, eyebrows and totals", () => {
    expect(cart.totalQuantity).toBe(3);
    expect(cart.cost.subtotal.amount).toBe(12800);
    expect(cart.lines[0]!.merchandise).toMatchObject({ eyebrow: "RESERVE · DEEP", size: "30 g", productKind: "tea", quantityAvailable: 4 });
    expect(cart.lines[0]!.merchandise.image).toMatchObject({ kind: "image", alt: "Yame tin" });
    expect(cart.lines[1]!.merchandise).toMatchObject({ eyebrow: "GIFT SET", size: "One size", quantityAvailable: null });
    expect(cart.lines[1]!.merchandise.compareAtPrice?.amount).toBe(4000);
  });

  it("reads gift attributes", () => {
    expect(cart.attributes).toEqual({ gift: true, giftNote: "Happy birthday, Mai." });
    expect(cart.note).toBe("");
  });
});

describe("menus", () => {
  it("rewrites store URLs to relative paths and keeps externals", () => {
    const menu = mapMenu("main-menu", menuFixture.data.menu.items, ["witcha-matcha.myshopify.com", "witchamatcha.com.au"]);
    expect(menu.items[0]!.href).toBe("/collections/matcha");
    expect(menu.items[0]!.items[0]!.href).toBe("/collections/matcha?sort=featured");
    expect(menu.items[0]!.items[1]!.href).toBe("https://www.instagram.com/example");
    expect(menu.items[1]!.href).toBe("/pages/our-story");
  });

  it("handles junk", () => {
    expect(toStorefrontHref(null, [])).toBe("/");
  });
});

describe("filters and sort", () => {
  it("round-trips filter inputs", () => {
    for (const f of [{ kind: "available" }, { kind: "size", value: "30 g" }, { kind: "note", value: "Nutty" }, { kind: "price", min: 10, max: 50 }] as const) {
      expect(filterFromShopifyInput(JSON.stringify(filterToShopify(f)))).toEqual(f);
    }
    expect(filterFromShopifyInput("not json")).toBeNull();
    expect(filterFromShopifyInput('{"tag":"x"}')).toBeNull();
  });

  it("maps sort options", () => {
    expect(sortToShopify("price-desc")).toEqual({ sortKey: "PRICE", reverse: true });
    expect(sortToShopify("newest")).toEqual({ sortKey: "CREATED", reverse: true });
    expect(sortToShopify("featured")).toEqual({ sortKey: "COLLECTION_DEFAULT", reverse: false });
  });
});

describe("site settings", () => {
  it("prefers env threshold, then CMS, then fallback", () => {
    const fields = [
      { key: "free_shipping_threshold", value: "$90" },
      { key: "dispatch_city", value: "Sydney" },
      { key: "low_stock_threshold", value: "3" },
    ];
    expect(mapSiteSettings(fields, 75).freeShippingThreshold).toEqual({ amount: 7500, currencyCode: "AUD" });
    const s = mapSiteSettings(fields, undefined);
    expect(s.freeShippingThreshold).toEqual({ amount: 9000, currencyCode: "AUD" });
    expect(s.dispatchCity).toBe("Sydney");
    expect(s.lowStockThreshold).toBe(3);
    expect(mapSiteSettings(null, undefined).freeShippingThreshold.placeholder).toBe(true);
  });
});

describe("ShopifyRepository", () => {
  it("sends the private token server-side to the pinned API version", async () => {
    const { repo, fetchImpl } = repoWith(productFixture);
    const p = await repo.getProduct("yame-no-mukashi");
    expect(p?.title).toBe("Yame no Mukashi");
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://witcha-matcha.myshopify.com/api/2026-10/graphql.json");
    expect((init?.headers as Record<string, string>)["Shopify-Storefront-Private-Token"]).toBe("shpat_test");
    expect(JSON.parse(String(init?.body)).variables).toEqual({ handle: "yame-no-mukashi" });
  });

  it("returns null for unknown products", async () => {
    const { repo } = repoWith({ data: { product: null } });
    expect(await repo.getProduct("nope")).toBeNull();
  });

  it("passes sort, cursor and filters to the collection query", async () => {
    const { repo, fetchImpl } = repoWith(collectionFixture);
    const page = await repo.getCollection("matcha", { sort: "price-asc", after: "abc", filters: [{ kind: "available" }] });
    const vars = JSON.parse(String(fetchImpl.mock.calls[0]![1]?.body)).variables;
    expect(vars).toMatchObject({ handle: "matcha", sortKey: "PRICE", reverse: false, after: "abc", filters: [{ available: true }] });
    expect(page?.products.pageInfo).toEqual({ hasNextPage: true, endCursor: "eyJsYXN0X2lkIjo4ODF9" });
    expect(page?.filters.map((f) => f.label)).toEqual(["Availability", "Size", "Tasting note", "Price"]);
    expect(page?.filters[0]!.values).toHaveLength(1);
  });

  it("maps cart mutations", async () => {
    const { repo } = repoWith(cartFixture);
    const cart = await repo.addCartLines("gid://shopify/Cart/c1-abc123?key=k1", [{ variantId: "gid://shopify/ProductVariant/4400001", quantity: 1 }]);
    expect(cart?.checkoutUrl).toBe("https://witcha-matcha.myshopify.com/cart/c/c1-abc123?key=k1");
  });

  it("treats an expired cart id as no cart", async () => {
    const { repo } = repoWith(cartInvalid);
    expect(await repo.addCartLines("gid://shopify/Cart/gone", [{ variantId: "x", quantity: 1 }])).toBeNull();
  });

  it("surfaces other cart errors as CartUserError", async () => {
    const { repo } = repoWith(cartSoldOut);
    await expect(repo.addCartLines("gid://shopify/Cart/c1", [{ variantId: "x", quantity: 1 }])).rejects.toBeInstanceOf(CartUserError);
  });

  it("retries transient failures, then throws ShopifyError", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ errors: [{ message: "Throttled" }] }, 503));
    const sf = createShopifyClient({ storeDomain: "s.myshopify.com", privateToken: "t", apiVersion: "2026-10", fetchImpl });
    const pending = sf({ query: "{ shop { name } }" }).catch((e: unknown) => e);
    await vi.runAllTimersAsync();
    const err = await pending;
    vi.useRealTimers();
    expect(err).toBeInstanceOf(ShopifyError);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("throws on GraphQL errors", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ errors: [{ message: "Field 'x' doesn't exist" }] }));
    const sf = createShopifyClient({ storeDomain: "s.myshopify.com", privateToken: "t", apiVersion: "2026-10", fetchImpl });
    await expect(sf({ query: "{ x }" })).rejects.toThrow("Field 'x' doesn't exist");
  });
});

describe("sanitizeMerchantHtml", () => {
  it("strips dangerous markup", () => {
    const out = sanitizeMerchantHtml('<img src="http://x/a.png" onerror="x()"><iframe src="https://x"></iframe><p style="color:red">ok</p>');
    expect(out).toBe("<p>ok</p>");
  });
});
