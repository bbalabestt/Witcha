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
