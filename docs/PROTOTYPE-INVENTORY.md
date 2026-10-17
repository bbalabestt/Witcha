# Prototype inventory: Witcha Matcha Prototype V2

> **2026-10-17: superseded by Prototype V4** (`design/prototype-v4.dc.html`, with `design/product-card-4.dc.html`).
> V4 keeps V2.1's structure and adds: the commissioned-art pass (V3), the arch shelf, the whisk-foam hero step, the
> Latte/Pure taste quadrant, Google/Facebook reviews, a promo pop-up and a theme layer (primary colour, Day/Dark,
> Teal/Cream). What shipped and why is in `docs/DEVIATIONS.md` D-13 to D-24. The V2 inventory below is kept for history.


Source: Claude Design project `eb40921f-00a6-4c14-b7eb-001afa45c546`, file `Witcha Matcha Prototype V2.dc.html`
(etag `1791848395943615`, 1323 lines). A decoded local copy lives at `design/prototype-v2.dc.html` and
`ProductCard.dc.html` is imported by it. Read in full on 2026-10-13.

## 1. Structure

- `.dc.html` is a Claude Design component document. `<x-dc>` holds a template with `{{ }}` bindings,
  `<sc-if>` / `<sc-for>` control flow, `style-hover` / `style-active` pseudo-state styles and
  `<dc-import name="ProductCard">`. A `<script type="text/x-dc">` defines `class Component extends DCLogic`
  with `data` (fixture content), `state`, event handlers and `renderVals()`.
- `support.js` (69 KB) is the prototype runtime that interprets the template. **Not shipped.**
- Three top-level views: `map` (site map), `flow` (user journey) and `site` (the storefront). Only `site`
  is implemented; `map` and `flow` are documentation (they confirm the sitemap and journey below).
- Prototype-only extras, not shipped: the pixel cat "familiar" (canvas sprite that follows scroll; labelled
  "prototype only, not commissioned character art"), the "V2 · SEE V1" link, the `P2` / `PENDING` /
  `COPY PENDING BRAND BIBLE` annotation chips (kept only where they mark real placeholder content).
- Breakpoints are fluid (`clamp()`, `auto-fit` grids). One hard switch: `narrow = viewport < 1200px`
  replaces the inline nav with a menu button. Side gutter `clamp(16px, 4.4vw, 64px)`, content max 1440 px.

## 2. Pages (site view) and sections in order

Global chrome (all pages except checkout family): announcement bar (deep blue, ivory text, truck icon,
"Free shipping over $[80.00] · Dispatched from [city] within [x] business days"; hidden once compact) ·
header (3-column grid: left nav / logo / right nav + search + cart; compact after scrollY > 120, padding
28 → 16 px, logo 200 → 160 px, 112 px small logo when narrow + compact) · mega menu (Shop Matcha) ·
search overlay · mobile menu drawer · newsletter band · footer · floating MENU / TOP arch buttons
(after scrollY > 160) · route curtain · cart drawer · PDP sticky buy bar.

| Route | Sections |
| --- | --- |
| Home `/` | 1 scroll-scrubbed hero (240vh, sticky stage on Witcha blue: arch with gold drawn outline, spinning circular badge "MATCHA, WITH TASTE · WHICH MATCHA TODAY", split headline "A Little Magic / in every / Matcha Moment.", intro + SHOP THE MATCHA / MEET THE ACADEMY, "SCROLL TO STEP INSIDE", reveal "Which matcha today?") · 2 italic marquee (deep blue) · 3 fact marquee (aqua) · 4 interactive taste dial ("How do you like it today? {word}.", draggable arch marker 1–5, swaps Daily card / Discovery set / Yame card) · 5 Academy shelf wheel (420vh scroll, 5 cards on a rotating ring; alt horizontal shelf via prop) · 6 scroll-lit manifesto words + origin chips · 7 "A little magic, made at home" 4 method cards · 8 Witcha Academy arch float-wrap copy · 9 gifts double-gold-frame panel |
| Shop `/collections/matcha` | Witcha-blue header (breadcrumb, h1 "Which Matcha Today?", intro, full TasteScale with clickable markers + labels) · toolbar (result count, "filters appear once there are 6 or more", SORT select) · product grid + "Coming to the Academy" in-preparation tile |
| Gifts `/collections/gifts` | Aqua header · deep-blue cut-off strip "Order by [date] for [occasion]…" · Sets grid · Single tins grid |
| PDP `/products/[handle]` | Breadcrumb · gallery (4:5 main, prev/next, counter, zoom, 6 thumbs) + sticky buy box (eyebrow + badge, h1, keeper line, price + per-cup, taste panel with scale/notes/best-for, size radiogroup pills, stock notice, stepper + ATC, "or", Shop Pay placeholder / notify-me, shipping promise panel) · sticky anchor nav (wide only) · The tea + FactTable + fact shot · Make it (prep tabs: facts row, steps, video placeholder) · Storage · Character panel · Reviews zero-state · FAQ accordion · shipping trio · You might also like + Pair with |
| Guides `/blogs/brewing-guides` | Witcha-blue header · method filter chips · guide cards (3:2) |
| Guide `/blogs/brewing-guides/[handle]` | Breadcrumb · h1 + meta · 16:9 video · You'll need · If it goes wrong · Method steps · Tea used card · More guides |
| Academy `/pages/academy` | Header · Meet the class (3 arch cards) · Around the grounds (4 tiles) · CTA |
| Our Story `/pages/our-story` | Copy + two staggered founder photos · 3 numbered principles · CTA |
| Help (FAQ / Shipping & Returns / Contact) | One page with tabs in the prototype; spec routes split them (see DEVIATIONS D-07) |
| Checkout / Confirmation | Shopify-hosted **reference only** (brand settings). Not built. |
| 404 | Arch, "This page wandered off.", SHOP MATCHA / HOME |

## 3. Components (variants and states)

ProductCard (badge, pending, mini TasteScale, 2 note chips, price "From …" when multi-size, CTA
"ADD TO CART" or "CHOOSE SIZE") · TasteScale (mini 16 px / panel 28 px / header 40 px / dial 84 px
interactive; filled arch marker + outline "other tea" marker; 5 ticks; text "Deep, 4 of 5") ·
Button (primary 52/48/44/40 px, secondary outline, dashed placeholder, underlined text link, loading
spinner, added check) · IconButton 44 px · OptionPill (selected 2 px border + aqua fill, sold-out dashed +
strikethrough) · QuantityStepper (132×52 PDP, 120×40 cart; disabled ends at 0.35 opacity) · Badge
(deep blue fill), Chip (note chips 4 px radius; filter chips 40 px; origin chips outline) · Accordion (FAQ,
64 px rows, plus/minus) · Tabs (underline 2 px) · Drawer (cart right 480 px, menu left 420 px), overlay
deep blue 40% · Search overlay (popular chips, results, zero-results) · StockNotice (in / low ≤ 5 /
sold out) · ShippingPromise (panel + trio) · FactTable (dl) · PrepMethodTabs · CharacterPanel ·
ReviewSummary zero-state · CartLine · FreeShippingMeter (4 px bar) · GiftNote (checkbox + 150-char
textarea + counter) · UpsellRail "Pair with" · NewsletterBand (idle / loading / error / ok) · Footer ·
Breadcrumb · ImagePlaceholder (rect, arch) · Skeleton (not in prototype; spec) · Toast (not in prototype;
spec).

## 4. Interactions, timing, easing

- Default easing `cubic-bezier(.2,.7,.2,1)`. Reveal on scroll (IntersectionObserver, threshold 0.12):
  up / left / right 820 ms with 6 px blur; drawer 220 ms; drop 820 ms; rise 1100 ms; arch-open 1400 ms;
  mask / wipe 1100 ms; draw 2200 ms (`cubic-bezier(.6,0,.2,1)`).
- Page change: fade-up 480 ms. Route curtain (arch-topped Witcha-blue sheet with logo): in 520 ms,
  hold 140 ms, out 620 ms, `cubic-bezier(.7,0,.2,1)`; skipped for cart and search.
- Add to cart: idle → ADDING… (spinner, 700 ms) → ADDED (check, 2 s) → idle; drawer opens with the line.
- Free-shipping meter width 0.5 s. Taste marker `left .6s cubic-bezier(.3,1.4,.4,1)`.
- Esc closes cart, search, menu and mega menu. Sticky buy bar appears when the main ATC row scrolls above
  60 px from the top (PDP only, available variants only).
- All motion off when `prefers-reduced-motion: reduce`.

## 5. Tokens: prototype vs `tokens.json`

All brand colours match. Values in the prototype that `tokens.json` lacks (added as extension tokens,
see DEVIATIONS D-03): `#1F4560` primary hover, `#183850` primary active, `#9C3B2E` error (DS GAP in the
brief), overlay `rgba(42,86,116,.40)`, muted dashed line `rgba(42,86,116,.55)`, ivory line on dark
`rgba(250,246,238,.5)`, disabled opacity 0.35. Off-scale type sizes used: 9, 10, 11, 13, 15, 16, 26 px
and fluid display clamps (mapped to the nearest token; D-04).

## 6. Icons

Used: account, cart, check, chevron-down/left/right/up, clock, close, cool, cup, dry, frother, gift,
iced, info, lock, mail, menu, minus, play, plus, return, scale, sealed, search, shaker, thermometer,
truck, whisk, zoom, alert (error), instagram (footer). Ivory and white copies collapse into a colour
prop. Missing: TikTok and Pinterest marks (dashed placeholders, official marks pending); payment marks
are text pills.

## 7. Placeholder vs final copy

Placeholder (keep visibly bracketed, list in HANDOVER): all prices `$[..]`, `[Daily tea name]`,
`[Character name]`, `[city]`, `[x]`/`[x–y]` business days, `[30]` days, `[date]`/`[occasion]`, `[Grade
description]`, `[Pack date note]`, `[opened shelf-life]`, gift set names, founder story, sourcing facts,
Academy world intro and long copy (`COPY PENDING BRAND BIBLE`), ABN, support email, all imagery
(labelled placeholders). Final-looking copy: tagline, brand line, nav labels, section headings, prep
steps, FAQ questions and most answers, storage notes, stock messages, cart and newsletter microcopy.

## 8. Conflicts with `docs/design-brief.md`

See `docs/DEVIATIONS.md` D-05 to D-09 (scroll-driven motion vs "no parallax", no header Account icon,
Help as tabs, sale state absent from prototype, focus ring on deep blue).
