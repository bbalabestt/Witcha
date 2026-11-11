/**
 * Domain types. Components consume these, never raw Shopify responses.
 * Shopify sources are noted per field (docs/design-brief.md §4, build spec §3).
 */

export type Money = {
  amount: number;
  currencyCode: "AUD";
  /** True until real Shopify prices exist: never rendered (see `priceLabel`). */
  placeholder?: boolean;
};

export type Image = { url: string; alt: string; width: number; height: number };

export type GalleryItem = { image: Image; fit: "contain" | "cover" };

export type ProductKind = "tea" | "gift" | "tool";

export type TeaType = "matcha" | "hojicha";

/** Copy v5.3 facts table. A null value hides its row. */
export type Facts = {
  type: string;
  origin: string;
  cultivar: string | null;
  harvest: string | null;
  ingredients: string | null;
  netWeight: string;
  packedIn: string;
  caffeine: string;
};

export type Variant = {
  id: string;
  sku: string;
  /** Size option value, e.g. "30 g". */
  title: string;
  price: Money;
  /** Only kept when strictly higher than `price` (see `normaliseCompareAt`). */
  compareAtPrice: Money | null;
  availableForSale: boolean;
  /** Null when inventory is not tracked or the scope is missing. */
  quantityAvailable: number | null;
};

export type Product = {
  id: string;
  handle: string;
  kind: ProductKind;
  /** Customer-facing name: Academy title + descriptor, e.g. "The Professor — Yame Matcha". */
  title: string;
  academyTitle: string;
  descriptor: string;
  teaType: TeaType | null;
  detailLine: string | null;
  description: string;
  seoDescription: string | null;
  tags: string[];
  /** Featured pack shot. Null until photography exists; a line drawing stands in. */
  tin: Image | null;
  gallery: GalleryItem[];
  variants: Variant[];
  tastingNotes: string[];
  /** Card wording, e.g. "Drinking straight (usucha)". */
  bestForShort: string | null;
  /** Product page wording, e.g. "Straight (usucha). Also makes a smooth latte." */
  bestFor: string | null;
  chooseItIf: string | null;
  compare: { handle: string; line: string } | null;
  facts: Facts | null;
  storageNote: string | null;
  servingsNote: string | null;
};

export type MethodId = "whisk" | "frother" | "shaker" | "iced";

/** Metaobject `prep_method`. */
export type PrepMethod = {
  id: MethodId;
  name: string;
  grams: string;
  water: string;
  milk: string;
  time: string;
  steps: string[];
  videoUrl: string | null;
  poster: Image;
  /** One line for the home method cards. */
  summary: string;
};

/** Blog `brewing-guides` article. */
export type Guide = {
  handle: string;
  title: string;
  method: MethodId;
  time: string;
  serves: string;
  image: Image | null;
  contentHtml: string | null;
  /** Troubleshooting article that the PDP "gentle fix" link points to. */
  troubleshooting: boolean;
};

export type FaqCategory = "tea" | "making" | "orders" | "gifts";

/** Metaobject `faq_entry`. */
export type FaqEntry = { id: string; question: string; answer: string; category: FaqCategory; onProduct: boolean };

export type Policy = { handle: string; title: string; body: string };

export type SortKey = "featured" | "best" | "low" | "high" | "new";

export type CollectionPage = {
  handle: string;
  title: string;
  description: string;
  products: Product[];
  total: number;
  endCursor: string | null;
  hasNextPage: boolean;
};

export type SearchResults = { products: Product[]; guides: Guide[] };

export type CartLine = {
  id: string;
  merchandiseId: string;
  quantity: number;
  cost: Money;
  product: { handle: string; title: string; kind: ProductKind; teaType: TeaType | null; tin: Image | null };
  variant: { title: string; price: Money; availableForSale: boolean; quantityAvailable: number | null };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
  totalQuantity: number;
  subtotal: Money;
  /** Cart attributes `gift` and `gift_note`. */
  gift: boolean;
  giftNote: string;
};

/** Metaobject `site_settings`. Null until supplied: a null value hides every block that needs it. */
export type SiteSettings = {
  freeShippingThreshold: Money | null;
  standardShipping: Money | null;
  expressShipping: Money | null;
  dispatchDays: string | null;
  dispatchCity: string | null;
  deliveryDays: string | null;
  expressDays: string | null;
  returnsDays: string | null;
  refundDays: string | null;
  giftCutoff: string | null;
  supportEmail: string | null;
  replyTime: string | null;
  legalEntity: string;
  abn: string;
};
