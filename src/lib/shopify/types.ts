/** Response shapes for `./queries.ts`. Only the fields we select. */

export type SImage = { url: string; altText: string | null; width: number | null; height: number | null };
export type SMoney = { amount: string; currencyCode: string };
export type SMetafield = { value: string } | null;
export type SField = { key: string; value: string | null; reference: { image?: SImage } | null };
export type SMetaobject = { handle: string; fields: SField[] };

export type SVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: SMoney;
  compareAtPrice: SMoney | null;
  servings: SMetafield;
};

export type SProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  featuredImage: SImage | null;
  images: { nodes: SImage[] };
  variants: { nodes: SVariant[] };
  servings: SMetafield;
  tastePosition: SMetafield;
  tier: SMetafield;
  tasteWord: SMetafield;
  tastingNotes: SMetafield;
  bestFor: SMetafield;
  originRegion: SMetafield;
  cultivar: SMetafield;
  harvest: SMetafield;
  gradeDescription: SMetafield;
  packDateNote: SMetafield;
  netWeight: SMetafield;
  ingredients: SMetafield;
  storageNote: SMetafield;
  pending: SMetafield;
  character: ({ value: string; reference: SMetaobject | null }) | null;
};

export type SArticle = {
  handle: string;
  title: string;
  contentHtml: string;
  image: SImage | null;
  method: SMetafield;
  time: SMetafield;
  serves: SMetafield;
  troubleshooting: SMetafield;
};

export type SPolicy = { handle: string; title: string; body: string } | null;

export type SCartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: SMoney };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    price: SMoney;
    product: {
      handle: string;
      title: string;
      productType: string;
      featuredImage: SImage | null;
      tier: SMetafield;
      tasteWord: SMetafield;
      tastePosition: SMetafield;
    };
  };
};

export type SCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: SMoney };
  attributes: Array<{ key: string; value: string | null }>;
  lines: { nodes: SCartLine[] };
};

export type SUserError = { field: string[] | null; message: string };
export type SCartPayload = { cart: SCart | null; userErrors: SUserError[] };
