/**
 * Storefront API documents. Raw response shapes live in `./types.ts` and mirror these selections
 * one-to-one; change both together. Metafields/metaobjects need Storefront access enabled
 * (see docs/SHOPIFY-SETUP.md).
 */

const MONEY = /* GraphQL */ `amount currencyCode`;
const IMAGE = /* GraphQL */ `url altText width height`;

export const PRODUCT_METAFIELD_IDENTIFIERS = [
  "taste_position",
  "tier",
  "tasting_notes",
  "best_for",
  "origin_region",
  "cultivar",
  "harvest",
  "grade_description",
  "pack_date_note",
  "net_weight",
  "ingredients",
  "storage_note",
  "servings",
  "card_note",
  "character",
  "prep_methods",
] as const;

const METAOBJECT_FIELDS = /* GraphQL */ `
  type
  handle
  fields {
    key
    value
    reference { ... on MediaImage { image { ${IMAGE} } } }
  }
`;

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    productType
    description
    descriptionHtml
    tags
    availableForSale
    createdAt
    updatedAt
    seo { title description }
    options { name optionValues { name } }
    priceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
    images(first: 8) { nodes { ${IMAGE} } }
    variants(first: 50) {
      nodes {
        id
        title
        sku
        availableForSale
        quantityAvailable
        selectedOptions { name value }
        price { ${MONEY} }
        compareAtPrice { ${MONEY} }
        image { ${IMAGE} }
        servings: metafield(namespace: "custom", key: "servings") { value }
      }
    }
    metafields(identifiers: [${PRODUCT_METAFIELD_IDENTIFIERS.map((k) => `{ namespace: "custom", key: "${k}" }`).join(", ")}]) {
      key
      value
      type
      reference { ... on Metaobject { ${METAOBJECT_FIELDS} } }
      references(first: 10) { nodes { ... on Metaobject { ${METAOBJECT_FIELDS} } } }
    }
  }
`;

const ARTICLE_FRAGMENT = /* GraphQL */ `
  fragment ArticleFields on Article {
    id
    handle
    title
    excerpt
    contentHtml
    publishedAt
    tags
    image { ${IMAGE} }
    seo { title description }
    blog { handle }
    method: metafield(namespace: "custom", key: "method") { value }
    time: metafield(namespace: "custom", key: "time") { value }
    serves: metafield(namespace: "custom", key: "serves") { value }
  }
`;

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    note
    attributes { key value }
    cost { subtotalAmount { ${MONEY} } totalAmount { ${MONEY} } }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { ${MONEY} } }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            quantityAvailable
            selectedOptions { name value }
            price { ${MONEY} }
            compareAtPrice { ${MONEY} }
            image { ${IMAGE} }
            product {
              handle
              title
              productType
              tags
              featuredImage { ${IMAGE} }
              taste: metafield(namespace: "custom", key: "taste_position") { value }
              tier: metafield(namespace: "custom", key: "tier") { value }
            }
          }
        }
      }
    }
  }
`;

const USER_ERRORS = /* GraphQL */ `userErrors { field message code } warnings { code message }`;

export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_HANDLES_QUERY = /* GraphQL */ `
  query ProductHandles($after: String) {
    products(first: 250, after: $after) { nodes { handle } pageInfo { hasNextPage endCursor } }
  }
`;

export const PRODUCT_RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query Recommendations($handle: String!, $intent: ProductRecommendationIntent!) {
    productRecommendations(productHandle: $handle, intent: $intent) { ...ProductFields }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCTS_BY_TYPE_QUERY = /* GraphQL */ `
  query ProductsByType($query: String!, $first: Int!) {
    products(first: $first, query: $query) { nodes { ...ProductFields } }
  }
  ${PRODUCT_FRAGMENT}
`;

export const COLLECTION_QUERY = /* GraphQL */ `
  query Collection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean!
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image { ${IMAGE} }
      seo { title description }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        nodes { ...ProductFields }
        pageInfo { hasNextPage endCursor }
        filters { id label type values { id label count input } }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const COLLECTION_HANDLES_QUERY = /* GraphQL */ `
  query CollectionHandles {
    collections(first: 100) { nodes { handle } }
  }
`;

export const SEARCH_QUERY = /* GraphQL */ `
  query Search($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: [PRODUCT, ARTICLE], prefix: LAST) {
      nodes {
        __typename
        ... on Product { ...ProductFields }
        ... on Article { ...ArticleFields }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
  ${ARTICLE_FRAGMENT}
`;

export const PREDICTIVE_SEARCH_QUERY = /* GraphQL */ `
  query PredictiveSearch($query: String!) {
    predictiveSearch(query: $query, limit: 6, types: [PRODUCT, ARTICLE, QUERY]) {
      products { ...ProductFields }
      articles { ...ArticleFields }
      queries { text }
    }
  }
  ${PRODUCT_FRAGMENT}
  ${ARTICLE_FRAGMENT}
`;

export const MENU_QUERY = /* GraphQL */ `
  query Menu($handle: String!) {
    menu(handle: $handle) {
      handle
      items { id title url items { id title url } }
    }
  }
`;

export const SITE_SETTINGS_QUERY = /* GraphQL */ `
  query SiteSettings {
    metaobject(handle: { type: "site_settings", handle: "default" }) { fields { key value } }
  }
`;

export const FAQ_QUERY = /* GraphQL */ `
  query Faq {
    metaobjects(type: "faq_entry", first: 100, sortKey: "position") { nodes { id handle fields { key value } } }
  }
`;

export const BLOG_ARTICLES_QUERY = /* GraphQL */ `
  query BlogArticles($handle: String!) {
    blog(handle: $handle) {
      articles(first: 100, sortKey: PUBLISHED_AT, reverse: true) { nodes { ...ArticleFields } }
    }
  }
  ${ARTICLE_FRAGMENT}
`;

export const ARTICLE_QUERY = /* GraphQL */ `
  query Article($blog: String!, $handle: String!) {
    blog(handle: $blog) { articleByHandle(handle: $handle) { ...ArticleFields } }
  }
  ${ARTICLE_FRAGMENT}
`;

export const PAGE_QUERY = /* GraphQL */ `
  query Page($handle: String!) {
    page(handle: $handle) { id handle title body seo { title description } }
  }
`;

export const POLICIES_QUERY = /* GraphQL */ `
  query Policies {
    shop {
      privacyPolicy { handle title body url }
      termsOfService { handle title body url }
      refundPolicy { handle title body url }
      shippingPolicy { handle title body url }
    }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  query Cart($id: ID!) { cart(id: $id) { ...CartFields } }
  ${CART_FRAGMENT}
`;

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { ...CartFields } ${USER_ERRORS} } }
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

export const CART_NOTE_UPDATE = /* GraphQL */ `
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) { cart { ...CartFields } ${USER_ERRORS} }
  }
  ${CART_FRAGMENT}
`;
