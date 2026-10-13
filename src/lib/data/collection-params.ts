import type { ProductFilter, SortKey } from "./types";
import { SORT_OPTIONS } from "./types";

/**
 * Collection state lives in the URL (`?sort=price-asc&filter=size:30 g&filter=available`) so it is
 * shareable, back-button friendly and readable on the server.
 */

export function parseSort(value: string | string[] | undefined): SortKey {
  const v = Array.isArray(value) ? value[0] : value;
  return SORT_OPTIONS.find((o) => o.value === v)?.value ?? "featured";
}

export function serializeFilter(f: ProductFilter): string {
  switch (f.kind) {
    case "available":
      return "available";
    case "size":
      return `size:${f.value}`;
    case "note":
      return `note:${f.value}`;
    case "price":
      return `price:${f.min ?? ""}-${f.max ?? ""}`;
  }
}

export function parseFilter(raw: string): ProductFilter | null {
  const s = raw.trim();
  if (s === "available") return { kind: "available" };
  const i = s.indexOf(":");
  if (i < 0) return null;
  const key = s.slice(0, i);
  const value = s.slice(i + 1).trim().slice(0, 60);
  if (!value) return null;
  if (key === "size") return { kind: "size", value };
  if (key === "note") return { kind: "note", value };
  if (key === "price") {
    const m = /^(\d*(?:\.\d+)?)-(\d*(?:\.\d+)?)$/.exec(value);
    if (!m) return null;
    const min = m[1] ? Number(m[1]) : undefined;
    const max = m[2] ? Number(m[2]) : undefined;
    if (min === undefined && max === undefined) return null;
    return { kind: "price", min, max };
  }
  return null;
}

export function parseFilters(value: string | string[] | undefined): ProductFilter[] {
  const list = value === undefined ? [] : Array.isArray(value) ? value : [value];
  const seen = new Set<string>();
  const out: ProductFilter[] = [];
  for (const raw of list.slice(0, 20)) {
    const f = parseFilter(raw);
    if (!f) continue;
    const key = serializeFilter(f);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

export function filterLabel(f: ProductFilter): string {
  switch (f.kind) {
    case "available":
      return "In stock";
    case "size":
    case "note":
      return f.value;
    case "price":
      return f.min !== undefined && f.max !== undefined ? `$${f.min}–$${f.max}` : f.min !== undefined ? `From $${f.min}` : `Up to $${f.max}`;
  }
}

export function collectionHref(handle: string, state: { sort?: SortKey; filters?: ProductFilter[] }): string {
  const params = new URLSearchParams();
  if (state.sort && state.sort !== "featured") params.set("sort", state.sort);
  for (const f of state.filters ?? []) params.append("filter", serializeFilter(f));
  const qs = params.toString();
  return `/collections/${handle}${qs ? `?${qs}` : ""}`;
}

/** Filters are shown only for collections with 6 or more products (design brief §8 D1). */
export const FILTERS_MIN_PRODUCTS = 6;

export function showFilters(totalProducts: number | null, loaded: number): boolean {
  return (totalProducts ?? loaded) >= FILTERS_MIN_PRODUCTS;
}
