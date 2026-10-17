import { lowestPrice } from "./product";
import type { Product, SortKey } from "./types";

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "best", label: "Best selling" },
  { value: "low", label: "Price, low to high" },
  { value: "high", label: "Price, high to low" },
  { value: "new", label: "Newest" },
];

export function parseSort(value: string | string[] | undefined): SortKey {
  const v = Array.isArray(value) ? value[0] : value;
  return SORT_OPTIONS.some((o) => o.value === v) ? (v as SortKey) : "featured";
}

/** Fixture-side sorting. Shopify sorts server-side with the matching `ProductCollectionSortKeys`. */
export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const price = (p: Product) => lowestPrice(p)?.amount ?? 0;
  const copy = products.slice();
  if (sort === "low") copy.sort((a, b) => price(a) - price(b));
  if (sort === "high") copy.sort((a, b) => price(b) - price(a));
  if (sort === "new") copy.reverse();
  return copy;
}

/** Filters only appear when a collection has six or more products (brief §4). */
export const FILTER_MIN_PRODUCTS = 6;
export const PAGE_SIZE = 12;
