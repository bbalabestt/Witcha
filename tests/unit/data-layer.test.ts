import { describe, expect, it } from "vitest";
import recordedProduct from "./recorded/product.json";
import { parseEnv } from "@/lib/config/env";
import { capQuantity, freeShippingMeter } from "@/lib/data/cart-math";
import { FixtureRepository } from "@/lib/data/fixture-repository";
import { formatMoney, money } from "@/lib/data/money";
import {
  badgeFor,
  cardAction,
  eyebrow,
  markerLeft,
  normaliseCompareAt,
  perCup,
  stockState,
  tasteLabel,
  variantDelta,
} from "@/lib/data/product";
import { parseSort, sortProducts } from "@/lib/data/sort";
import type { Product, Variant } from "@/lib/data/types";
import { list, mapCart, mapProduct, tasteWordFor } from "@/lib/shopify/mappers";
import type { SCart, SProduct } from "@/lib/shopify/types";

function v(partial: Partial<Variant> = {}): Variant {
  return {
    id: "v1",
    title: "30 g",
    price: money(48),
    compareAtPrice: null,
    availableForSale: true,
    quantityAvailable: 10,
    servings: 15,
    ...partial,
  };
}

describe("money", () => {
  it("formats real and placeholder prices, including thousands", () => {
    expect(formatMoney(money(48))).toBe("$48.00");
    expect(formatMoney(money(48, true))).toBe("$[48.00]");
    expect(formatMoney(money(1280, true))).toBe("$[1,280.00]");
  });
});

describe("price rules", () => {
  it("drops a compare-at price that is not strictly higher", () => {
    expect(normaliseCompareAt(money(48), money(48))).toBeNull();
    expect(normaliseCompareAt(money(48), money(40))).toBeNull();
    expect(normaliseCompareAt(money(48), money(56))?.amount).toBe(56);
  });

  it("shows per-cup cost only when servings exist", () => {
    expect(perCup(v())?.amount).toBe(3.2);
    expect(perCup(v({ servings: null }))).toBeNull();
    expect(perCup(v({ servings: 0 }))).toBeNull();
  });

  it("prints option deltas against the first variant", () => {
    const base = v();
    expect(variantDelta(base, base)).toBe("$48.00");
    expect(variantDelta(base, v({ id: "v2", price: money(140) }))).toBe("+$92.00");
  });
});

describe("stock rules", () => {
  it("never says 'Only 0 left'", () => {
    expect(stockState(v({ quantityAvailable: 0 }), 5)).toEqual({ kind: "in-stock" });
    expect(stockState(v({ quantityAvailable: 3 }), 5)).toEqual({ kind: "low", quantity: 3 });
    expect(stockState(v({ quantityAvailable: 6 }), 5)).toEqual({ kind: "in-stock" });
    expect(stockState(v({ availableForSale: false, quantityAvailable: 0 }), 5)).toEqual({ kind: "sold-out" });
    expect(stockState(v({ quantityAvailable: null }), 5)).toEqual({ kind: "in-stock" });
  });

  it("chooses the card action from availability and variants", () => {
    const base = { variants: [v()] } as Product;
    expect(cardAction(base)).toBe("add");
    expect(cardAction({ ...base, variants: [v(), v({ id: "v2" })] })).toBe("choose");
    expect(cardAction({ ...base, variants: [v({ availableForSale: false })] })).toBe("notify");
  });
});

describe("taste and badges", () => {
  it("reads without colour", () => {
    expect(tasteLabel({ position: 4, word: "Deep", tier: "Reserve" })).toBe("Deep, 4 of 5");
    expect(eyebrow({ kind: "tea", taste: { position: 2, word: "Bright", tier: "Daily" } })).toBe("DAILY · BRIGHT");
    expect(markerLeft(4, 8)).toBe("calc(75% - 4px)");
    expect(tasteWordFor(1)).toBe("Bright");
    expect(tasteWordFor(3)).toBe("Balanced");
  });

  it("maps tags to badges with sold out and real sales first", () => {
    expect(badgeFor(["new"], [v()])).toBe("NEW");
    expect(badgeFor(["sale"], [v()])).toBeNull();
    expect(badgeFor([], [v({ compareAtPrice: money(56) })])).toBe("SALE");
    expect(badgeFor(["new"], [v({ availableForSale: false })])).toBe("SOLD OUT");
  });
});

describe("cart math", () => {
  it("drives the free-shipping meter states", () => {
    expect(freeShippingMeter(money(0), money(80)).kind).toBe("empty");
    const mid = freeShippingMeter(money(48), money(80));
    expect(mid.kind).toBe("progress");
    expect(mid.remaining.amount).toBe(32);
    expect(mid.percent).toBe(60);
    expect(freeShippingMeter(money(96), money(80)).kind).toBe("reached");
  });

  it("caps quantity by stock", () => {
    expect(capQuantity(5, 3)).toBe(3);
    expect(capQuantity(5, null)).toBe(5);
    expect(capQuantity(-1, 3)).toBe(0);
  });
});

describe("sorting", () => {
  it("parses unknown sort values to featured", () => {
    expect(parseSort("high")).toBe("high");
    expect(parseSort("bogus")).toBe("featured");
    expect(parseSort(undefined)).toBe("featured");
  });

  it("sorts by price both ways", () => {
    const a = { variants: [v({ price: money(10) })] } as Product;
    const b = { variants: [v({ price: money(30) })] } as Product;
    expect(sortProducts([b, a], "low")).toEqual([a, b]);
    expect(sortProducts([a, b], "high")).toEqual([b, a]);
  });
});

describe("env", () => {
  it("defaults to fixtures with placeholder prices", () => {
    const e = parseEnv({});
    expect(e.commerceSource).toBe("fixtures");
    expect(e.pricesArePlaceholders).toBe(true);
    expect(e.freeShippingThreshold).toBe(80);
    expect(e.promoPopup).toBe(false);
  });

  it("names the missing variable for Shopify", () => {
    expect(() => parseEnv({ COMMERCE_SOURCE: "shopify" })).toThrow(/SHOPIFY_STORE_DOMAIN/);
  });

  it("refuses sample reviews with live data in production", () => {
    expect(() =>
      parseEnv({ NODE_ENV: "production", COMMERCE_SOURCE: "shopify", SHOPIFY_STORE_DOMAIN: "x", SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "y", REVIEWS_SOURCE: "sample" }),
    ).toThrow(/sample/);
  });

  it("rejects bad values", () => {
    expect(() => parseEnv({ FREE_SHIPPING_THRESHOLD_AUD: "lots" })).toThrow(/FREE_SHIPPING/);
    expect(() => parseEnv({ PROMO_POPUP: "yes" })).toThrow(/PROMO_POPUP/);
  });
});

describe("Shopify mappers (recorded response)", () => {
  const product = mapProduct(recordedProduct as unknown as SProduct, { placeholderPrices: false });

  it("maps taste, notes and best-for with the brief's limits", () => {
    expect(product.taste).toEqual({ position: 4, tier: "Reserve", word: "Deep" });
    expect(product.tastingNotes).toEqual(["Nutty", "Umami", "Mellow"]);
    expect(product.bestFor).toEqual(["Latte", "Straight"]);
  });

  it("keeps compare-at only when higher and falls back to product servings", () => {
    const [small, large] = product.variants;
    expect(small?.compareAtPrice).toBeNull();
    expect(small?.servings).toBe(15);
    expect(large?.compareAtPrice?.amount).toBe(165);
    expect(large?.servings).toBe(50);
  });

  it("fills alt text from the title and resolves the character", () => {
    expect(product.tin?.alt).toBe("Yame no Mukashi");
    expect(product.gallery[1]).toMatchObject({ kind: "image", fit: "cover" });
    expect(product.character?.name).toBe("The Professor");
    expect(product.badge).toBe("SALE"); // tagged sale and the 100 g size really is reduced
  });

  it("parses list metafields in either format", () => {
    expect(list({ value: '["a","b"]' })).toEqual(["a", "b"]);
    expect(list({ value: "a, b" })).toEqual(["a", "b"]);
    expect(list(null)).toEqual([]);
  });

  it("maps a cart with gift attributes", () => {
    const cart: SCart = {
      id: "gid://shopify/Cart/1",
      checkoutUrl: "https://shop.example/checkouts/1",
      totalQuantity: 2,
      cost: { subtotalAmount: { amount: "96.0", currencyCode: "AUD" } },
      attributes: [
        { key: "gift", value: "yes" },
        { key: "gift_note", value: "Happy birthday" },
      ],
      lines: {
        nodes: [
          {
            id: "line-1",
            quantity: 2,
            cost: { totalAmount: { amount: "96.0", currencyCode: "AUD" } },
            merchandise: {
              id: "gid://shopify/ProductVariant/1",
              title: "30 g",
              availableForSale: true,
              quantityAvailable: 3,
              price: { amount: "48.0", currencyCode: "AUD" },
              product: {
                handle: "yame-no-mukashi",
                title: "Yame no Mukashi",
                productType: "Matcha",
                featuredImage: null,
                tier: { value: "Reserve" },
                tasteWord: null,
                tastePosition: { value: "4" },
              },
            },
          },
        ],
      },
    };
    const mapped = mapCart(cart, { placeholderPrices: false });
    expect(mapped.totalQuantity).toBe(2);
    expect(mapped.subtotal.amount).toBe(96);
    expect(mapped.gift).toBe(true);
    expect(mapped.giftNote).toBe("Happy birthday");
    expect(mapped.lines[0]?.product.eyebrow).toBe("RESERVE · DEEP");
  });
});

describe("FixtureRepository cart", () => {
  const repo = new FixtureRepository({ freeShippingThreshold: 80 });

  it("adds, caps by stock, updates and removes lines", async () => {
    let cart = await repo.createCart([{ merchandiseId: "d30", quantity: 2 }]);
    expect(cart.totalQuantity).toBe(2);
    expect(cart.subtotal).toMatchObject({ amount: 64, placeholder: true });

    cart = await repo.addLines(cart.id, [{ merchandiseId: "d30", quantity: 5 }]);
    expect(cart.lines[0]?.quantity).toBe(3); // only 3 in stock

    const lineId = cart.lines[0]!.id;
    cart = await repo.updateLines(cart.id, [{ id: lineId, quantity: 1 }]);
    expect(cart.totalQuantity).toBe(1);

    cart = await repo.updateGift(cart.id, true, "x".repeat(200));
    expect(cart.giftNote).toHaveLength(150);

    cart = await repo.removeLines(cart.id, [lineId]);
    expect(cart.lines).toHaveLength(0);
  });

  it("refuses sold-out sizes", async () => {
    const cart = await repo.createCart();
    await expect(repo.addLines(cart.id, [{ merchandiseId: "y100", quantity: 1 }])).rejects.toThrow(/sold out/);
  });

  it("pages collections and hides filters below six products", async () => {
    const page = await repo.getCollection("matcha", { first: 2 });
    expect(page?.products).toHaveLength(2);
    expect(page?.hasNextPage).toBe(true);
    expect(page?.total).toBe(4);
    const next = await repo.getCollection("matcha", { first: 2, after: page?.endCursor });
    expect(next?.hasNextPage).toBe(false);
  });

  it("searches teas and guides", async () => {
    const res = await repo.search("iced");
    expect(res.guides.map((g) => g.handle)).toContain("iced-latte-poured-over");
    expect((await repo.search("y")).products).toHaveLength(0);
  });
});
