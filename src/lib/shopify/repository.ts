import "server-only";
import { mapArticle, mapCart, mapCollection, mapFaq, mapFilters, mapMenu, mapPage, mapPolicy, mapProduct, mapSiteSettings, filterToShopify, sortToShopify } from "./mappers";
import {
  ARTICLE_QUERY,
  BLOG_ARTICLES_QUERY,
  CART_ATTRIBUTES_UPDATE,
  CART_CREATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
  CART_NOTE_UPDATE,
  CART_QUERY,
  COLLECTION_HANDLES_QUERY,
  COLLECTION_QUERY,
  FAQ_QUERY,
  MENU_QUERY,
  PAGE_QUERY,
  POLICIES_QUERY,
  PREDICTIVE_SEARCH_QUERY,
  PRODUCT_HANDLES_QUERY,
  PRODUCT_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  PRODUCTS_BY_TYPE_QUERY,
  SEARCH_QUERY,
  SITE_SETTINGS_QUERY,
} from "./queries";
import type { ShopifyFetch } from "./client";
import type { SfArticle, SfCart, SfCartPayload, SfCollection, SfMenuItem, SfPolicy, SfProduct } from "./types";
import type { CommerceRepository } from "@/lib/data/repository";
import { CartUserError } from "@/lib/data/repository";
import type { CartAttributes, CartLineInput, CartLineUpdate, CollectionQuery, Product } from "@/lib/data/types";

const DEFAULT_PAGE_SIZE = 12;
const POLICY_KEYS = { "privacy-policy": "privacyPolicy", "terms-of-service": "termsOfService", "refund-policy": "refundPolicy", "shipping-policy": "shippingPolicy" } as const;

type CartMutationKey = "cartCreate" | "cartLinesAdd" | "cartLinesUpdate" | "cartLinesRemove" | "cartAttributesUpdate" | "cartNoteUpdate";

/** An unknown/expired cart id comes back as a userError on `cartId`; treat it as "no cart". */
function isInvalidCartError(e: { field: string[] | null; code: string | null }): boolean {
  return Boolean(e.field?.includes("cartId")) || e.code === "INVALID" || e.code === "CART_DOES_NOT_EXIST";
}

export type ShopifyRepositoryOptions = {
  fetch: ShopifyFetch;
  internalHosts: string[];
  freeShippingThresholdAud?: number;
};

export class ShopifyRepository implements CommerceRepository {
  readonly source = "shopify" as const;
  private readonly sf: ShopifyFetch;

  constructor(private readonly opts: ShopifyRepositoryOptions) {
    this.sf = opts.fetch;
  }

  async getProduct(handle: string) {
    const data = await this.sf<{ product: SfProduct | null }>({ query: PRODUCT_QUERY, variables: { handle } });
    return data.product ? mapProduct(data.product) : null;
  }

  async getProductHandles() {
    const handles: string[] = [];
    let after: string | null = null;
    do {
      const data: { products: { nodes: Array<{ handle: string }>; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await this.sf({
        query: PRODUCT_HANDLES_QUERY,
        variables: { after },
      });
      handles.push(...data.products.nodes.map((n) => n.handle));
      after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    } while (after);
    return handles;
  }

  async getRelatedProducts(handle: string, limit = 4) {
    const data = await this.sf<{ productRecommendations: SfProduct[] | null }>({
      query: PRODUCT_RECOMMENDATIONS_QUERY,
      variables: { handle, intent: "RELATED" },
    });
    return (data.productRecommendations ?? []).map(mapProduct).slice(0, limit);
  }

  async getPairings(excludeHandles: string[], limit = 2) {
    const data = await this.sf<{ products: { nodes: SfProduct[] } }>({
      query: PRODUCTS_BY_TYPE_QUERY,
      variables: { query: "product_type:Accessory OR tag:accessory", first: limit + excludeHandles.length },
    });
    return data.products.nodes
      .map(mapProduct)
      .filter((p: Product) => !excludeHandles.includes(p.handle))
      .slice(0, limit);
  }

  async getCollection(handle: string, query: CollectionQuery = {}) {
    const { sortKey, reverse } = sortToShopify(query.sort ?? "featured");
    const data = await this.sf<{ collection: SfCollection | null }>({
      query: COLLECTION_QUERY,
      variables: {
        handle,
        first: query.first ?? DEFAULT_PAGE_SIZE,
        after: query.after ?? null,
        sortKey,
        reverse,
        filters: (query.filters ?? []).map(filterToShopify),
      },
    });
    const c = data.collection;
    if (!c) return null;
    return {
      collection: mapCollection(c),
      products: { nodes: c.products.nodes.map(mapProduct), pageInfo: c.products.pageInfo, totalCount: null },
      filters: mapFilters(c.products.filters),
    };
  }

  async getCollectionHandles() {
    const data = await this.sf<{ collections: { nodes: Array<{ handle: string }> } }>({ query: COLLECTION_HANDLES_QUERY });
    return data.collections.nodes.map((n) => n.handle);
  }

  async search(query: string, { first = 24 }: { first?: number } = {}) {
    const q = query.trim();
    if (q.length < 2) return { products: [], articles: [] };
    const data = await this.sf<{ search: { nodes: Array<({ __typename: "Product" } & SfProduct) | ({ __typename: "Article" } & SfArticle)> } }>({
      query: SEARCH_QUERY,
      variables: { query: q, first },
    });
    const products: Product[] = [];
    const articles = [];
    for (const n of data.search.nodes) {
      if (n.__typename === "Product") products.push(mapProduct(n));
      else if (n.__typename === "Article") articles.push(mapArticle(n));
    }
    return { products, articles };
  }

  async predictiveSearch(query: string) {
    const q = query.trim();
    if (q.length < 2) return { products: [], articles: [], queries: [] };
    const data = await this.sf<{ predictiveSearch: { products: SfProduct[]; articles: SfArticle[]; queries: Array<{ text: string }> } | null }>({
      query: PREDICTIVE_SEARCH_QUERY,
      variables: { query: q },
    });
    const r = data.predictiveSearch;
    return {
      products: (r?.products ?? []).map(mapProduct).slice(0, 4),
      articles: (r?.articles ?? []).map(mapArticle).slice(0, 2),
      queries: (r?.queries ?? []).map((x) => x.text),
    };
  }

  async getMenu(handle: string) {
    const data = await this.sf<{ menu: { handle: string; items: SfMenuItem[] } | null }>({ query: MENU_QUERY, variables: { handle } });
    return data.menu ? mapMenu(data.menu.handle, data.menu.items, this.opts.internalHosts) : null;
  }

  async getSiteSettings() {
    const data = await this.sf<{ metaobject: { fields: Array<{ key: string; value: string | null }> } | null }>({ query: SITE_SETTINGS_QUERY });
    return mapSiteSettings(data.metaobject?.fields, this.opts.freeShippingThresholdAud);
  }

  async getFaqEntries() {
    const data = await this.sf<{ metaobjects: { nodes: Array<{ id: string; handle: string; fields: Array<{ key: string; value: string | null }> }> } }>({ query: FAQ_QUERY });
    return mapFaq(data.metaobjects.nodes);
  }

  async getArticles(blogHandle: string) {
    const data = await this.sf<{ blog: { articles: { nodes: SfArticle[] } } | null }>({ query: BLOG_ARTICLES_QUERY, variables: { handle: blogHandle } });
    return (data.blog?.articles.nodes ?? []).map(mapArticle);
  }

  async getArticle(blogHandle: string, handle: string) {
    const data = await this.sf<{ blog: { articleByHandle: SfArticle | null } | null }>({ query: ARTICLE_QUERY, variables: { blog: blogHandle, handle } });
    const a = data.blog?.articleByHandle;
    return a ? mapArticle(a) : null;
  }

  async getPage(handle: string) {
    const data = await this.sf<{ page: Parameters<typeof mapPage>[0] | null }>({ query: PAGE_QUERY, variables: { handle } });
    return data.page ? mapPage(data.page) : null;
  }

  async getPolicy(handle: string) {
    const key = POLICY_KEYS[handle as keyof typeof POLICY_KEYS];
    if (!key) return null;
    const data = await this.sf<{ shop: Record<(typeof POLICY_KEYS)[keyof typeof POLICY_KEYS], SfPolicy> }>({ query: POLICIES_QUERY });
    return mapPolicy(data.shop[key]);
  }

  /* ---------- cart ---------- */

  private async mutate(key: CartMutationKey, query: string, variables: Record<string, unknown>) {
    const data = await this.sf<Record<CartMutationKey, SfCartPayload>>({ query, variables });
    const payload = data[key];
    if (payload.userErrors.length) {
      if (key !== "cartCreate" && payload.userErrors.some(isInvalidCartError)) return null;
      const first = payload.userErrors[0];
      throw new CartUserError(first?.message ?? "The cart could not be updated.", first?.code ?? null);
    }
    if (!payload.cart) return null;
    return mapCart(payload.cart);
  }

  async createCart(lines: CartLineInput[] = []) {
    const cart = await this.mutate("cartCreate", CART_CREATE, {
      input: { lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })) },
    });
    if (!cart) throw new CartUserError("The cart could not be created.");
    return cart;
  }

  async getCart(cartId: string) {
    const data = await this.sf<{ cart: SfCart | null }>({ query: CART_QUERY, variables: { id: cartId } });
    return data.cart ? mapCart(data.cart) : null;
  }

  addCartLines(cartId: string, lines: CartLineInput[]) {
    return this.mutate("cartLinesAdd", CART_LINES_ADD, { cartId, lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })) });
  }

  updateCartLines(cartId: string, lines: CartLineUpdate[]) {
    return this.mutate("cartLinesUpdate", CART_LINES_UPDATE, { cartId, lines: lines.map((l) => ({ id: l.lineId, quantity: l.quantity })) });
  }

  removeCartLines(cartId: string, lineIds: string[]) {
    return this.mutate("cartLinesRemove", CART_LINES_REMOVE, { cartId, lineIds });
  }

  updateCartAttributes(cartId: string, attributes: CartAttributes) {
    return this.mutate("cartAttributesUpdate", CART_ATTRIBUTES_UPDATE, {
      cartId,
      attributes: [
        { key: "gift", value: attributes.gift ? "true" : "false" },
        { key: "gift_note", value: attributes.gift ? attributes.giftNote.slice(0, 150) : "" },
      ],
    });
  }

  updateCartNote(cartId: string, note: string) {
    return this.mutate("cartNoteUpdate", CART_NOTE_UPDATE, { cartId, note });
  }
}
