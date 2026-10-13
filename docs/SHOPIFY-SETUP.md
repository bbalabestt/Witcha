# Shopify setup for the WITCHA MATCHA storefront

Everything the store needs before `COMMERCE_SOURCE=shopify` works. Field keys below are exactly
what the code reads (`src/lib/shopify/queries.ts`, `mappers.ts`); change both together.

## 1. Headless channel and tokens

1. Install the **Headless** sales channel (Shopify admin → Sales channels → Headless) and create a
   storefront for `witchamatcha.com.au`.
2. Copy the **private access token** into `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (server only; sent as
   `Shopify-Storefront-Private-Token`). Never put it in a `NEXT_PUBLIC_` variable.
3. The **public token** goes in `SHOPIFY_STOREFRONT_PUBLIC_TOKEN`; it is only for the Shop Pay
   component once it is enabled.
4. Set `SHOPIFY_STORE_DOMAIN` to the bare `*.myshopify.com` domain and pin `SHOPIFY_API_VERSION`
   (default in `src/lib/config/env.ts`).

### Storefront API access scopes

Enable these on the Headless storefront:

| Scope | Used for |
| --- | --- |
| `unauthenticated_read_product_listings` | Products, collections, search, recommendations |
| `unauthenticated_read_product_inventory` | `quantityAvailable` (low stock, quantity caps) |
| `unauthenticated_read_product_tags` | Badges (`new`, `best-seller`, `limited`, `sale`) |
| `unauthenticated_read_metaobjects` | Characters, prep methods, site settings, FAQ |
| `unauthenticated_read_content` | Blog articles, pages, navigation menus |
| `unauthenticated_read_checkouts`, `unauthenticated_write_checkouts` | Cart API (create, lines, attributes) |
| `unauthenticated_read_selling_plans` | Only if subscriptions are added later |

## 2. Products

- **Product type**: `Matcha` for teas, `Gift set` for sets, `Accessory` for tools (drives the
  eyebrow, card layout and "Pair with").
- **Option**: name the size option `Size` (values like `30 g`, `100 g`).
- **Images**: 4:5, up to 8, alt text on every image (the title is the fallback).
- **Inventory**: track quantity so `quantityAvailable` is meaningful. Low stock shows at ≤ 5
  (`site_settings.low_stock_threshold`). "Continue selling when out of stock" reads as in stock.
- **Compare-at price** shows struck through only when higher than the price; that also adds the
  SALE badge.
- **Tags → badges**: `new` → NEW, `best-seller` → BEST SELLER, `limited` → LIMITED, `sale` → SALE.
  Priority when several apply: SALE, NEW, LIMITED, BEST SELLER. Gift sets may also carry
  `gift-set`; tools `accessory`.

### Product metafields (namespace `custom`, **Storefront access: on**)

| Key | Type | Notes |
| --- | --- | --- |
| `taste_position` | Integer (1–5) | Bright 1 ↔ 5 Deep. Drives every TasteScale |
| `tier` | Single line text | Reserve / Daily / Seasonal |
| `tasting_notes` | List of single line text | 2–3 notes; first two show on cards |
| `best_for` | List of single line text | `Latte`, `Straight`, `Iced` |
| `origin_region` | Single line text | Fact table |
| `cultivar` | Single line text | Fact table |
| `harvest` | Single line text | Fact table |
| `grade_description` | Single line text | Fact table |
| `pack_date_note` | Single line text | Fact table |
| `net_weight` | Single line text | Fact table |
| `ingredients` | Single line text | Fact table |
| `storage_note` | Multi-line text | Shown under the storage icons |
| `servings` | Integer | Serves per tin, for "≈ $x per cup" |
| `card_note` | Single line text | Short line on gift/shelf cards |
| `character` | Metaobject reference → `character` | Keeper panel on the PDP, Academy page |
| `prep_methods` | List of metaobject references → `prep_method` | "Make it" tabs, guide recipes |

Variant metafield: `custom.servings` (Integer) overrides the product value per size (a 100 g tin
has more serves than a 30 g one).

## 3. Metaobject definitions (all with **Storefront access: on**)

**`character`**: `name` (text), `taste_role` (text), `story` (multi-line, two sentences),
`art` (file reference, image, 3:4), `accessory` (text).

**`prep_method`**: `method` (text: Whisk / Frother / Shaker / Iced latte), `grams` (integer),
`water_ml` (integer), `temp_c` (text: a number, or `cold`), `milk_ml` (integer, 0 for none),
`time` (text, e.g. `2 min`), `steps` (list of single line text, 3–4), `video_url` (URL, optional).

**`site_settings`**: one entry with handle **`default`**. Fields (all text unless noted):
`announcement` (supports `{threshold}`, `{city}`, `{days}`), `free_shipping_threshold` (number,
AUD), `standard_shipping`, `express_shipping` (AUD amounts), `dispatch_city`, `dispatch_days`,
`delivery_days`, `express_days`, `returns_days`, `refund_days`, `low_stock_threshold` (integer),
`gift_cutoff`, `reply_time`, `support_email`. Missing fields fall back to
`src/lib/config/site.ts`. `FREE_SHIPPING_THRESHOLD_AUD` in the environment overrides the
threshold.

**`faq_entry`**: `question` (text), `answer` (multi-line), `topic` (text), ordered by position.

## 4. Collections

| Handle | Title | Notes |
| --- | --- | --- |
| `matcha` | Which Matcha Today? | All teas. Header shows the taste scale |
| `gifts` | Gifts | Sets first, then single tins |
| `accessories` | Accessories | Tools |

Filters appear automatically once a collection has 6+ products. Enable them in Search & Discovery:
Availability, Size (variant option), Tasting note (`custom.tasting_notes`), Price.

## 5. Navigation menus (Online Store → Navigation)

- **`main-menu`**: Shop Matcha (children: All matcha, Which Matcha Today?, Gifts & sets,
  Accessories) · Gifts · Brewing Guides · Witcha Academy · Our Story. Two levels maximum; the
  first item with children becomes the mega menu.
- **`footer`**: three parents, Shop / Learn / Help, each with its links (Help includes Privacy,
  Terms, Refunds pointing at `/policies/...`).

Store-domain URLs are rewritten to relative paths; other domains stay external.

## 6. Content

- **Blog** `brewing-guides`. Article metafields (namespace `custom`): `method` (Whisk / Frother /
  Shaker / Iced), `time`, `serves`. The recipe block uses the first tea's matching `prep_method`.
- **Pages** (optional): academy, our-story, faq, shipping-returns, contact are typed local content
  today; move copy into Shopify pages later if wanted.
- **Policies** (Settings → Policies): privacy, terms of service, refund, shipping. Rendered at
  `/policies/{privacy-policy|terms-of-service|refund-policy|shipping-policy}`.

## 7. Webhooks → cache revalidation

Settings → Notifications → Webhooks, format JSON, URL
`https://witchamatcha.com.au/api/revalidate`, signed with the app's webhook secret
(`SHOPIFY_REVALIDATION_SECRET`):

`products/create`, `products/update`, `products/delete`, `inventory_levels/update`,
`collections/create`, `collections/update`, `collections/delete`, `metaobjects/create`,
`metaobjects/update`, `metaobjects/delete`, `shop/update`.

Menus have no webhook. They refresh daily, or immediately with an HMAC-signed
`POST /api/revalidate?tag=menus` (same signature scheme, empty body).

## 8. Checkout branding (Settings → Checkout → Customize)

Shopify owns the checkout layout; set only what branding allows:

- Logo: `witcha-matcha_small_blue.svg` (export PNG at 2× if SVG is not accepted), left aligned.
- Colours: background ivory `#FAF6EE`, text and accents deep blue `#2A5674`, primary button deep
  blue with **white** label, never white/ivory text on Witcha blue.
- Corner radius: 4 px on inputs; buttons square where the theme allows.
- Fonts: Libre Caslon (headings) and Jost (body) if the plan allows custom fonts; otherwise the
  closest serif/sans pair.
- Favicon: pending (see HANDOVER).
- Guest checkout on; customer accounts optional (new customer accounts).

## 9. Shipping, markets, payments

- Market: Australia, currency AUD, prices include GST.
- Shipping profile: Standard metro (flat rate, free over the threshold) and Express. Keep the
  amounts identical to `site_settings` so the site's promise matches checkout.
- Payments: Shopify Payments (cards, Apple Pay, Google Pay), Shop Pay, PayPal, Afterpay. Enable
  Shop Pay and Afterpay on-site messaging only after `NEXT_PUBLIC_FEATURE_SHOP_PAY` is wired to the
  official Shopify component (see DEVIATIONS D-11).

## 10. Checklist before switching to Shopify mode

- [ ] Tokens and domain in the host's environment (not in the repo)
- [ ] Metafield and metaobject definitions created with Storefront access
- [ ] `site_settings` entry `default` filled
- [ ] Collections `matcha`, `gifts`, `accessories`
- [ ] Menus `main-menu`, `footer`
- [ ] Webhooks registered, secret set, a test product update shows on the site within a minute
- [ ] `pnpm build && pnpm check:bundle` passes with the real env
- [ ] Re-record `tests/fixtures/shopify/*.json` from the real store (DEVIATIONS D-14)
