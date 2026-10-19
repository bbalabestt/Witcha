# Shopify setup

Everything the storefront reads from Shopify, and the admin settings that make checkout match the site.

## 1. Storefront API access

Create a headless channel (Sales channels → Headless) and copy:

- **Private access token** → `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (server only; sent as `Shopify-Storefront-Private-Token`)
- **Public access token** → `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` (reserved for the Shop Pay component)
- Store domain → `SHOPIFY_STORE_DOMAIN` (e.g. `witcha-matcha.myshopify.com`)

Scopes: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory` (for "Only N left"),
`unauthenticated_read_product_tags`, `unauthenticated_read_collection_listings`, `unauthenticated_read_content`
(blog, pages, policies), `unauthenticated_read_metaobjects`, `unauthenticated_write_checkouts` and
`unauthenticated_read_checkouts` (cart).

The API version is pinned in `src/lib/config/env.ts` (`SHOPIFY_API_VERSION` overrides it).

## 2. Product metafields (namespace `custom`, Storefront access ON)

| Key | Type | Used for |
| --- | --- | --- |
| `taste_position` | integer 1–5 | Taste scale marker |
| `taste_role` | single line text | Taste word (Bright, Deep…); falls back to the position |
| `tier` | single line text | Reserve, Daily, Seasonal, Roasted |
| `tasting_notes` | list of single line text (2–3, ≤ 24 chars) | Note chips |
| `best_for` | list of single line text: Latte, Straight, Iced | Best-for icons |
| `servings` | integer (product or variant) | Per-cup cost; hidden when missing |
| `origin_region`, `cultivar`, `harvest`, `grade_description`, `pack_date_note`, `net_weight`, `ingredients` | single line text | Fact table |
| `storage_note` | multi-line text | Optional storage line |
| `pending` | boolean | PENDING tag on unconfirmed products |
| `character` | metaobject reference → `character` | Keeper panel |

Product type or tags decide the kind: `gift` → gift set, `tool`/`accessory` → tool, otherwise tea.

## 3. Metaobjects (Storefront access ON)

- **`character`**: `name`, `taste_role` ("Keeper of the deep tea"), `story`, `accessory`, `art` (file), `concept` (boolean), `product_handle`
- **`prep_method`**: `method` (whisk | frother | shaker | iced), `name`, `grams`, `water_ml`, `temp_c`, `milk_ml`, `time`, `steps` (JSON list), `video_url`, `poster` (file), `summary`
- **`faq_entry`**: `question`, `answer`, `category` (tea | making | orders | gifts), `on_product` (boolean)
- **`site_settings`** (handle `default`): `free_shipping_threshold`, `standard_shipping`, `express_shipping`, `dispatch_days`, `dispatch_city`, `delivery_days`, `express_days`, `returns_days`, `refund_days`, `low_stock_threshold`, `gift_cutoff`, `opened_shelf_life`, `support_email`, `abn`, `reply_time`. Missing fields fall back to `src/lib/config/site.ts`. This one object feeds the announcement bar, PDP promise, cart meter and Shipping & Returns page, so they never contradict.

## 4. Collections, blog, navigation

- Collections with handles `matcha`, `gifts`, `accessories`. Filters appear only at 6+ products.
- Blog handle `brewing-guides`. Article metafields (namespace `custom`): `method`, `time`, `serves`, `troubleshooting` (boolean, marks the "gentle fix" article).
- Policies: Settings → Policies (privacy, terms, refund, shipping).

## 5. Tag-to-badge rules

Sold out (every variant unavailable) wins, then `sale` (only when a compare-at price is really higher), `limited`,
`best-seller`, `new`. A compare-at price that is not strictly higher is ignored.

## 6. Webhooks → `/api/revalidate`

Register (JSON) for `products/create|update|delete`, `inventory_levels/update`, `collections/create|update|delete`,
`metaobjects/create|update|delete`, pointing at `https://<site>/api/revalidate`. Put the webhook signing secret in
`SHOPIFY_REVALIDATION_SECRET`; requests without a valid `X-Shopify-Hmac-Sha256` get 401.

## 7. Checkout branding (Settings → Checkout → Customise)

- Logo: `witcha-matcha_small_blue.svg` (export PNG if the plan requires).
- Background: `#FFFDF8` (Cream surface); order summary `#FBF7EF`.
- Primary button: `#23395B` (Midnight) with white label. Accent/links: `#23395B`.
- Corner radius: small (4 px) for inputs; buttons square where the plan allows.
- Fonts: Jost for body, Libre Caslon Text for headings if custom fonts are on the plan; otherwise the nearest available.
- Favicon: pending (the wordmark cannot work at 16 px).
- Newsletter tick box at checkout: unticked by default.

## 8. Shipping, markets, payments

- Shipping profile: Standard (free over the threshold) and Express, matching `site_settings`.
- Markets: Australia, AUD, prices include GST.
- Payments: Shop Pay, Apple Pay, Google Pay, PayPal; Afterpay optional (messaging slot is off by default).
- Customer accounts: new customer accounts; guest checkout stays the default. `/account` redirects to `https://<domain>/account`.
