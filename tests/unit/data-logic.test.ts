import { describe, expect, it } from "vitest";
import { addMoney, effectiveCompareAt, formatMoney, money, multiplyMoney, perCup, sumMoney, toMinorUnits } from "@/lib/data/money";
import { badgesFromTags, defaultVariant, productEyebrow, selectVariant, stockState, tasteProfile, tasteText, variantParam } from "@/lib/data/product";
import { PRODUCTS } from "@/lib/data/fixtures/data";

describe("money", () => {
  it("parses Shopify decimals without float drift", () => {
    expect(toMinorUnits("48.0")).toBe(4800);
    expect(toMinorUnits("0.1")).toBe(10);
    expect(toMinorUnits("19.99")).toBe(1999);
    expect(toMinorUnits("140")).toBe(14000);
    expect(toMinorUnits("-5.5")).toBe(-550);
  });

  it("formats AUD and brackets placeholders", () => {
    expect(formatMoney(money(4800))).toBe("$48.00");
    expect(formatMoney(money(4800, "AUD", true))).toBe("$[48.00]");
    expect(formatMoney(money(123456))).toBe("$1,234.56");
    expect(formatMoney(money(500, "USD"))).toBe("USD 5.00");
  });

  it("keeps placeholder-ness through arithmetic", () => {
    expect(addMoney(money(100), money(200, "AUD", true)).placeholder).toBe(true);
    expect(multiplyMoney(money(4800, "AUD", true), 3)).toEqual(money(14400, "AUD", true));
    expect(sumMoney([money(100), money(250)])).toEqual(money(350));
  });

  it("shows compare-at only when strictly higher", () => {
    expect(effectiveCompareAt(money(4800), money(4800))).toBeNull();
    expect(effectiveCompareAt(money(4800), money(4000))).toBeNull();
    expect(effectiveCompareAt(money(4800), null)).toBeNull();
    expect(effectiveCompareAt(money(4800), money(5600))).toEqual(money(5600));
    expect(effectiveCompareAt(money(4800), money(5600, "USD"))).toBeNull();
  });

  it("computes per-cup only with both inputs", () => {
    expect(perCup(money(4800), 15)).toEqual(money(320));
    expect(perCup(money(4800), null)).toBeNull();
    expect(perCup(money(4800), 0)).toBeNull();
    expect(perCup(money(0), 15)).toBeNull();
  });
});

describe("product rules", () => {
  it("maps tags to badges in priority order, sale from compare-at", () => {
    expect(badgesFromTags(["Best-Seller", "NEW", "other"], false)).toEqual(["new", "best-seller"]);
    expect(badgesFromTags([], true)).toEqual(["sale"]);
    expect(badgesFromTags(["sale", "limited"], false)).toEqual(["sale", "limited"]);
  });

  it("builds taste from position 1–5 only", () => {
    expect(tasteProfile(4, "Reserve")).toEqual({ position: 4, word: "Deep", tier: "Reserve" });
    expect(tasteProfile("2", null)?.word).toBe("Bright");
    expect(tasteProfile(0, null)).toBeNull();
    expect(tasteProfile(6, null)).toBeNull();
    expect(tasteProfile("deep", null)).toBeNull();
  });

  it("reads the scale without colour", () => {
    expect(tasteText({ position: 4, word: "Deep", tier: null })).toBe("Deep, 4 of 5");
  });

  it("builds eyebrows", () => {
    expect(productEyebrow({ kind: "tea", taste: tasteProfile(4, "Reserve") })).toBe("RESERVE · DEEP");
    expect(productEyebrow({ kind: "tea", taste: tasteProfile(2, null) })).toBe("BRIGHT");
    expect(productEyebrow({ kind: "gift", taste: null })).toBe("GIFT SET");
  });

  it("selects variants from ?variant= with fallback to first available", () => {
    const yame = PRODUCTS.find((p) => p.handle === "yame")!;
    expect(defaultVariant(yame)?.size).toBe("30 g");
    expect(selectVariant(yame, "1001100")?.size).toBe("100 g");
    expect(selectVariant(yame, yame.variants[1]!.id)?.size).toBe("100 g");
    expect(selectVariant(yame, "nope")?.size).toBe("30 g");
    expect(variantParam("gid://shopify/ProductVariant/4400001")).toBe("4400001");
  });

  it("falls back to the first variant when everything is sold out", () => {
    const soldOut = { variants: PRODUCTS[0]!.variants.map((v) => ({ ...v, availableForSale: false })) };
    expect(defaultVariant(soldOut)?.size).toBe("30 g");
  });

  it("derives stock state from one rule", () => {
    expect(stockState({ availableForSale: false, quantityAvailable: 10 }, 5)).toEqual({ kind: "sold-out" });
    expect(stockState({ availableForSale: true, quantityAvailable: 3 }, 5)).toEqual({ kind: "low", remaining: 3 });
    expect(stockState({ availableForSale: true, quantityAvailable: 5 }, 5)).toEqual({ kind: "low", remaining: 5 });
    expect(stockState({ availableForSale: true, quantityAvailable: 6 }, 5)).toEqual({ kind: "in-stock" });
    expect(stockState({ availableForSale: true, quantityAvailable: null }, 5)).toEqual({ kind: "in-stock" });
    // Continue-selling-when-out-of-stock items report 0 but are available.
    expect(stockState({ availableForSale: true, quantityAvailable: 0 }, 5)).toEqual({ kind: "in-stock" });
  });
});
