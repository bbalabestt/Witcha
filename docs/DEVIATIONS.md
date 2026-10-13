# Deviations and decisions

Order of authority: prototype V2 > `witcha-matcha-brand-ci/` > `docs/design-brief.md` > Brand Bible.
Each entry: what, why, where.

| ID | Decision | Why | Where |
| --- | --- | --- | --- |
| D-01 | Icon tint variants (`icons/ivory/*`, `icons/white/check`, `icons/error/alert`) collapsed into one set rendered inline with `currentColor`. `white/check` drew at 2 px stroke; exposed as `strokeWidth` prop. | Spec §2 asks for one `<Icon>` with colour props; `<img>` cannot inherit `currentColor`. | `src/assets/icons`, `scripts/build-icons.mjs`, `Icon.tsx` |
| D-02 | Unused project icons (`leaf`, `star`, `star-filled`, `arrow-right`) not imported. | Not used by V2; star icons would imply ratings before a reviews provider exists. | — |
| D-03 | Extension tokens added for prototype values missing from `tokens.json`: primary hover `#1F4560`, active `#183850`, error `#9C3B2E` (brief §3.4 DS GAP, ≈6.6:1 on ivory), overlay, muted line, ivory line on dark, disabled opacity, easing, durations, gutter, content max, touch target. | Rule: no hard-coded values in components. | `scripts/build-tokens.mjs` |
| D-04 | Off-scale prototype type sizes mapped to tokens: 9–13 px labels → `label` (12 px); 15–16 px → `body-small` (14) or `body` (17) by role; 26 px serif card names → `heading-3`; fluid display clamps kept only for the home hero and section display headings. | Token type scale is the brand contract; body never below 17 px except captions. | components |
| D-05 | Scroll-driven motion (hero scrub, shelf wheel, marquees, curtain, reveals) is kept from the prototype but fully disabled under `prefers-reduced-motion` and never required to reach content. | Prototype wins on behaviour; brief §6 said "no parallax", so accessibility fallback is mandatory. | M7 home |
| D-06 | Header has no Account icon; sign-in lives in the mobile menu and footer as a link to Shopify-hosted accounts. | Prototype header shows Search + Cart only; brief listed Account. | M3 header |
| D-07 | Help is three routes (`/pages/faq`, `/pages/shipping-returns`, `/pages/contact`) sharing one layout with the prototype's tab row rendered as links. | Spec §4 routes win for data/URLs; prototype visual kept. | M7 |
| D-08 | Sale state (not drawn in V2) follows the brief: struck-through compare-at price, `SALE` badge. Badge uses brand blush with deep-blue text (4.8:1). | Only source that defines it. | PriceBlock, Badge |
| D-09 | Focus ring on deep-blue surfaces uses ivory (`--brand-ivory`). | Brief §3.4 DS GAP; deep-blue ring is invisible there. | `globals.css`, footer, announcement bar |
| D-10 | Pixel cat familiar, V2/V1 switch, map and flow views not shipped. | Prototype-only; no placeholder cat imagery rule. | — |
| D-11 | Shop Pay buttons are a feature-flagged slot, not a drawn button, until the Shopify component is wired. | Spec §3: do not fake wallet buttons. | PDP, cart |
| D-12 | Fonts served from `src/assets/fonts` via `next/font/local` (not `public/`). Token font stacks reference `--wm-font-*` variables. | next/font hashes family names; avoids duplicate public copies. | `src/app/fonts.ts` |
| D-13 | Storefront GraphQL types are hand-written in `src/lib/shopify/types.ts`, mirroring the selections in `queries.ts`, instead of `graphql-codegen`. | Codegen needs schema introspection against a store; none exists yet. Spec allows "an equivalent typed approach". Switch to codegen once a store token exists. | `src/lib/shopify/` |
| D-14 | Test responses in `tests/fixtures/shopify/` are hand-built in the Storefront API response shape, not recorded from a live store. | No store or credentials yet. Re-record against the real store when it exists. | tests |
| D-15 | Fixtures carry both gift sets from the prototype (two-tin discovery set, tin + bamboo whisk), not one. | Prototype wins over the spec's "1 gift set". | `src/lib/data/fixtures/data.ts` |
| D-16 | Per-cup cost uses a variant-level `custom.servings` metafield when present, else the product's. | The prototype scales serves for 100 g; a product-level value alone would understate it. | mappers, PriceBlock |
| D-17 | Free-shipping threshold precedence: `FREE_SHIPPING_THRESHOLD_AUD` env > `site_settings` metaobject > placeholder fallback (`$[80.00]`). | Spec names both sources without an order; env is the explicit deploy-time override. | `mapSiteSettings`, `getRepository` |
| D-18 | Fixture money is flagged `placeholder` and renders bracketed (`$[48.00]`); the flag survives arithmetic, so cart totals are bracketed too. | Spec §3: fixture prices must stay visibly placeholder. | `src/lib/data/money.ts` |
| D-19 | Low-stock threshold is ≤ 5 (prototype `qty <= 5`), configurable via `site_settings.low_stock_threshold`. `quantityAvailable` of 0 on an available variant (continue selling) reads as in stock. | Prototype; avoids "Only 0 left". | `stockState` |
