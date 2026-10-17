import { formatMoney, money } from "./money";
import type { BadgeKind, Money, Product, Taste, Variant } from "./types";

/** Brief §9: never show a compare-at price that is not strictly higher than the price. */
export function normaliseCompareAt(price: Money, compareAt: Money | null): Money | null {
  return compareAt && compareAt.amount > price.amount ? compareAt : null;
}

/** "≈ $3.20 per cup" only when both the price and the servings exist. */
export function perCup(variant: Variant): Money | null {
  if (!variant.servings || variant.servings <= 0) return null;
  return money(variant.price.amount / variant.servings, Boolean(variant.price.placeholder));
}

export type StockState =
  | { kind: "in-stock" }
  | { kind: "low"; quantity: number }
  | { kind: "sold-out" };

/** One rule for notice and button, so they can never disagree. Never "Only 0 left". */
export function stockState(variant: Variant, lowThreshold: number): StockState {
  if (!variant.availableForSale) return { kind: "sold-out" };
  const q = variant.quantityAvailable;
  if (q !== null && q > 0 && q <= lowThreshold) return { kind: "low", quantity: q };
  return { kind: "in-stock" };
}

/** Upper bound for quantity steppers; null when stock is not tracked. */
export function maxQuantity(variant: Variant): number | null {
  if (!variant.availableForSale) return 0;
  return variant.quantityAvailable !== null && variant.quantityAvailable > 0 ? variant.quantityAvailable : null;
}

export function eyebrow(product: Pick<Product, "kind" | "taste">): string {
  if (product.kind === "gift") return "GIFT SET";
  if (product.kind === "tool") return "TOOL";
  if (!product.taste) return "";
  return `${product.taste.tier} · ${product.taste.word}`.toUpperCase();
}

/** Text equivalent of the taste marker, so the scale reads without colour. */
export function tasteLabel(taste: Taste): string {
  return `${taste.word}, ${taste.position} of 5`;
}

/** Left offset for an arch marker of `width` px centred on stop `position` (1–5). */
export function markerLeft(position: number, width: number): string {
  return `calc(${(position - 1) * 25}% - ${width / 2}px)`;
}

const TAG_BADGES: Array<[string, BadgeKind]> = [
  ["sale", "SALE"],
  ["limited", "LIMITED"],
  ["best-seller", "BEST SELLER"],
  ["new", "NEW"],
];

/** Tag-to-badge rule: sold out wins, then a real sale, then the first matching tag. */
export function badgeFor(tags: string[], variants: Variant[]): BadgeKind | null {
  if (variants.length > 0 && variants.every((v) => !v.availableForSale)) return "SOLD OUT";
  const onSale = variants.some((v) => v.compareAtPrice !== null);
  const lower = tags.map((t) => t.toLowerCase());
  for (const [tag, badge] of TAG_BADGES) {
    if (badge === "SALE" && !onSale) continue;
    if (lower.includes(tag)) return badge;
  }
  return onSale ? "SALE" : null;
}

export function firstAvailable(product: Product): Variant | null {
  return product.variants.find((v) => v.availableForSale) ?? product.variants[0] ?? null;
}

export function lowestPrice(product: Product): Money | null {
  if (product.variants.length === 0) return null;
  return product.variants.reduce((min, v) => (v.price.amount < min.amount ? v.price : min), product.variants[0]!.price);
}

export type CardAction = "add" | "choose" | "notify";

/** Quick add only for single-variant products; sold out becomes "Notify me". */
export function cardAction(product: Product): CardAction {
  if (!product.variants.some((v) => v.availableForSale)) return "notify";
  return product.variants.length > 1 ? "choose" : "add";
}

export function cardPrice(product: Product): string {
  const low = lowestPrice(product);
  if (!low) return "";
  return `${product.variants.length > 1 ? "From " : ""}${formatMoney(low)}`;
}

/** "+$92.00" deltas against the first variant for option pills. */
export function variantDelta(base: Variant, v: Variant): string {
  if (v.id === base.id) return formatMoney(v.price);
  const diff = v.price.amount - base.price.amount;
  return `${diff >= 0 ? "+" : "−"}${formatMoney(money(Math.abs(diff), Boolean(v.price.placeholder)))}`;
}
