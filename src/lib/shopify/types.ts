/**
 * Raw Storefront API shapes for the selections in `./queries.ts`. Hand-written to mirror those
 * documents exactly (see DEVIATIONS D-13); only the mappers read these.
 */

export type SfMoney = { amount: string; currencyCode: string };
export type SfImage = { url: string; altText: string | null; width: number | null; height: number | null };
export type SfSeo = { title: string | null; description: string | null };
export type SfValue = { value: string } | null;

export type SfMetaobjectField = {
  key: string;
  value: string | null;
  reference?: { image?: SfImage | null } | null;
};

export type SfMetaobject = { type: string; handle: string; fields: SfMetaobjectField[] };

export type SfMetafield = {
  key: string;
  value: string;
  type: string;
  reference?: SfMetaobject | Record<string, never> | null;
  references?: { nodes: Array<SfMetaobject | Record<string, never>> } | null;
} | null;

export type SfVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: Array<{ name: string; value: string }>;
  price: SfMoney;
  compareAtPrice: SfMoney | null;
  image: SfImage | null;
  servings?: SfValue;
};

export type SfProduct = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
  seo: SfSeo;
  options: Array<{ name: string; optionValues: Array<{ name: string }> }>;
  priceRange: { minVariantPrice: SfMoney; maxVariantPrice: SfMoney };
  images: { nodes: SfImage[] };
  variants: { nodes: SfVariant[] };
  metafields: SfMetafield[];
};

export type SfPageInfo = { hasNextPage: boolean; endCursor: string | null };

export type SfFilter = {
  id: string;
  label: string;
  type: string;
  values: Array<{ id: string; label: string; count: number; input: string }>;
};

export type SfCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: SfImage | null;
  seo: SfSeo;
  products: { nodes: SfProduct[]; pageInfo: SfPageInfo; filters: SfFilter[] };
};

export type SfArticle = {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  image: SfImage | null;
  seo: SfSeo | null;
  blog: { handle: string };
  method?: SfValue;
  time?: SfValue;
  serves?: SfValue;
};

export type SfMenuItem = { id: string; title: string; url: string | null; items?: SfMenuItem[] };

export type SfCartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: SfMoney };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    selectedOptions: Array<{ name: string; value: string }>;
    price: SfMoney;
    compareAtPrice: SfMoney | null;
    image: SfImage | null;
    product: {
      handle: string;
      title: string;
      productType: string;
      tags: string[];
      featuredImage: SfImage | null;
      taste?: SfValue;
      tier?: SfValue;
    };
  };
};

export type SfCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  note: string | null;
  attributes: Array<{ key: string; value: string | null }>;
  cost: { subtotalAmount: SfMoney; totalAmount: SfMoney };
  lines: { nodes: SfCartLine[] };
};

export type SfUserError = { field: string[] | null; message: string; code: string | null };

export type SfCartPayload = { cart: SfCart | null; userErrors: SfUserError[]; warnings?: Array<{ code: string; message: string }> };

export type SfPolicy = { handle: string; title: string; body: string; url: string } | null;
