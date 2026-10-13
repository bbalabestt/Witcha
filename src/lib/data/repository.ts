import type {
  Article,
  Cart,
  CartAttributes,
  CartLineInput,
  CartLineUpdate,
  CollectionPage,
  CollectionQuery,
  ContentPage,
  FaqEntry,
  Menu,
  Policy,
  PredictiveResults,
  Product,
  SearchResults,
  SiteSettings,
} from "./types";

/**
 * One interface, two implementations (Shopify and fixtures). Reads return null for "not found";
 * they throw only for genuine failures (network, auth), which error boundaries handle.
 */
export interface CommerceRepository {
  readonly source: "shopify" | "fixtures";

  getProduct(handle: string): Promise<Product | null>;
  getProductHandles(): Promise<string[]>;
  /** Products to show beside this one ("You might also like"). */
  getRelatedProducts(handle: string, limit?: number): Promise<Product[]>;
  /** Tools and second tins for "Pair with" in the cart and PDP. */
  getPairings(excludeHandles: string[], limit?: number): Promise<Product[]>;

  getCollection(handle: string, query?: CollectionQuery): Promise<CollectionPage | null>;
  getCollectionHandles(): Promise<string[]>;

  search(query: string, options?: { first?: number }): Promise<SearchResults>;
  predictiveSearch(query: string): Promise<PredictiveResults>;

  getMenu(handle: string): Promise<Menu | null>;
  getSiteSettings(): Promise<SiteSettings>;
  getFaqEntries(): Promise<FaqEntry[]>;

  getArticles(blogHandle: string): Promise<Article[]>;
  getArticle(blogHandle: string, handle: string): Promise<Article | null>;
  getPage(handle: string): Promise<ContentPage | null>;
  getPolicy(handle: string): Promise<Policy | null>;

  createCart(lines?: CartLineInput[]): Promise<Cart>;
  /** Null when the id is unknown or expired; callers then create a fresh cart. */
  getCart(cartId: string): Promise<Cart | null>;
  addCartLines(cartId: string, lines: CartLineInput[]): Promise<Cart | null>;
  updateCartLines(cartId: string, lines: CartLineUpdate[]): Promise<Cart | null>;
  removeCartLines(cartId: string, lineIds: string[]): Promise<Cart | null>;
  updateCartAttributes(cartId: string, attributes: CartAttributes): Promise<Cart | null>;
  updateCartNote(cartId: string, note: string): Promise<Cart | null>;
}

export class CartUserError extends Error {
  constructor(
    message: string,
    readonly code: string | null = null,
  ) {
    super(message);
    this.name = "CartUserError";
  }
}
