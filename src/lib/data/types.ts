/**
 * Domain types. Every component consumes these, never raw Shopify responses.
 * Money is held in minor units (cents) so cart maths never drifts.
 */

export type Money = {
  /** Minor units, e.g. 4800 for $48.00. */
  amount: number;
  currencyCode: string;
  /** True when the figure is a stand-in (fixtures). Rendered bracketed: $[48.00]. */
  placeholder?: boolean;
};

export type Image = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

/** Media that exists, or a labelled stand-in for media that does not (never a fake photo). */
export type Media = ({ kind: "image" } & Image) | { kind: "placeholder"; label: string };

export type TastePosition = 1 | 2 | 3 | 4 | 5;

export const TASTE_WORDS = ["Fresh", "Bright", "Balanced", "Deep", "Rich"] as const;
export type TasteWord = (typeof TASTE_WORDS)[number];

export type TasteProfile = {
  position: TastePosition;
  word: TasteWord;
  /** Reserve / Daily / Seasonal. */
  tier: string | null;
};

export type BestFor = "Latte" | "Straight" | "Iced";

export type ProductFacts = {
  originRegion: string | null;
  cultivar: string | null;
  harvest: string | null;
  grade: string | null;
  packDateNote: string | null;
  netWeight: string | null;
  ingredients: string | null;
};

export type PrepMethodName = "Whisk" | "Frother" | "Shaker" | "Iced latte";

export type PrepMethod = {
  method: PrepMethodName;
  /** Icon file name, e.g. "whisk". */
  icon: "whisk" | "frother" | "shaker" | "iced";
  grams: string;
  water: string;
  milk: string;
  time: string;
  steps: string[];
  videoUrl: string | null;
};

export type Character = {
  name: string;
  tasteRole: string;
  story: string;
  art: Media;
  accessory: string | null;
};

export type BadgeKind = "new" | "best-seller" | "limited" | "sale";

export type ProductKind = "tea" | "gift" | "accessory";

export type SelectedOption = { name: string; value: string };

export type ProductOption = { name: string; values: string[] };

export type Variant = {
  id: string;
  title: string;
  /** Value of the Size option, or the variant title when there is no Size option. */
  size: string;
  selectedOptions: SelectedOption[];
  price: Money;
  /** Only set when strictly higher than `price` (enforced by the mappers). */
  compareAtPrice: Money | null;
  availableForSale: boolean;
  /** Null when unknown (no inventory scope, or inventory not tracked). */
  quantityAvailable: number | null;
  /** Serves in this size; falls back to the product's servings. */
  servings: number | null;
  image: Media | null;
  sku: string | null;
};

export type Seo = { title: string | null; description: string | null };

export type Product = {
  id: string;
  handle: string;
  title: string;
  kind: ProductKind;
  /** Sanitised HTML. */
  descriptionHtml: string;
  description: string;
  taste: TasteProfile | null;
  tastingNotes: string[];
  bestFor: BestFor[];
  facts: ProductFacts;
  storageNote: string | null;
  servings: number | null;
  prepMethods: PrepMethod[];
  character: Character | null;
  badges: BadgeKind[];
  tags: string[];
  media: Media[];
  options: ProductOption[];
  variants: Variant[];
  priceRange: { min: Money; max: Money };
  availableForSale: boolean;
  /** Short line under the price on cards and in the gift grid. */
  cardNote: string | null;
  seo: Seo;
  createdAt: string;
  updatedAt: string;
};

export type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export type Connection<T> = { nodes: T[]; pageInfo: PageInfo; totalCount: number | null };

export type SortKey = "featured" | "best-selling" | "price-asc" | "price-desc" | "newest";

export const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "price-asc", label: "Price low–high" },
  { value: "price-desc", label: "Price high–low" },
  { value: "newest", label: "Newest" },
];

export type ProductFilter =
  | { kind: "available" }
  | { kind: "price"; min?: number; max?: number }
  | { kind: "size"; value: string }
  | { kind: "note"; value: string };

export type FilterGroup = {
  id: string;
  label: string;
  values: Array<{ id: string; label: string; count: number; input: ProductFilter }>;
};

export type CollectionQuery = {
  sort?: SortKey;
  filters?: ProductFilter[];
  first?: number;
  after?: string | null;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: Media | null;
  seo: Seo;
};

export type CollectionPage = {
  collection: Collection;
  products: Connection<Product>;
  /** Filters offered by the store. The UI shows them only for 6+ products. */
  filters: FilterGroup[];
};

export type MenuItem = { id: string; title: string; href: string; items: MenuItem[] };
export type Menu = { handle: string; items: MenuItem[] };

export type Article = {
  id: string;
  handle: string;
  blogHandle: string;
  title: string;
  /** Prep method this guide teaches; drives the method filter chips. */
  method: "Whisk" | "Frother" | "Shaker" | "Iced";
  time: string;
  serves: string;
  excerpt: string;
  contentHtml: string;
  image: Media;
  publishedAt: string;
  tags: string[];
  seo: Seo;
};

export type ContentPage = { id: string; handle: string; title: string; bodyHtml: string; seo: Seo };

export type Policy = { handle: string; title: string; bodyHtml: string; url: string };

export type FaqEntry = { id: string; question: string; answer: string; topic: string | null };

export type SiteSettings = {
  announcement: string;
  freeShippingThreshold: Money;
  /** Flat rate below the threshold (metro Australia). */
  standardShipping: Money;
  dispatchCity: string;
  dispatchDays: string;
  deliveryDays: string;
  returnsDays: string;
  lowStockThreshold: number;
  giftCutoff: string;
  currencyCode: string;
};

export type SearchResults = {
  products: Product[];
  articles: Article[];
};

export type PredictiveResults = SearchResults & { queries: string[] };

/* ---------- Cart ---------- */

export type CartLineMerchandise = {
  variantId: string;
  productHandle: string;
  productTitle: string;
  productKind: ProductKind;
  /** e.g. "RESERVE · DEEP" or "GIFT SET". */
  eyebrow: string;
  size: string;
  image: Media | null;
  price: Money;
  compareAtPrice: Money | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
  cost: { total: Money };
};

export type CartAttributes = { gift: boolean; giftNote: string };

export type Cart = {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
  totalQuantity: number;
  cost: { subtotal: Money; total: Money };
  attributes: CartAttributes;
  note: string;
};

export type CartLineInput = { variantId: string; quantity: number };
export type CartLineUpdate = { lineId: string; quantity: number };
