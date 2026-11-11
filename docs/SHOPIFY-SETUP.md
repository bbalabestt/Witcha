# Shopify setup

Everything the storefront reads from Shopify, and the admin settings that make checkout match the site.

## 1. Storefront API access

Create a headless channel (Sales channels → Headless) and copy:

- **Private access token** → `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (server only; sent as `Shopify-Storefront-Private-Token`)
- **Public access token** → `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` (reserved for the Shop Pay component)
- Store domain → `SHOPIFY_STORE_DOMAIN` (e.g. `witcha-matcha.myshopify.com`)

Scopes: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory` (caps quantity at stock),
`unauthenticated_read_product_tags`, `unauthenticated_read_collection_listings`, `unauthenticated_read_content`
(blog, pages, policies), `unauthenticated_read_metaobjects`, `unauthenticated_write_checkouts` and
`unauthenticated_read_checkouts` (cart).

The API version is pinned in `src/lib/config/env.ts` (`SHOPIFY_API_VERSION` overrides it).

## 2. Product records

Facts, fields, status and image sizes per product are in `docs/client/CONTENT-CHECKLIST.md` §5. In short:

- **One master record per product.** The Shopify product and its metafields hold the approved facts; the site, Google and Meta feeds and the label fact sheet all draw from it, so a fact changes in one place only.
- **Title** is the full customer-facing name, Academy title + descriptor: `The Professor — Yame Matcha`. The site splits on ` — `.
- **Handle and SKU** come from the vendor list. No supplier or old character names.
- **Variants**: 30 g only.
- **SEO description** (product → Search engine listing) from copy v5.3 §9, 155 characters or fewer.
- **Supplier name**: metafield `internal.supplier_name` with **Storefront access OFF**. The site never queries it. Lot numbers and production dates stay in internal batch records.

Metafields (namespace `custom`, Storefront access ON). An empty field hides its block, so leave unconfirmed values empty.

| Key | Type | Used for |
| --- | --- | --- |
| `descriptor` | single line text | "Yame Matcha" |
| `detail_line` | single line text | Line under the H1 |
| `tasting_notes` | list of single line text (3) | Tasting words |
| `best_for_short` | single line text | Card wording |
| `best_for` | single line text | Product page wording |
| `choose_it_if` | single line text | Product page only |
| `compare_product` | product reference | Compare link target |
| `compare_line` | single line text | Compare link text |
| `type` | single line text | Facts; "Hojicha…" keeps The Librarian out of matcha groupings |
| `origin_region`, `cultivar`, `harvest`, `ingredients`, `net_weight`, `packed_in`, `caffeine` | single line text | Facts table |
| `storage_note`, `servings_note` | multi-line text | Storage and cups per tin |

Product type or tags decide the kind: `gift` → gift set, `tool`/`accessory` → tool, otherwise tea.

## 3. Metaobjects (Storefront access ON)

- **`faq_entry`**: `question`, `answer`, `category` (tea | making | orders | gifts), `on_product` (boolean). Content from copy v5.3 §6.
- **`site_settings`** (handle `default`): `free_shipping_threshold`, `standard_shipping`, `express_shipping`, `dispatch_days`, `dispatch_city`, `delivery_days`, `express_days`, `returns_days`, `refund_days`, `gift_cutoff`, `support_email`, `reply_time`, `legal_entity`, `abn`. An empty value hides every block that needs it.
- **`prep_method`**: `method` (whisk | frother | shaker | iced), `name`, `grams`, `water_ml`, `temp_c`, `milk_ml`, `time`, `steps` (JSON list), `video_url`, `poster` (file). Not used at launch: recipes live in `src/lib/content/recipes.ts`.

## 4. Collections, blog, navigation

- Collection handle `teas`, title "Japanese matcha and hojicha", **manual sort**: The Professor, The Scholar, The Rebel, The Librarian. `gifts` and `accessories` stay unpublished until scope is confirmed.
- Blog handle `brewing-guides`. Article metafields (namespace `custom`): `method`, `time`, `serves`, `troubleshooting` (boolean). Held until articles exist.
- Policies: Settings → Policies (privacy, terms, refund, shipping), naming MINIWITCH PTY LTD and the ABN.

## 5. Product feeds

Lead Google and Meta feed titles with the descriptor, because feed titles match search terms: `Yame Matcha 30 g Tin — The Professor | WITCHA MATCHA`.

## 6. Webhooks → `/api/revalidate`

Register (JSON) for `products/create|update|delete`, `inventory_levels/update`, `collections/create|update|delete`,
`metaobjects/create|update|delete`, pointing at `https://<site>/api/revalidate`. Put the webhook signing secret in
`SHOPIFY_REVALIDATION_SECRET`; requests without a valid `X-Shopify-Hmac-Sha256` get 401.

## 7. Checkout branding (Settings → Checkout → Customise)

- Logo: `witcha-matcha_small_charcoal.svg` (export PNG if the plan requires).
- Background: `#FAF6EE` (cream), including the order summary.
- Primary button: `#383832` (charcoal) with cream label. Accent/links: `#383832`.
- Corner radius: small (4 px) for inputs; buttons square where the plan allows.
- Fonts: Jost for body, Libre Caslon Text for headings if custom fonts are on the plan; otherwise the nearest available.
- Favicon: pending (the wordmark cannot work at 16 px).
- Newsletter tick box at checkout: unticked by default.

## 8. Shipping, markets, payments

- Shipping profile: Standard (free over the threshold) and Express, matching `site_settings`.
- Markets: Australia, AUD. Confirm GST registration before saying prices include GST.
- Payments: requested credit, debit, Apple Pay, Afterpay. Turn on `LIVE.paymentBadges` only for methods actually enabled.
- Customer accounts: new customer accounts; guest checkout stays the default. `/account` redirects to `https://<domain>/account`.
