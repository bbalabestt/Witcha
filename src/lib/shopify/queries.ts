/**
 * Storefront API documents. Response shapes are typed in `./types.ts`; keep both in step.
 * Metafields and metaobjects need Storefront API access enabled (docs/SHOPIFY-SETUP.md).
 */

const IMAGE = /* GraphQL */ `url altText width height`;

const METAFIELD = (alias: string, key: string, extra = "") =>
  `${alias}: metafield(namespace: "custom", key: "${key}") { value ${extra} }`;

const CHARACTER_FIELDS = /* GraphQL */ `
  handle
  fields { key value reference { ... on MediaImage { image { ${IMAGE} } } } }
`;

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    featuredImage { ${IMAGE} }
    images(first: 8) { nodes { ${IMAGE} } }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        ${METAFIELD("servings", "servings")}
      }
    }
    ${METAFIELD("servings", "servings")}
    ${METAFIELD("tastePosition", "taste_position")}
    ${METAFIELD("tier", "tier")}
    ${METAFIELD("tasteWord", "taste_role")}
    ${METAFIELD("tastingNotes", "tasting_notes")}
    ${METAFIELD("bestFor", "best_for")}
    ${METAFIELD("originRegion", "origin_region")}
    ${METAFIELD("cultivar", "cultivar")}
    ${METAFIELD("harvest", "harvest")}
    ${METAFIELD("gradeDescription", "grade_description")}
    ${METAFIELD("packDateNote", "pack_date_note")}
    ${METAFIELD("netWeight", "net_weight")}
    ${METAFIELD("ingredients", "ingredients")}
    ${METAFIELD("storageNote", "storage_note")}
    ${METAFIELD("pending", "pending")}
    ${METAFIELD("character", "character", `reference { ... on Metaobject { ${CHARACTER_FIELDS} } }`)}
  }
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!) {
    products(first: $first, sortKey: TITLE) { nodes { ...ProductFields } }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
  ${PRODUCT_FRAGMENT}
`;

export const COLLECTION_QUERY = /* GraphQL */ `
  query Collection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      handle
      title
      description
      all: products(first: 250, filters: $filters) { nodes { id } }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        nodes { ...ProductFields }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const COLLECTION_HANDLES_QUERY = /* GraphQL */ `
  query CollectionHandles {
    collections(first: 50) { nodes { handle } }
  }
`;

const ARTICLE_FIELDS = /* GraphQL */ `
  handle
  title
  contentHtml
  image { ${IMAGE} }
  ${METAFIELD("method", "method")}
  ${METAFIELD("time", "time")}
  ${METAFIELD("serves", "serves")}
  ${METAFIELD("troubleshooting", "troubleshooting")}
`;

export const SEARCH_QUERY = /* GraphQL */ `
  query Search($query: String!) {
    search(query: $query, first: 20, types: [PRODUCT, ARTICLE]) {
      nodes {
        __typename
        ... on Product { ...ProductFields }
        ... on Article { ${ARTICLE_FIELDS} blog { handle } }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GUIDES_QUERY = /* GraphQL */ `
  query Guides {
    blog(handle: "brewing-guides") { articles(first: 50) { nodes { ${ARTICLE_FIELDS} } } }
  }
`;

const METAOBJECT_FIELDS = /* GraphQL */ `
  handle
  fields { key value reference { ... on MediaImage { image { ${IMAGE} } } } }
`;

export const METAOBJECTS_QUERY = /* GraphQL */ `
  query Metaobjects($type: String!) {
    metaobjects(type: $type, first: 50) { nodes { ${METAOBJECT_FIELDS} } }
  }
`;

export const SITE_SETTINGS_QUERY = /* GraphQL */ `
  query SiteSettings {
    metaobject(handle: { type: "site_settings", handle: "default" }) { ${METAOBJECT_FIELDS} }
  }
`;

export const POLICIES_QUERY = /* GraphQL */ `
  query Policies {
    shop {
      privacyPolicy { handle title body }
      termsOfService { handle title body }
      refundPolicy { handle title body }
      shippingPolicy { handle title body }
    }
  }
`;

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    attributes { key value }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            quantityAvailable
            price { amount currencyCode }
            product {
              handle
              title
              productType
              featuredImage { ${IMAGE} }
              ${METAFIELD("tier", "tier")}
              ${METAFIELD("tasteWord", "taste_role")}
              ${METAFIELD("tastePosition", "taste_position")}
            }
          }
        }
      }
    }
  }
`;

const USER_ERRORS = `userErrors { field message }`;

export const CART_QUERY = /* GraphQL */ `
  query Cart($id: ID!) { cart(id: $id) { ...CartFields } }
  ${CART_FRAGMENT}
`;

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) { cart { ...CartFields } ${USER_ERRORS} }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } ${USER_ERRORS} }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } ${USER_ERRORS} }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } ${USER_ERRORS} }
  }
  ${CART_FRAGMENT}
`;

export const CART_ATTRIBUTES_UPDATE = /* GraphQL */ `
  mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) { cart { ...CartFields } ${USER_ERRORS} }
  }
  ${CART_FRAGMENT}
`;
