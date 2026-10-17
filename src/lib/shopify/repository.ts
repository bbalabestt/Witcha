import "server-only";
import { defaultSiteSettings } from "@/lib/config/site";
import { CommerceError, GIFT_NOTE_MAX, type CollectionQuery, type CommerceRepository, type LineInput, type LineUpdate } from "@/lib/data/repository";
import { PAGE_SIZE } from "@/lib/data/sort";
import type { Cart, Guide, Policy, Product, SortKey } from "@/lib/data/types";
import type { Storefront } from "./client";
import { mapCart, mapCharacter, mapFaq, mapGuide, mapPrepMethod, mapProduct, mapSiteSettings, type MapOptions } from "./mappers";
import {
  CART_ATTRIBUTES_UPDATE,
  CART_CREATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
  CART_QUERY,
  COLLECTION_HANDLES_QUERY,
  COLLECTION_QUERY,
  GUIDES_QUERY,
  METAOBJECTS_QUERY,
  POLICIES_QUERY,
  PRODUCT_QUERY,
  PRODUCTS_QUERY,
  SEARCH_QUERY,
  SITE_SETTINGS_QUERY,
} from "./queries";
import type { SArticle, SCart, SCartPayload, SMetaobject, SPolicy, SProduct } from "./types";

const SORT: Record<SortKey, { sortKey: string; reverse: boolean }> = {
  featured: { sortKey: "COLLECTION_DEFAULT", reverse: false },
  best: { sortKey: "BEST_SELLING", reverse: false },
  low: { sortKey: "PRICE", reverse: false },
  high: { sortKey: "PRICE", reverse: true },
  new: { sortKey: "CREATED", reverse: true },
};

export class ShopifyRepository implements CommerceRepository {
  private readonly opts: MapOptions;

  constructor(
    private readonly storefront: Storefront,
    private readonly options: { freeShippingThreshold: number; placeholderPrices: boolean },
  ) {
    this.opts = { placeholderPrices: options.placeholderPrices };
  }

  async getProducts() {
    const data = await this.storefront<{ products: { nodes: SProduct[] } }>(PRODUCTS_QUERY, { first: 100 });
    return data.products.nodes.map((p) => mapProduct(p, this.opts));
  }

  async getProduct(handle: string) {
    const data = await this.storefront<{ product: SProduct | null }>(PRODUCT_QUERY, { handle });
    return data.product ? mapProduct(data.product, this.opts) : null;
  }

  async getCollection(handle: string, query: CollectionQuery = {}) {
    const sort = SORT[query.sort ?? "featured"];
    const data = await this.storefront<{
      collection: {
        handle: string;
        title: string;
        description: string;
        all: { nodes: Array<{ id: string }> };
        products: { nodes: SProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
      } | null;
    }>(COLLECTION_QUERY, {
      handle,
      first: query.first ?? PAGE_SIZE,
      after: query.after ?? null,
      sortKey: sort.sortKey,
      reverse: sort.reverse,
      filters: query.available ? [{ available: true }] : [],
    });
    const c = data.collection;
    if (!c) return null;
    return {
      handle: c.handle,
      title: c.title,
      description: c.description,
      products: c.products.nodes.map((p) => mapProduct(p, this.opts)),
      total: c.all.nodes.length,
      endCursor: c.products.pageInfo.endCursor,
      hasNextPage: c.products.pageInfo.hasNextPage,
    };
  }

  async getCollectionHandles() {
    const data = await this.storefront<{ collections: { nodes: Array<{ handle: string }> } }>(COLLECTION_HANDLES_QUERY);
    return data.collections.nodes.map((c) => c.handle);
  }

  async search(query: string) {
    type Node = ({ __typename: "Product" } & SProduct) | ({ __typename: "Article"; blog: { handle: string } } & SArticle);
    const data = await this.storefront<{ search: { nodes: Node[] } }>(SEARCH_QUERY, { query });
    const products: Product[] = [];
    const guides: Guide[] = [];
    for (const n of data.search.nodes) {
      if (n.__typename === "Product") products.push(mapProduct(n, this.opts));
      else if (n.blog.handle === "brewing-guides") {
        const g = mapGuide(n);
        if (g) guides.push(g);
      }
    }
    return { products: products.filter((p) => p.kind === "tea"), guides };
  }

  async getGuides() {
    const data = await this.storefront<{ blog: { articles: { nodes: SArticle[] } } | null }>(GUIDES_QUERY);
    return (data.blog?.articles.nodes ?? []).map(mapGuide).filter((g): g is Guide => g !== null);
  }

  async getGuide(handle: string) {
    return (await this.getGuides()).find((g) => g.handle === handle) ?? null;
  }

  private async metaobjects(type: string) {
    const data = await this.storefront<{ metaobjects: { nodes: SMetaobject[] } }>(METAOBJECTS_QUERY, { type });
    return data.metaobjects.nodes;
  }

  async getPrepMethods() {
    return (await this.metaobjects("prep_method")).map(mapPrepMethod).filter((m) => m !== null);
  }

  async getFaq() {
    return (await this.metaobjects("faq_entry")).map(mapFaq).filter((f) => f !== null);
  }

  async getCharacters() {
    return (await this.metaobjects("character")).map(mapCharacter).filter((c) => c !== null);
  }

  async getPolicies() {
    const data = await this.storefront<{ shop: Record<string, SPolicy> }>(POLICIES_QUERY);
    return Object.values(data.shop).filter((p): p is NonNullable<SPolicy> => p !== null) satisfies Policy[];
  }

  async getSiteSettings() {
    const fallback = defaultSiteSettings(this.options.freeShippingThreshold, this.options.placeholderPrices);
    const data = await this.storefront<{ metaobject: SMetaobject | null }>(SITE_SETTINGS_QUERY);
    return mapSiteSettings(data.metaobject, fallback, this.opts);
  }

  /* ---------- Cart ---------- */

  private unwrap(payload: SCartPayload): Cart {
    if (payload.userErrors.length) throw new CommerceError(payload.userErrors.map((e) => e.message).join(" "), "user");
    if (!payload.cart) throw new CommerceError("Cart not found", "not-found");
    return mapCart(payload.cart, this.opts);
  }

  async getCart(cartId: string) {
    const data = await this.storefront<{ cart: SCart | null }>(CART_QUERY, { id: cartId });
    return data.cart ? mapCart(data.cart, this.opts) : null;
  }

  async createCart(lines: LineInput[] = []) {
    const data = await this.storefront<{ cartCreate: SCartPayload }>(CART_CREATE, { lines });
    return this.unwrap(data.cartCreate);
  }

  async addLines(cartId: string, lines: LineInput[]) {
    const data = await this.storefront<{ cartLinesAdd: SCartPayload }>(CART_LINES_ADD, { cartId, lines });
    return this.unwrap(data.cartLinesAdd);
  }

  async updateLines(cartId: string, lines: LineUpdate[]) {
    const data = await this.storefront<{ cartLinesUpdate: SCartPayload }>(CART_LINES_UPDATE, { cartId, lines });
    return this.unwrap(data.cartLinesUpdate);
  }

  async removeLines(cartId: string, lineIds: string[]) {
    const data = await this.storefront<{ cartLinesRemove: SCartPayload }>(CART_LINES_REMOVE, { cartId, lineIds });
    return this.unwrap(data.cartLinesRemove);
  }

  async updateGift(cartId: string, gift: boolean, note: string) {
    const attributes = [
      { key: "gift", value: gift ? "yes" : "no" },
      { key: "gift_note", value: gift ? note.slice(0, GIFT_NOTE_MAX) : "" },
    ];
    const data = await this.storefront<{ cartAttributesUpdate: SCartPayload }>(CART_ATTRIBUTES_UPDATE, { cartId, attributes });
    return this.unwrap(data.cartAttributesUpdate);
  }
}
