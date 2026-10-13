import { SITE_SETTINGS_FALLBACK } from "@/lib/config/site";
import { addMoney, multiplyMoney, sumMoney, zero } from "../money";
import { productEyebrow } from "../product";
import type { CommerceRepository } from "../repository";
import { CartUserError } from "../repository";
import type {
  Article,
  Cart,
  CartAttributes,
  CartLine,
  CartLineInput,
  CartLineUpdate,
  CollectionPage,
  CollectionQuery,
  FilterGroup,
  Product,
  ProductFilter,
  SiteSettings,
  SortKey,
  Variant,
} from "../types";
import { ARTICLES, COLLECTIONS, FAQ, FIXTURE_CHECKOUT_ORIGIN, MENUS, POLICIES, PRODUCTS } from "./data";

type StoredLine = { id: string; variantId: string; quantity: number };
type StoredCart = { id: string; lines: StoredLine[]; attributes: CartAttributes; note: string; seq: number };

/** In-memory carts survive hot reloads in dev; they reset when the server restarts (fine for fixtures). */
const globalStore = globalThis as unknown as { __wmFixtureCarts?: Map<string, StoredCart> };
const carts: Map<string, StoredCart> = (globalStore.__wmFixtureCarts ??= new Map());

const DEFAULT_PAGE_SIZE = 12;

function findVariant(variantId: string): { product: Product; variant: Variant } | null {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

function encodeCursor(index: number): string {
  return Buffer.from(`i:${index}`).toString("base64url");
}

function decodeCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  const m = /^i:(\d+)$/.exec(Buffer.from(cursor, "base64url").toString());
  return m ? Number(m[1]) : 0;
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = products.slice();
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.priceRange.min.amount - b.priceRange.min.amount);
    case "price-desc":
      return list.sort((a, b) => b.priceRange.min.amount - a.priceRange.min.amount);
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "best-selling":
    case "featured":
    default:
      return list;
  }
}

export function matchesFilter(p: Product, f: ProductFilter): boolean {
  switch (f.kind) {
    case "available":
      return p.availableForSale;
    case "price": {
      const amount = p.priceRange.min.amount / 100;
      return (f.min === undefined || amount >= f.min) && (f.max === undefined || amount <= f.max);
    }
    case "size":
      return p.variants.some((v) => v.size === f.value);
    case "note":
      return p.tastingNotes.some((n) => n.toLowerCase() === f.value.toLowerCase());
  }
}

function filterGroups(products: Product[]): FilterGroup[] {
  const count = (pred: (p: Product) => boolean) => products.filter(pred).length;
  const sizes = [...new Set(products.flatMap((p) => p.variants.map((v) => v.size)))];
  const notes = [...new Set(products.flatMap((p) => p.tastingNotes))].filter((n) => !n.startsWith("["));
  const groups: FilterGroup[] = [
    {
      id: "availability",
      label: "Availability",
      values: [{ id: "in-stock", label: "In stock", count: count((p) => p.availableForSale), input: { kind: "available" } }],
    },
    {
      id: "size",
      label: "Size",
      values: sizes.map((s) => ({ id: s, label: s, count: count((p) => p.variants.some((v) => v.size === s)), input: { kind: "size", value: s } })),
    },
    {
      id: "note",
      label: "Tasting note",
      values: notes.map((n) => ({ id: n, label: n, count: count((p) => p.tastingNotes.includes(n)), input: { kind: "note", value: n } })),
    },
  ];
  return groups.filter((g) => g.values.length > 0);
}

function searchText(p: Product): string {
  return [p.title, "matcha", p.taste?.tier, p.taste?.word, ...p.tastingNotes, ...p.bestFor, p.kind === "gift" ? "gift" : "", p.kind === "accessory" ? "tool accessory" : ""]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function articleText(a: Article): string {
  return `${a.title} ${a.method}`.toLowerCase();
}

export class FixtureRepository implements CommerceRepository {
  readonly source = "fixtures" as const;

  constructor(private readonly settings: SiteSettings = SITE_SETTINGS_FALLBACK) {}

  async getProduct(handle: string) {
    return PRODUCTS.find((p) => p.handle === handle) ?? null;
  }

  async getProductHandles() {
    return PRODUCTS.map((p) => p.handle);
  }

  async getRelatedProducts(handle: string, limit = 4) {
    const self = PRODUCTS.find((p) => p.handle === handle);
    const sameKind = PRODUCTS.filter((p) => p.handle !== handle && p.kind === (self?.kind ?? "tea"));
    return sameKind.slice(0, limit);
  }

  async getPairings(excludeHandles: string[], limit = 2) {
    return PRODUCTS.filter((p) => p.kind === "accessory" && !excludeHandles.includes(p.handle)).slice(0, limit);
  }

  async getCollection(handle: string, query: CollectionQuery = {}): Promise<CollectionPage | null> {
    const c = COLLECTIONS.find((x) => x.handle === handle);
    if (!c) return null;
    const all = c.productHandles.map((h) => PRODUCTS.find((p) => p.handle === h)).filter((p): p is Product => Boolean(p));
    const filtered = (query.filters ?? []).reduce((list, f) => list.filter((p) => matchesFilter(p, f)), all);
    const sorted = sortProducts(filtered, query.sort ?? "featured");
    const start = decodeCursor(query.after);
    const first = query.first ?? DEFAULT_PAGE_SIZE;
    const page = sorted.slice(start, start + first);
    const end = start + page.length;
    return {
      collection: {
        id: c.id,
        handle: c.handle,
        title: c.title,
        description: c.description,
        descriptionHtml: `<p>${c.description}</p>`,
        image: null,
        seo: { title: null, description: null },
      },
      products: {
        nodes: page,
        pageInfo: { hasNextPage: end < sorted.length, endCursor: page.length ? encodeCursor(end) : null },
        totalCount: sorted.length,
      },
      filters: filterGroups(all),
    };
  }

  async getCollectionHandles() {
    return COLLECTIONS.map((c) => c.handle);
  }

  async search(query: string, { first = 24 }: { first?: number } = {}) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { products: [], articles: [] };
    return {
      products: PRODUCTS.filter((p) => searchText(p).includes(q)).slice(0, first),
      articles: ARTICLES.filter((a) => articleText(a).includes(q)).slice(0, first),
    };
  }

  async predictiveSearch(query: string) {
    const { products, articles } = await this.search(query);
    return { products: products.slice(0, 4), articles: articles.slice(0, 2), queries: [] };
  }

  async getMenu(handle: string) {
    return MENUS.find((m) => m.handle === handle) ?? null;
  }

  async getSiteSettings() {
    return this.settings;
  }

  async getFaqEntries() {
    return FAQ;
  }

  async getArticles(blogHandle: string) {
    return ARTICLES.filter((a) => a.blogHandle === blogHandle);
  }

  async getArticle(blogHandle: string, handle: string) {
    return ARTICLES.find((a) => a.blogHandle === blogHandle && a.handle === handle) ?? null;
  }

  async getPage() {
    // Content pages use typed local content in fixtures mode.
    return null;
  }

  async getPolicy(handle: string) {
    return POLICIES.find((p) => p.handle === handle) ?? null;
  }

  /* ---------- Cart ---------- */

  private toCart(stored: StoredCart): Cart {
    const lines: CartLine[] = [];
    for (const l of stored.lines) {
      const hit = findVariant(l.variantId);
      if (!hit) continue;
      const { product, variant } = hit;
      lines.push({
        id: l.id,
        quantity: l.quantity,
        merchandise: {
          variantId: variant.id,
          productHandle: product.handle,
          productTitle: product.title,
          productKind: product.kind,
          eyebrow: productEyebrow(product),
          size: variant.size,
          image: variant.image ?? product.media[0] ?? null,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          availableForSale: variant.availableForSale,
          quantityAvailable: variant.quantityAvailable,
        },
        cost: { total: multiplyMoney(variant.price, l.quantity) },
      });
    }
    const currency = this.settings.currencyCode;
    const subtotal = lines.length ? sumMoney(lines.map((l) => l.cost.total), currency) : zero(currency);
    return {
      id: stored.id,
      checkoutUrl: `${FIXTURE_CHECKOUT_ORIGIN}/cart/c/${encodeURIComponent(stored.id)}`,
      lines,
      totalQuantity: lines.reduce((n, l) => n + l.quantity, 0),
      cost: { subtotal, total: addMoney(subtotal, zero(currency)) },
      attributes: { ...stored.attributes },
      note: stored.note,
    };
  }

  private applyAdd(stored: StoredCart, input: CartLineInput) {
    const hit = findVariant(input.variantId);
    if (!hit) throw new CartUserError("That item is no longer available.", "MERCHANDISE_NOT_FOUND");
    if (!hit.variant.availableForSale) throw new CartUserError(`${hit.product.title} (${hit.variant.size}) is sold out.`, "SOLD_OUT");
    const cap = hit.variant.quantityAvailable ?? Number.POSITIVE_INFINITY;
    const existing = stored.lines.find((l) => l.variantId === input.variantId);
    const want = (existing?.quantity ?? 0) + Math.max(1, Math.trunc(input.quantity));
    const quantity = Math.min(want, cap);
    if (existing) existing.quantity = quantity;
    else stored.lines.push({ id: `gid://shopify/CartLine/${stored.id}-${++stored.seq}`, variantId: input.variantId, quantity });
  }

  async createCart(lines: CartLineInput[] = []) {
    const stored: StoredCart = { id: crypto.randomUUID(), lines: [], attributes: { gift: false, giftNote: "" }, note: "", seq: 0 };
    for (const l of lines) this.applyAdd(stored, l);
    carts.set(stored.id, stored);
    return this.toCart(stored);
  }

  async getCart(cartId: string) {
    const stored = carts.get(cartId);
    return stored ? this.toCart(stored) : null;
  }

  async addCartLines(cartId: string, lines: CartLineInput[]) {
    const stored = carts.get(cartId);
    if (!stored) return null;
    for (const l of lines) this.applyAdd(stored, l);
    return this.toCart(stored);
  }

  async updateCartLines(cartId: string, updates: CartLineUpdate[]) {
    const stored = carts.get(cartId);
    if (!stored) return null;
    for (const u of updates) {
      const line = stored.lines.find((l) => l.id === u.lineId);
      if (!line) continue;
      if (u.quantity <= 0) {
        stored.lines = stored.lines.filter((l) => l.id !== u.lineId);
        continue;
      }
      const cap = findVariant(line.variantId)?.variant.quantityAvailable ?? Number.POSITIVE_INFINITY;
      line.quantity = Math.min(Math.trunc(u.quantity), cap);
    }
    return this.toCart(stored);
  }

  async removeCartLines(cartId: string, lineIds: string[]) {
    const stored = carts.get(cartId);
    if (!stored) return null;
    stored.lines = stored.lines.filter((l) => !lineIds.includes(l.id));
    return this.toCart(stored);
  }

  async updateCartAttributes(cartId: string, attributes: CartAttributes) {
    const stored = carts.get(cartId);
    if (!stored) return null;
    stored.attributes = { gift: attributes.gift, giftNote: attributes.gift ? attributes.giftNote.slice(0, 150) : "" };
    return this.toCart(stored);
  }

  async updateCartNote(cartId: string, note: string) {
    const stored = carts.get(cartId);
    if (!stored) return null;
    stored.note = note;
    return this.toCart(stored);
  }
}
