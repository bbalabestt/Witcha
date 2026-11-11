import { priceLabel } from "./money";
import type { Money, Product, TeaType, Variant } from "./types";

/** Never show a compare-at price that is not strictly higher than the price. */
export function normaliseCompareAt(price: Money, compareAt: Money | null): Money | null {
  return compareAt && compareAt.amount > price.amount ? compareAt : null;
}

export type StockState = { kind: "in-stock" } | { kind: "sold-out" };

/** One rule for notice and button, so they can never disagree. */
export function stockState(variant: Variant): StockState {
  return variant.availableForSale ? { kind: "in-stock" } : { kind: "sold-out" };
}

/** Upper bound for quantity steppers; null when stock is not tracked. */
export function maxQuantity(variant: Variant): number | null {
  if (!variant.availableForSale) return 0;
  return variant.quantityAvailable !== null && variant.quantityAvailable > 0 ? variant.quantityAvailable : null;
}

export function firstAvailable(product: Product): Variant | null {
  return product.variants.find((v) => v.availableForSale) ?? product.variants[0] ?? null;
}

export function lowestPrice(product: Product): Money | null {
  if (product.variants.length === 0) return null;
  return product.variants.reduce((min, v) => (v.price.amount < min.amount ? v.price : min), product.variants[0]!.price);
}

export function cardPrice(product: Product): string | null {
  const label = priceLabel(lowestPrice(product));
  if (!label) return null;
  return `${product.variants.length > 1 ? "From " : ""}${label}`;
}

/** Hojicha is checked first: it must never fall into a matcha grouping. */
export function teaTypeFrom(text: string): TeaType | null {
  if (/hojicha/i.test(text)) return "hojicha";
  return /matcha/i.test(text) ? "matcha" : null;
}

export function teaTypeLabel(type: TeaType | null): string {
  return type === "hojicha" ? "Hojicha" : type === "matcha" ? "Matcha" : "";
}
