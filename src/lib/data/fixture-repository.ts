import { capQuantity, cartTotals, lineCost } from "./cart-math";
import { CHARACTERS, COLLECTIONS, FAQ, GUIDES, POLICIES, PREP_METHODS, PRODUCTS } from "./fixtures/catalog";
import { eyebrow } from "./product";
import { CommerceError, GIFT_NOTE_MAX, matchesQuery, type CollectionQuery, type CommerceRepository, type LineInput, type LineUpdate } from "./repository";
import { PAGE_SIZE, sortProducts } from "./sort";
import { defaultSiteSettings } from "@/lib/config/site";
import type { Cart, CartLine, Product, SiteSettings, Variant } from "./types";

type StoredCart = { id: string; lines: Array<{ id: string; merchandiseId: string; quantity: number }>; gift: boolean; giftNote: string };

// Survives hot reloads in dev; fixture carts are never shared across server instances.
const store: Map<string, StoredCart> = ((globalThis as { __wmFixtureCarts?: Map<string, StoredCart> }).__wmFixtureCarts ??= new Map());

function findVariant(merchandiseId: string): { product: Product; variant: Variant } | null {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.id === merchandiseId);
    if (variant) return { product, variant };
  }
  return null;
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export class FixtureRepository implements CommerceRepository {
  constructor(private readonly options: { freeShippingThreshold: number }) {}

  async getProducts() {
    return PRODUCTS;
  }

  async getProduct(handle: string) {
    return PRODUCTS.find((p) => p.handle === handle) ?? null;
  }

  async getCollection(handle: string, query: CollectionQuery = {}) {
    const def = COLLECTIONS[handle];
    if (!def) return null;
    let products = def.handles.map((h) => PRODUCTS.find((p) => p.handle === h)).filter((p): p is Product => Boolean(p));
    if (query.available) products = products.filter((p) => p.variants.some((v) => v.availableForSale));
    products = sortProducts(products, query.sort ?? "featured");
    const start = query.after ? Number(query.after) : 0;
    const first = query.first ?? PAGE_SIZE;
    const page = products.slice(start, start + first);
    const end = start + page.length;
    return {
      handle,
      title: def.title,
      description: def.description,
      products: page,
      total: products.length,
      endCursor: end < products.length ? String(end) : null,
      hasNextPage: end < products.length,
    };
  }

  async getCollectionHandles() {
    return Object.keys(COLLECTIONS);
  }

  async search(query: string) {
    const products = PRODUCTS.filter(
      (p) => p.kind === "tea" && matchesQuery(`${p.title} matcha ${eyebrow(p)} ${p.tastingNotes.join(" ")}`, query),
    );
    const guides = GUIDES.filter((g) => matchesQuery(`${g.title} ${g.method}`, query));
    return { products, guides };
  }

  async getGuides() {
    return GUIDES;
  }

  async getGuide(handle: string) {
    return GUIDES.find((g) => g.handle === handle) ?? null;
  }

  async getPrepMethods() {
    return PREP_METHODS;
  }

  async getFaq() {
    return FAQ;
  }

  async getCharacters() {
    return CHARACTERS;
  }

  async getPolicies() {
    return POLICIES;
  }

  async getSiteSettings(): Promise<SiteSettings> {
    return defaultSiteSettings(this.options.freeShippingThreshold, true);
  }

  /* ---------- Cart ---------- */

  private materialise(stored: StoredCart): Cart {
    const lines: CartLine[] = stored.lines.flatMap((l) => {
      const found = findVariant(l.merchandiseId);
      if (!found) return [];
      const { product, variant } = found;
      const line: CartLine = {
        id: l.id,
        merchandiseId: l.merchandiseId,
        quantity: l.quantity,
        cost: lineCost({ variant: { ...variant }, quantity: l.quantity }),
        product: { handle: product.handle, title: product.title, kind: product.kind, eyebrow: eyebrow(product), tin: product.tin },
        variant: {
          title: variant.title,
          price: variant.price,
          availableForSale: variant.availableForSale,
          quantityAvailable: variant.quantityAvailable,
        },
      };
      return [line];
    });
    return {
      id: stored.id,
      checkoutUrl: `/dev/checkout?cart=${encodeURIComponent(stored.id)}`,
      lines,
      ...cartTotals(lines, true),
      gift: stored.gift,
      giftNote: stored.giftNote,
    };
  }

  private load(cartId: string): StoredCart {
    const stored = store.get(cartId);
    if (!stored) throw new CommerceError("Cart not found", "not-found");
    return stored;
  }

  async getCart(cartId: string) {
    const stored = store.get(cartId);
    return stored ? this.materialise(stored) : null;
  }

  async createCart(lines: LineInput[] = []) {
    const stored: StoredCart = { id: newId("cart"), lines: [], gift: false, giftNote: "" };
    store.set(stored.id, stored);
    return lines.length ? this.addLines(stored.id, lines) : this.materialise(stored);
  }

  async addLines(cartId: string, lines: LineInput[]) {
    const stored = this.load(cartId);
    for (const input of lines) {
      const found = findVariant(input.merchandiseId);
      if (!found) throw new CommerceError("That item is no longer available.", "user");
      if (!found.variant.availableForSale) throw new CommerceError("That size is sold out.", "user");
      const existing = stored.lines.find((l) => l.merchandiseId === input.merchandiseId);
      const wanted = (existing?.quantity ?? 0) + input.quantity;
      const quantity = capQuantity(wanted, found.variant.quantityAvailable);
      if (existing) existing.quantity = quantity;
      else stored.lines.push({ id: newId("line"), merchandiseId: input.merchandiseId, quantity });
    }
    return this.materialise(stored);
  }

  async updateLines(cartId: string, updates: LineUpdate[]) {
    const stored = this.load(cartId);
    for (const u of updates) {
      const line = stored.lines.find((l) => l.id === u.id);
      if (!line) continue;
      const found = findVariant(line.merchandiseId);
      line.quantity = capQuantity(u.quantity, found?.variant.quantityAvailable ?? null);
    }
    stored.lines = stored.lines.filter((l) => l.quantity > 0);
    return this.materialise(stored);
  }

  async removeLines(cartId: string, lineIds: string[]) {
    const stored = this.load(cartId);
    stored.lines = stored.lines.filter((l) => !lineIds.includes(l.id));
    return this.materialise(stored);
  }

  async updateGift(cartId: string, gift: boolean, note: string) {
    const stored = this.load(cartId);
    stored.gift = gift;
    stored.giftNote = gift ? note.slice(0, GIFT_NOTE_MAX) : "";
    return this.materialise(stored);
  }
}
