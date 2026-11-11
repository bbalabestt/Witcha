import { describe, expect, it } from "vitest";
import recordedProduct from "./recorded/product.json";
import { toCardData } from "@/components/commerce/card-data";
import { parseEnv } from "@/lib/config/env";
import { RECIPES, recipesFor } from "@/lib/content/recipes";
import { brandTitle, SEO } from "@/lib/content/seo";
import { capQuantity, freeShippingMeter } from "@/lib/data/cart-math";
import { FixtureRepository } from "@/lib/data/fixture-repository";
import { FAQ, PRODUCTS } from "@/lib/data/fixtures/catalog";
import { money, priceLabel } from "@/lib/data/money";
import { maxQuantity, normaliseCompareAt, stockState, teaTypeFrom } from "@/lib/data/product";
import { parseSort, sortProducts } from "@/lib/data/sort";
import type { Product, Variant } from "@/lib/data/types";
import { list, mapCart, mapProduct, mapSiteSettings } from "@/lib/shopify/mappers";
import { defaultSiteSettings } from "@/lib/config/site";
import type { SCart, SProduct } from "@/lib/shopify/types";

function v(partial: Partial<Variant> = {}): Variant {
  return {
    id: "v1",
    sku: "WM-TEST-30",
    title: "30 g",
    price: money(48),
    compareAtPrice: null,
    availableForSale: true,
    quantityAvailable: 10,
    ...partial,
  };
}

const TEA = (handle: string) => PRODUCTS.find((p) => p.handle === handle)!;

describe("money", () => {
  it("formats real prices, including thousands", () => {
    expect(priceLabel(money(48))).toBe("$48.00");
    expect(priceLabel(money(1280))).toBe("$1,280.00");
  });

  it("never renders a placeholder or missing price", () => {
    expect(priceLabel(money(48, true))).toBeNull();
    expect(priceLabel(null)).toBeNull();
  });
});

describe("price rules", () => {
  it("drops a compare-at price that is not strictly higher", () => {
    expect(normaliseCompareAt(money(48), money(48))).toBeNull();
    expect(normaliseCompareAt(money(48), money(40))).toBeNull();
    expect(normaliseCompareAt(money(48), money(56))?.amount).toBe(56);
  });
});

describe("stock rules", () => {
  it("has one rule for notice and button", () => {
    expect(stockState(v({ availableForSale: false, quantityAvailable: 0 }))).toEqual({ kind: "sold-out" });
    expect(stockState(v({ quantityAvailable: 3 }))).toEqual({ kind: "in-stock" });
    expect(stockState(v({ quantityAvailable: null }))).toEqual({ kind: "in-stock" });
  });

  it("caps steppers at known stock", () => {
    expect(maxQuantity(v({ quantityAvailable: 3 }))).toBe(3);
    expect(maxQuantity(v({ quantityAvailable: null }))).toBeNull();
    expect(maxQuantity(v({ availableForSale: false }))).toBe(0);
  });
});

describe("tea type", () => {
  it("reads hojicha first, so it never falls into a matcha grouping", () => {
    expect(teaTypeFrom("Hojicha (roasted Japanese green tea) Tea The Librarian — Uji Hojicha")).toBe("hojicha");
    expect(teaTypeFrom("The Professor — Yame Matcha")).toBe("matcha");
    expect(teaTypeFrom("Bamboo whisk")).toBeNull();
  });
});

describe("launch catalogue", () => {
  const repo = new FixtureRepository();

  it("has four teas in the fixed order with full names", async () => {
    const c = await repo.getCollection("teas");
    expect(c?.title).toBe("Japanese matcha and hojicha");
    expect(c?.products.map((p) => p.title)).toEqual([
      "The Professor — Yame Matcha",
      "The Scholar — Japanese Matcha Blend",
      "The Rebel — Kagoshima Matcha",
      "The Librarian — Uji Hojicha",
    ]);
  });

  it("sells 30 g only", () => {
    for (const p of PRODUCTS.filter((x) => x.kind === "tea")) expect(p.variants.map((x) => x.title)).toEqual(["30 g"]);
  });

  it("uses the client's handles and SKUs", () => {
    const teas = PRODUCTS.filter((p) => p.kind === "tea");
    expect(teas.map((p) => p.variants[0]?.sku)).toEqual(["WM-PRO-30", "WM-SCH-30", "WM-REB-30", "WM-LIB-30"]);
    expect(teas.map((p) => p.handle)).toEqual([
      "the-professor-yame-matcha",
      "the-scholar-japanese-matcha-blend",
      "the-rebel-kagoshima-matcha",
      "the-librarian-uji-hojicha",
    ]);
  });

  it("holds every [confirm] block until the founders confirm it", () => {
    const rebel = TEA("the-rebel-kagoshima-matcha");
    expect(rebel.tastingNotes).toEqual([]);
    expect(rebel.detailLine).toBeNull();
    expect(rebel.facts?.cultivar).toBeNull();
    expect(rebel.facts?.harvest).toBeNull();
    const librarian = TEA("the-librarian-uji-hojicha");
    expect(librarian.facts?.ingredients).toBeNull();
    for (const p of PRODUCTS) {
      expect(p.storageNote).toBeNull();
      expect(p.servingsNote).toBeNull();
    }
    expect(FAQ.map((f) => f.id)).not.toContain("storage");
    expect(FAQ.map((f) => f.id)).not.toContain("cups");
  });

  it("never calls hojicha matcha, and gives it no matcha recipe", () => {
    const librarian = TEA("the-librarian-uji-hojicha");
    expect(librarian.teaType).toBe("hojicha");
    expect(librarian.facts?.type).toBe("Hojicha (roasted Japanese green tea)");
    expect(recipesFor(librarian)).toEqual([]);
  });

  it("puts the best-for recipe first", () => {
    expect(recipesFor(TEA("the-professor-yame-matcha"))[0]?.id).toBe("usucha");
    expect(recipesFor(TEA("the-scholar-japanese-matcha-blend"))[0]?.id).toBe("iced-matcha-latte");
  });

  it("holds the hojicha latte until its milk quantity is confirmed", () => {
    expect(RECIPES.map((r) => r.id)).toEqual(["usucha", "iced-matcha-latte", "iced-matcha-americano"]);
  });

  it("builds cards in the client's order with no price while it is a placeholder", () => {
    const card = toCardData(TEA("the-professor-yame-matcha"));
    expect(card).toMatchObject({
      title: "The Professor — Yame Matcha",
      notes: ["Creamy", "Umami", "Macadamia"],
      bestForShort: "Drinking straight (usucha)",
      price: null,
      size: "30 g",
      href: "/products/the-professor-yame-matcha",
    });
  });
});

describe("SEO limits", () => {
  const pages: Array<[string, string, string]> = [
    ...Object.entries(SEO).map(([k, x]): [string, string, string] => [k, x.title, "description" in x ? x.description : "inherits the home description"]),
    ...PRODUCTS.filter((p) => p.kind === "tea").map((p): [string, string, string] => [p.handle, brandTitle(p.title), p.seoDescription ?? ""]),
  ];
  for (const [page, title, description] of pages) {
    it(`${page} fits`, () => {
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeGreaterThan(0);
      expect(description.length).toBeLessThanOrEqual(155);
    });
  }
});

describe("cart math", () => {
  it("drives the free-shipping meter states", () => {
    const threshold = money(80);
    expect(freeShippingMeter(money(0), threshold).kind).toBe("empty");
    const mid = freeShippingMeter(money(48), threshold);
    expect(mid).toMatchObject({ kind: "progress", percent: 60 });
    expect(mid.remaining.amount).toBe(32);
    expect(freeShippingMeter(money(96), threshold)).toMatchObject({ kind: "reached", percent: 100 });
  });

  it("caps quantity by stock", () => {
    expect(capQuantity(5, 3)).toBe(3);
    expect(capQuantity(5, null)).toBe(5);
    expect(capQuantity(-1, 3)).toBe(0);
  });
});

describe("sorting", () => {
  it("parses unknown sort values to featured", () => {
    expect(parseSort("nonsense")).toBe("featured");
    expect(parseSort(["low"])).toBe("low");
  });

  it("sorts by price both ways", () => {
    const a = { variants: [v({ price: money(30) })] } as Product;
    const b = { variants: [v({ price: money(50) })] } as Product;
    expect(sortProducts([b, a], "low")[0]).toBe(a);
    expect(sortProducts([a, b], "high")[0]).toBe(b);
  });
});

describe("env", () => {
  it("defaults to fixtures with placeholder prices", () => {
    const e = parseEnv({});
    expect(e.commerceSource).toBe("fixtures");
    expect(e.pricesArePlaceholders).toBe(true);
  });

  it("names the missing variable for Shopify", () => {
    expect(() => parseEnv({ COMMERCE_SOURCE: "shopify" })).toThrow(/SHOPIFY_STORE_DOMAIN/);
  });

  it("has no way to switch on sample reviews", () => {
    expect(parseEnv({ REVIEWS_SOURCE: "sample" })).not.toHaveProperty("reviewsSource");
  });

  it("falls back to the Vercel production URL, never localhost, in a deployment", () => {
    expect(parseEnv({ VERCEL_PROJECT_PRODUCTION_URL: "witcha.vercel.app" }).siteUrl).toBe("https://witcha.vercel.app");
    expect(parseEnv({ VERCEL_PROJECT_PRODUCTION_URL: "witcha.vercel.app", NEXT_PUBLIC_SITE_URL: "https://shop.example" }).siteUrl).toBe("https://shop.example");
  });

  it("rejects bad values", () => {
    expect(() => parseEnv({ SHOP_PAY: "yes" })).toThrow(/SHOP_PAY/);
  });
});

describe("Shopify mappers (recorded response)", () => {
  const product = mapProduct(recordedProduct as unknown as SProduct, { placeholderPrices: false });

  it("maps the client's product fields", () => {
    expect(product).toMatchObject({
      title: "The Professor — Yame Matcha",
      academyTitle: "The Professor",
      descriptor: "Yame Matcha",
      teaType: "matcha",
      detailLine: "Okumidori · First harvest · 30 g",
      bestForShort: "Drinking straight (usucha)",
      bestFor: "Straight (usucha). Also makes a smooth latte.",
      chooseItIf: "you want the richest umami and creamiest texture in the range.",
      compare: { handle: "the-scholar-japanese-matcha-blend", line: "Mostly drink lattes? The Scholar — Japanese Matcha Blend suits them best." },
      seoDescription: "Creamy, umami-rich Yame matcha from Fukuoka.",
    });
    expect(product.tastingNotes).toEqual(["Creamy", "Umami", "Macadamia"]);
    expect(product.facts).toEqual({
      type: "Matcha",
      origin: "Yame, Fukuoka, Japan",
      cultivar: "Okumidori",
      harvest: "First harvest",
      ingredients: "100% Japanese matcha",
      netWeight: "30 g",
      packedIn: "Japan",
      caffeine: "Contains caffeine",
    });
  });

  it("keeps compare-at only when higher and carries the SKU", () => {
    expect(product.variants[0]?.compareAtPrice).toBeNull();
    expect(product.variants[0]?.sku).toBe("WM-PRO-30");
  });

  it("fills alt text with the full name", () => {
    expect(product.tin?.alt).toBe("The Professor — Yame Matcha, 30 g white tin");
    expect(product.gallery[1]).toMatchObject({ fit: "cover" });
  });

  it("hides a block when its metafield is empty", () => {
    const empty = mapProduct({ ...(recordedProduct as unknown as SProduct), detailLine: null, compareLine: null, teaType: null }, { placeholderPrices: false });
    expect(empty.detailLine).toBeNull();
    expect(empty.compare).toBeNull();
    expect(empty.facts).toBeNull();
  });

  it("returns null shipping settings instead of placeholders", () => {
    const s = mapSiteSettings({ handle: "default", fields: [{ key: "abn", value: "41 702 554 265", reference: null }] }, defaultSiteSettings(), { placeholderPrices: false });
    expect(s.dispatchCity).toBeNull();
    expect(s.freeShippingThreshold).toBeNull();
    expect(s.abn).toBe("41 702 554 265");
    expect(s.legalEntity).toBe("MINIWITCH PTY LTD");
  });

  it("parses list metafields in either format", () => {
    expect(list({ value: '["a","b"]' })).toEqual(["a", "b"]);
    expect(list({ value: "a, b" })).toEqual(["a", "b"]);
    expect(list(null)).toEqual([]);
  });

  it("maps a cart with gift attributes and the full name", () => {
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
              product: { handle: "the-librarian-uji-hojicha", title: "The Librarian — Uji Hojicha", productType: "Hojicha", featuredImage: null },
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
    expect(mapped.lines[0]?.product).toMatchObject({ title: "The Librarian — Uji Hojicha", teaType: "hojicha" });
  });
});

describe("FixtureRepository cart", () => {
  const repo = new FixtureRepository();

  it("adds, caps by stock, updates and removes lines", async () => {
    let cart = await repo.createCart([{ merchandiseId: "wm-sch-30", quantity: 2 }]);
    expect(cart.totalQuantity).toBe(2);
    expect(cart.subtotal).toMatchObject({ amount: 64, placeholder: true });
    expect(cart.lines[0]?.product.title).toBe("The Scholar — Japanese Matcha Blend");

    cart = await repo.addLines(cart.id, [{ merchandiseId: "wm-sch-30", quantity: 5 }]);
    expect(cart.lines[0]?.quantity).toBe(3); // only 3 in stock

    const lineId = cart.lines[0]!.id;
    cart = await repo.updateLines(cart.id, [{ id: lineId, quantity: 1 }]);
    expect(cart.totalQuantity).toBe(1);

    cart = await repo.updateGift(cart.id, true, "x".repeat(200));
    expect(cart.giftNote).toHaveLength(150);

    cart = await repo.removeLines(cart.id, [lineId]);
    expect(cart.lines).toHaveLength(0);
  });

  it("pages collections", async () => {
    const page = await repo.getCollection("teas", { first: 2 });
    expect(page?.products).toHaveLength(2);
    expect(page?.hasNextPage).toBe(true);
    expect(page?.total).toBe(4);
    const next = await repo.getCollection("teas", { first: 2, after: page?.endCursor });
    expect(next?.hasNextPage).toBe(false);
  });

  it("searches teas by name, tasting word and use", async () => {
    expect((await repo.search("yame")).products.map((p) => p.academyTitle)).toEqual(["The Professor"]);
    expect((await repo.search("hojicha")).products.map((p) => p.academyTitle)).toContain("The Librarian");
    expect((await repo.search("usucha")).products.map((p) => p.academyTitle)).toContain("The Professor");
    expect((await repo.search("y")).products).toHaveLength(0);
  });
});
