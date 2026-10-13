import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { collectionHref, filterLabel, parseFilter, parseFilters, parseSort, serializeFilter, showFilters } from "@/lib/data/collection-params";
import { PRODUCTS } from "@/lib/data/fixtures/data";
import { money } from "@/lib/data/money";
import { cardPriceLabel } from "@/lib/data/product";
import type { Product } from "@/lib/data/types";

vi.mock("@/lib/cart/actions", () => ({ addToCartForm: vi.fn(async () => null) }));

const { ProductCard } = await import("@/components/commerce/ProductCard");
const { PriceBlock } = await import("@/components/commerce/PriceBlock");
const { shortName, collectionVariant } = await import("@/components/commerce/CollectionHeader");

afterEach(cleanup);

const byHandle = (h: string) => PRODUCTS.find((p) => p.handle === h)!;

describe("collection URL state", () => {
  it("parses sort with a safe default", () => {
    expect(parseSort("price-desc")).toBe("price-desc");
    expect(parseSort(["newest", "price-asc"])).toBe("newest");
    expect(parseSort("low")).toBe("featured");
    expect(parseSort(undefined)).toBe("featured");
  });

  it("parses and de-duplicates filters, ignoring junk", () => {
    expect(parseFilters(["available", "size:30 g", "size:30 g", "note:Nutty", "price:10-50", "colour:red", "price:-", "size:"])).toEqual([
      { kind: "available" },
      { kind: "size", value: "30 g" },
      { kind: "note", value: "Nutty" },
      { kind: "price", min: 10, max: 50 },
    ]);
    expect(parseFilter("price:-40")).toEqual({ kind: "price", min: undefined, max: 40 });
  });

  it("round-trips through the URL", () => {
    const filters = parseFilters(["size:100 g", "available"]);
    const href = collectionHref("matcha", { sort: "price-asc", filters });
    expect(href).toBe("/collections/matcha?sort=price-asc&filter=size%3A100+g&filter=available");
    const params = new URL(href, "https://x.invalid").searchParams;
    expect(parseFilters(params.getAll("filter")).map(serializeFilter)).toEqual(["size:100 g", "available"]);
    expect(collectionHref("matcha", { sort: "featured" })).toBe("/collections/matcha");
  });

  it("labels filters for chips", () => {
    expect(filterLabel({ kind: "price", min: 10, max: 50 })).toBe("$10–$50");
    expect(filterLabel({ kind: "available" })).toBe("In stock");
  });

  it("shows filters only at 6+ products", () => {
    expect(showFilters(5, 5)).toBe(false);
    expect(showFilters(6, 6)).toBe(true);
    expect(showFilters(null, 6)).toBe(true);
  });
});

describe("collection header", () => {
  it("shortens names for scale captions", () => {
    expect(shortName("Yame no Mukashi")).toBe("Yame");
    expect(shortName("[Daily tea name]")).toBe("[Daily]");
  });
  it("picks the header treatment by handle", () => {
    expect(collectionVariant("matcha")).toBe("taste");
    expect(collectionVariant("gifts")).toBe("gifts");
    expect(collectionVariant("accessories")).toBe("plain");
  });
});

describe("PriceBlock", () => {
  it("strikes compare-at only when strictly higher", () => {
    const { container, rerender } = render(<PriceBlock price={money(4800)} compareAt={money(4800)} />);
    expect(container.querySelector("s")).toBeNull();
    rerender(<PriceBlock price={money(4000)} compareAt={money(4800)} />);
    expect(container.querySelector("s")?.textContent).toBe("Was $48.00");
    expect(container.textContent).toContain("Sale price");
  });

  it("shows per-cup only when given", () => {
    const { container, rerender } = render(<PriceBlock price={money(4800)} perCup={null} />);
    expect(container.textContent).not.toContain("per cup");
    rerender(<PriceBlock price={money(4800)} perCup={money(320)} perCupNote="([2] g serve)" />);
    expect(container.textContent).toContain("≈ $3.20 per cup ([2] g serve)");
  });
});

describe("ProductCard", () => {
  it("offers Choose size for multi-size teas, with From pricing", () => {
    render(<ProductCard product={byHandle("yame")} />);
    expect(screen.getByRole("link", { name: "Choose size" }).getAttribute("href")).toBe("/products/yame");
    expect(screen.getByText("From $[48.00]")).toBeTruthy();
    expect(screen.getByText("NEW")).toBeTruthy();
    expect(screen.getByRole("img", { name: /Deep, 4 of 5/ })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2); // two note chips max
  });

  it("offers Add to cart for single-size products", () => {
    render(<ProductCard product={byHandle("daily")} />);
    expect(screen.getByRole("button", { name: "Add [Daily tea name] to cart" })).toBeTruthy();
    expect(screen.queryByText(/From/)).toBeNull();
  });

  it("never offers Add to cart when sold out", () => {
    const soldOut: Product = { ...byHandle("daily"), availableForSale: false, variants: byHandle("daily").variants.map((v) => ({ ...v, availableForSale: false })) };
    render(<ProductCard product={soldOut} />);
    expect(screen.queryByRole("button", { name: /Add .* to cart/ })).toBeNull();
    expect(screen.getByRole("link", { name: "Notify me" }).getAttribute("href")).toBe("/products/daily#notify");
    expect(screen.getByText("SOLD OUT")).toBeTruthy();
  });

  it("shows the card note for gifts instead of a taste scale", () => {
    render(<ProductCard product={byHandle("two-tin-discovery-set")} />);
    expect(screen.getByText("GIFT SET")).toBeTruthy();
    expect(screen.queryByRole("img", { name: /of 5/ })).toBeNull();
  });

  it("labels card price from the prototype rule", () => {
    expect(cardPriceLabel(byHandle("yame"), (m) => String(m.amount))).toBe("From 4800");
    expect(cardPriceLabel(byHandle("daily"), (m) => String(m.amount))).toBe("3200");
  });
});
