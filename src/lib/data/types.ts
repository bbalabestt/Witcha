/**
 * Domain types. Components consume these, never raw Shopify responses.
 * Shopify sources are noted per field (docs/design-brief.md §4, build spec §3).
 */

export type Money = {
  amount: number;
  currencyCode: "AUD";
  /** True until real Shopify prices exist: renders as `$[48.00]` so nobody mistakes it for a final price. */
  placeholder?: boolean;
};

export type Image = { url: string; alt: string; width: number; height: number };

export type GalleryItem =
  | { kind: "image"; image: Image; fit: "contain" | "cover"; label: string }
  | { kind: "placeholder"; label: string };

export type ProductKind = "tea" | "gift" | "tool";

export type BadgeKind = "NEW" | "BEST SELLER" | "LIMITED" | "SALE" | "SOLD OUT";

export type BestFor = "Latte" | "Straight" | "Iced";

/** `custom.taste_position` (1–5) + `custom.tier`; `word` is the taste role shown in the eyebrow. */
export type Taste = { position: 1 | 2 | 3 | 4 | 5; word: string; tier: string };

export type Facts = {
  origin: string;
  cultivar: string;
  harvest: string;
  grade: string;
  netWeight: string;
  packDate: string;
  ingredients: string;
};

export type Variant = {
  id: string;
  /** Size option value, e.g. "30 g". */
  title: string;
  price: Money;
  /** Only kept when strictly higher than `price` (see `normaliseCompareAt`). */
  compareAtPrice: Money | null;
  availableForSale: boolean;
  /** Null when inventory is not tracked or the scope is missing. */
  quantityAvailable: number | null;
  /** Serves per variant at 2 g (`custom.servings`); null hides the per-cup line. */
  servings: number | null;
};

/** Metaobject `character`. */
export type Character = {
  handle: string;
  name: string;
  namePending: boolean;
  /** "Keeper of the deep tea". */
  role: string;
  story: string | null;
  accessory: string | null;
  art: Image | null;
  /** Concept characters (the Dreamer) have no tea yet. */
  concept: boolean;
  productHandle: string | null;
};

export type Product = {
  id: string;
  handle: string;
  kind: ProductKind;
  title: string;
  description: string;
  tags: string[];
  badge: BadgeKind | null;
  /** Featured tin or pack shot, drawn with `contain` on a soft panel. */
  tin: Image | null;
  gallery: GalleryItem[];
  variants: Variant[];
  taste: Taste | null;
  tastingNotes: string[];
  bestFor: BestFor[];
  facts: Facts | null;
  storageNote: string | null;
  character: Character | null;
  /** Shown with a PENDING tag until the founders confirm the product. */
  pending: boolean;
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
  image: Image;
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
  product: { handle: string; title: string; kind: ProductKind; eyebrow: string; tin: Image | null };
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

/** Metaobject `site_settings`, with fallbacks in `src/lib/config/site.ts`. */
export type SiteSettings = {
  freeShippingThreshold: Money;
  standardShipping: Money;
  expressShipping: Money;
  dispatchDays: string;
  dispatchCity: string;
  deliveryDays: string;
  expressDays: string;
  returnsDays: string;
  refundDays: string;
  lowStockThreshold: number;
  giftCutoff: string;
  openedShelfLife: string;
  supportEmail: string;
  abn: string;
  replyTime: string;
};
