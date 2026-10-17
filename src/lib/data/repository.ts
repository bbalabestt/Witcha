import type {
  Cart,
  Character,
  CollectionPage,
  FaqEntry,
  Guide,
  Policy,
  PrepMethod,
  Product,
  SearchResults,
  SiteSettings,
  SortKey,
} from "./types";

export type CollectionQuery = {
  sort?: SortKey;
  first?: number;
  after?: string | null;
  /** Availability filter (`in-stock`); price/size/note filters follow the same shape. */
  available?: boolean;
};

export type LineInput = { merchandiseId: string; quantity: number };
export type LineUpdate = { id: string; quantity: number };

/** One interface, two implementations: `FixtureRepository` (dev, no credentials) and `ShopifyRepository`. */
export interface CommerceRepository {
  getProducts(): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  getCollection(handle: string, query?: CollectionQuery): Promise<CollectionPage | null>;
  getCollectionHandles(): Promise<string[]>;
  search(query: string): Promise<SearchResults>;
  getGuides(): Promise<Guide[]>;
  getGuide(handle: string): Promise<Guide | null>;
  getPrepMethods(): Promise<PrepMethod[]>;
  getFaq(): Promise<FaqEntry[]>;
  getCharacters(): Promise<Character[]>;
  getPolicies(): Promise<Policy[]>;
  getSiteSettings(): Promise<SiteSettings>;

  getCart(cartId: string): Promise<Cart | null>;
  createCart(lines?: LineInput[]): Promise<Cart>;
  addLines(cartId: string, lines: LineInput[]): Promise<Cart>;
  updateLines(cartId: string, lines: LineUpdate[]): Promise<Cart>;
  removeLines(cartId: string, lineIds: string[]): Promise<Cart>;
  updateGift(cartId: string, gift: boolean, note: string): Promise<Cart>;
}

export class CommerceError extends Error {
  constructor(
    message: string,
    readonly kind: "network" | "not-found" | "user" | "config",
  ) {
    super(message);
    this.name = "CommerceError";
  }
}

export const GIFT_NOTE_MAX = 150;

/** Shared search matcher so fixtures and the predictive endpoint agree on what matches. */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q.length >= 2 && haystack.toLowerCase().includes(q);
}
