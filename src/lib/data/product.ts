import type { BadgeKind, BestFor, Product, ProductKind, TastePosition, TasteProfile, Variant } from "./types";
import { TASTE_WORDS } from "./types";

const BADGE_TAGS: Record<string, BadgeKind> = {
  new: "new",
  "best-seller": "best-seller",
  bestseller: "best-seller",
  limited: "limited",
  sale: "sale",
};

/** Tag-to-badge rules (Shopify tags `new`, `best-seller`, `limited`, `sale`). Order is display priority. */
export function badgesFromTags(tags: string[], onSale: boolean): BadgeKind[] {
  const found = new Set<BadgeKind>();
  for (const t of tags) {
    const b = BADGE_TAGS[t.trim().toLowerCase()];
    if (b) found.add(b);
  }
  if (onSale) found.add("sale");
  const order: BadgeKind[] = ["sale", "new", "limited", "best-seller"];
  return order.filter((b) => found.has(b));
}

export const BADGE_LABEL: Record<BadgeKind, string> = {
  new: "NEW",
  "best-seller": "BEST SELLER",
  limited: "LIMITED",
  sale: "SALE",
};

export function isTastePosition(n: unknown): n is TastePosition {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5;
}

export function tasteProfile(position: unknown, tier: string | null): TasteProfile | null {
  const n = typeof position === "string" ? Number.parseInt(position, 10) : position;
  if (!isTastePosition(n)) return null;
  return { position: n, word: TASTE_WORDS[n - 1], tier: tier?.trim() || null };
}

/** "Deep, 4 of 5": the scale must read without colour. */
export function tasteText(taste: TasteProfile): string {
  return `${taste.word}, ${taste.position} of 5`;
}

const BEST_FOR: readonly BestFor[] = ["Latte", "Straight", "Iced"];

export function parseBestFor(values: string[]): BestFor[] {
  return values
    .map((v) => BEST_FOR.find((b) => b.toLowerCase() === v.trim().toLowerCase()))
    .filter((v): v is BestFor => v !== undefined);
}

export function productKind(productType: string, tags: string[]): ProductKind {
  const t = productType.trim().toLowerCase();
  const lowered = tags.map((x) => x.toLowerCase());
  if (t.includes("gift") || lowered.includes("gift-set")) return "gift";
  if (t.includes("accessor") || t.includes("tool") || lowered.includes("accessory")) return "accessory";
  return "tea";
}

/** "RESERVE · DEEP" for teas, "GIFT SET" / "TOOL" otherwise. */
export function productEyebrow(p: Pick<Product, "kind" | "taste">): string {
  if (p.kind === "gift") return "GIFT SET";
  if (p.kind === "accessory") return "TOOL";
  if (!p.taste) return "MATCHA";
  return [p.taste.tier, p.taste.word].filter(Boolean).join(" · ").toUpperCase();
}

/** First available variant, else the first variant (so a fully sold-out product still renders). */
export function defaultVariant(p: Pick<Product, "variants">): Variant | undefined {
  return p.variants.find((v) => v.availableForSale) ?? p.variants[0];
}

/** Resolves `?variant=` (a full gid or its numeric tail) to a variant, falling back to the default. */
export function selectVariant(p: Pick<Product, "variants">, requested: string | null | undefined): Variant | undefined {
  if (requested) {
    const hit = p.variants.find((v) => v.id === requested || v.id.endsWith(`/${requested}`));
    if (hit) return hit;
  }
  return defaultVariant(p);
}

/** Numeric tail of a Shopify gid, used in URLs (`?variant=123`). */
export function variantParam(id: string): string {
  const tail = id.split("/").pop();
  return tail ?? id;
}

export type StockState = { kind: "in-stock" } | { kind: "low"; remaining: number } | { kind: "sold-out" };

/** One function decides stock, so StockNotice and AddToCart can never disagree. */
export function stockState(v: Pick<Variant, "availableForSale" | "quantityAvailable">, lowThreshold: number): StockState {
  if (!v.availableForSale) return { kind: "sold-out" };
  if (v.quantityAvailable !== null && v.quantityAvailable > 0 && v.quantityAvailable <= lowThreshold) {
    return { kind: "low", remaining: v.quantityAvailable };
  }
  return { kind: "in-stock" };
}

export function isMultiVariant(p: Pick<Product, "variants">): boolean {
  return p.variants.length > 1;
}

/** Card price: "From $48.00" when there is more than one size (prototype rule), else the single price. */
export function cardPriceLabel(p: Pick<Product, "priceRange" | "variants">, format: (m: Product["priceRange"]["min"]) => string): string {
  return `${isMultiVariant(p) ? "From " : ""}${format(p.priceRange.min)}`;
}
