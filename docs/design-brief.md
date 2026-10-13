# CLAUDE DESIGN PROMPT: WITCHA MATCHA COMMERCE WEBSITE

Version 1.0 · 12 October 2026 · Prepared for Claude Design
Companion file: `02_Competitor-Sitemaps_and_Gap-Analysis.md` (evidence behind section 9)

## How to use this file

1. In Claude Design, select the design system **"WITCHA MATCHA Brand CI"** (namespace `WitchaMatcha`). Attach the logo files and, if the tool accepts it, `Witcha_Matcha_Brand_Bible_v3.0.pdf`.
2. Paste everything between `PROMPT START` and `PROMPT END` as the first message.
3. A build this large can be cut off. If so, keep the full prompt as the first message and send the three short **stage prompts** (section 13) as follow-ups, one at a time, so each pass builds one part of the site.
4. Content marked **PLACEHOLDER** is deliberate: the founders have not decided products, prices, characters or awards yet.

---

## PROMPT START

### 1. Your role and the outcome

You are the lead UI/UX designer for **WITCHA MATCHA**: premium Japanese matcha sold direct to consumers in **Australia first** (Thailand later). Design the complete **high-fidelity, frame-by-frame commerce website**, desktop (1440 px) and mobile (390 px), so a React developer can build it without reinterpreting anything.

The site is a **headless React storefront**. **Shopify is the product catalogue and commerce backend** (Storefront API for products, collections, cart and search; Shopify-hosted checkout). So every dynamic piece of content must be traceable to a Shopify field, and every component must have its states designed (default, hover, focus, loading, empty, error, sold out).

Three outcomes decide every design choice:

1. **Seamless checkout.** From "Add to cart" to "Pay" in the fewest steps, no surprises, no forced account, no layout jumps, the brand still recognisable at the handoff to Shopify checkout.
2. **Easy-to-read product detail.** A shopper arriving from Instagram or TikTok on a phone understands the tea (what it tastes like, how strong, what it costs per cup, when it ships) within about 10 seconds, before reading any story.
3. **Calm, classic, premium, with a little magic.** The working principle is **"Soft World, Structured System"**: illustration can be dreamy, but logo, type, colour, navigation, prices and product facts stay crisp and consistent. Story must never stand between a customer and "Add to cart".

### 2. Inputs: use these, do not invent substitutes

- **Design system:** WITCHA MATCHA Brand CI. Use its tokens (colour, type, spacing, radius) by name. Never hard-code a hex value that exists as a token. Where you need something the system lacks (see section 3.4), mark it **"DS GAP"** on the frame and propose a value instead of silently inventing one.
- **Logo files (use as supplied, never retype or recolour):**
  - `witcha-matcha_large_blue.svg`: header on `surface-page` (160 px wide or more)
  - `witcha-matcha_large_reversed-ivory-gold.svg`: on deep blue (footer)
  - `witcha-matcha_small_blue.svg`: 100 px wide and up, e.g. checkout header on mobile
  - `witcha-matcha_small-no-rules_blue.svg` / `_reversed-ivory.svg`: below 100 px, minimum 64 px
  - `witcha-matcha_social-avatar_deep-blue.svg`: social only, not used on the site
- **Fonts:** Libre Caslon Display (display-xl, heading-1), Libre Caslon Text (heading-2, heading-3, tagline in italic), Jost 400/500 (body, interface, labels). Self-hosted files are in the system's `fonts/`.
- **Brand Bible v3.0** chapters 9 (visual identity), 10 (product), 11 (website) for hierarchy and copy direction.

### 3. Brand rules (hard constraints)

#### 3.1 Colour and contrast
- **Signature colour is `brand-witcha-blue` (#A1D7D6).** On brand-led surfaces (hero, product sections, newsletter band) it should be roughly 40–60% of the surface. Use `surface-page` (ivory #FAF6EE) as the default page background and `surface-soft` (aqua light #D1EEEA) for quiet panels (product facts, FAQs, shipping notes).
- **Text is `text-primary` (deep blue #2A5674)** on ivory, Witcha blue and aqua light. **Never white or ivory text on Witcha blue (1.6:1).** Never gold text. `text-secondary` (blue-mid) only at 24 px and above; links on ivory are deep blue and underlined.
- **Buttons:** primary = `action-primary` (deep blue) with a white label. Secondary = 1 px `line-control` outline, deep blue label, transparent fill. Tertiary = underlined text link.
- Blush, sage and gold together stay **under 10%** of any layout. Gold is for hairlines and the reversed logo only.
- Controls and focus rings use `line-control` (deep blue, 2 px, 2 px offset). On deep-blue surfaces use an ivory ring (mark as DS GAP).

#### 3.2 Type
- Headings are **regular weight (400) always**. The elegance comes from size and spacing, never bold.
- Use the system's styles by name: `display-xl` (64/68, hero headline only; 44 px on mobile), `heading-1` (44/50; 34 px mobile), `heading-2` (30/38), `heading-3` (22/30), `body` (17/28), `body-small` (14/22), `label` (12/16, 500, 0.18em tracking, **always capitals**), `tagline` (18/26 italic serif).
- **Body copy is 17 px or larger.** `body-small` is for captions, notes and product facts only.
- Australian English everywhere (colour, flavour, favourite, cosy, organise).

#### 3.3 Shape, logo and imagery
- **Everything is square** (`radius-none`) except inputs and small chips (`radius-sm`, 4 px) and the **arch**.
- **The arch** (`radius-arch`, top two corners only, frame at least as tall as it is wide) is the signature shape. Use it for character art and key imagery. Keep it plain: one line or one solid shape, never ornate.
- **Logo:** header uses Large, deep blue, on ivory, with clear space equal to the height of the W on all four sides. Never add stars, sparkles, moons or cats; never stretch, rotate, outline, add shadows or gradients; never place it on busy imagery. The tagline **"Matcha, With Taste."** may sit near the logo (footer) in `tagline` style but is never inside the logo.
- **Illustration is pending** (a commissioned painterly artist is not yet engaged). **Never generate or fake character art and never use stock cat or witch imagery.** Leave arch frames empty using the placeholder component in 3.5.
- Photography direction (for labels on placeholders): real product, real hands, natural daylight, truthful matcha colour, blue ceramics and linen, all methods shown (whisk, frother, shaker, iced).

#### 3.4 Gaps in the design system (flag, propose, do not hide)
- No error or success colours. Propose: error text/border `#9C3B2E` (about 6.3:1 on ivory, verify), always paired with an icon and words; success uses deep blue plus a check icon. Mark "DS GAP: PROPOSED".
- No icon set. Draw one family: 24 px grid, 1.5 px stroke, square caps, deep blue. Icons needed are listed in frame A5.
- No ivory focus ring, no sale-price colour (use `text-primary` with strikethrough on the compare-at price plus a blush `SALE` badge).
- Favicon is not designed yet (the wordmark cannot work at 16 px). Show a labelled placeholder tile only.

#### 3.5 Placeholder imagery (important)
Build one reusable `ImagePlaceholder` component: `surface-soft` fill, 1 px `line-hairline` border, centred `label` text stating what belongs there and the ratio (for example `PRODUCT PHOTO · 4:5`). Variants: `rect` (any ratio) and `arch` (3:4, top corners `radius-arch`, label `CHARACTER ART · PENDING ARTIST`). No gradients, no fake photos, no AI art. Everywhere an image is missing from the design system, use this component.

**Standard image ratios (define once, reuse):** product card 4:5 · PDP gallery 4:5 · arch frame 3:4 · hero desktop 16:9 · hero mobile 4:5 · article card 3:2 · lifestyle tile 1:1 · cart line thumbnail 4:5 at 80 px wide.

#### 3.6 Voice and claims
- Tone: whimsical not childish, warm not saccharine, knowledgeable not intimidating, premium not pretentious. One pun per piece at most.
- **Confirmed lines:** tagline **"Matcha, With Taste."**; brand line **"Which Matcha Today?"** (shop page, taste scale, labels). **"Good Matcha, Better Days." is retired: do not use it.** Optional playful variant "Witch Matcha Today?" for social and Halloween only, not on the site.
- Hero headline (working draft, not approved): **"A Little Magic in Every Matcha Moment."** with sub-line "Japanese matcha, chosen for taste and brought to life by the cats of Witcha Academy."
- **Never** write health, energy, detox, weight, immunity or "superfood" claims. Never write "best in Australia", "first", "only", "award-winning" or "ceremonial-grade". The Gold Prize claim is **not approved** and must not appear anywhere.
- Use "magic, spell, academy, whisk, witch" sparingly; never let magical language imply a health effect.
- **No fabricated reviews, ratings, customer counts or press logos.** Review components are designed with real states (zero reviews, some reviews). Any sample data on a frame carries a visible `SAMPLE DATA` tag.

### 4. Tech and data context (designs must reflect this)

- **Frontend:** React. Think in components. Each component in section 7 is a React component with typed props. Name frames and layers using the component names (`ProductCard`, `CartDrawer`) so developers can map them 1:1.
- **Backend:** Shopify. Annotate every dynamic field with its Shopify source (Storefront API object or metafield) in a small `label`-style callout on the frame or in the component sheet.
- **Cart:** Shopify cart (Storefront Cart API). The cart persists across visits. "Checkout" goes to the cart's Shopify-hosted `checkoutUrl`, same tab.
- **Checkout:** Shopify-hosted. Design the handoff and show a **branded reference** of the checkout (frame group G). Do not redesign the checkout layout; show only what brand settings can control (logo, colours, button style, corner radius, fonts as the store's plan allows, favicon).
- **Accounts:** guest checkout is the default. Customer accounts are Shopify-hosted (Customer Account API); design only the entry points (frame I3).
- **Content:** blog articles for brewing guides; pages for Our Story, FAQ, Shipping & Returns, Contact; Metaobjects for Academy characters, FAQ entries and recipes.
- **Responsive:** design 1440 px desktop and 390 px mobile for every page. Tablet is described by rules (section 6), not drawn.

**Shopify data mapping to follow in annotations**

| Design element | Shopify source | Design note |
| --- | --- | --- |
| Product name | `product.title` | Max 2 lines at `heading-1` |
| Price, sale price | `variant.price`, `variant.compareAtPrice` | Sale shows struck-through compare-at price + `SALE` badge |
| Per-cup cost | computed: price ÷ servings (`custom.servings`) | Show only when both exist |
| Gallery | `product.images`, `media` | 4:5, up to 8, alt text required |
| Size selector | `product.options` + `variants` | Pills; sold-out state per variant |
| Stock state | `variant.availableForSale`, `quantityAvailable` | In stock · Low stock (≤ [5]) · Sold out · Pre-order |
| Taste role (Bright ↔ Deep) | metafield `custom.taste_position` (integer 1–5) + `custom.tier` (Reserve / Daily / Seasonal) | Drives `TasteScale` and eyebrow label |
| Tasting notes | metafield `custom.tasting_notes` (list of text, 2–3) | Rendered as chips |
| Best for | metafield `custom.best_for` (list: Latte, Straight, Iced) | Icon + word |
| Origin facts | metafields `custom.origin_region`, `cultivar`, `harvest`, `grade_description`, `pack_date_note`, `net_weight` | `FactTable` |
| Preparation | metaobject `prep_method` (method, grams, water ml, temp, milk ml, steps, video URL) | `PrepMethodTabs` |
| Storage | metafield `custom.storage_note` | |
| Character | metaobject `character` (name, taste role, 2-sentence story, art, accessory) referenced from the product | `CharacterPanel` |
| Badges | product tags `new`, `best-seller`, `limited`, `sale` | Tag-to-badge rules in the component sheet |
| Collections / filters | `collection.products`, storefront filters | Filters appear only when a collection has 6+ products |
| Menus, footer | Shopify navigation menus | Two levels maximum |
| Announcement bar, hero, banners | theme/section settings (CMS fields) | Text, image, link per block |
| Cart lines, subtotal | `cart.lines`, `cart.cost` | Same design in drawer and cart page |
| Gift note | cart attributes (`gift`, `gift_note`) | 150 characters |
| Reviews | third-party reviews app (to be chosen) | Design the zero state first |

### 5. Sitemap (design all pages marked P1)

```
WITCHA MATCHA (/)
├── Home                                   P1  /
├── Shop Matcha  "Which Matcha Today?"     P1  /collections/matcha
│   └── Product page (PDP)                 P1  /products/[handle]
├── Gifts (sets, gift note, cut-offs)      P1  /collections/gifts
├── Accessories (whisk, frother, shaker)   P2  /collections/accessories   (reuse collection template)
├── Brewing Guides  "A Little Magic, Made at Home"
│   ├── Guides index                       P1  /blogs/brewing-guides
│   └── Guide article (recipe)             P1  /blogs/brewing-guides/[handle]
├── Witcha Academy (characters, the world) P1  /pages/academy
├── Our Story (founders, how teas are chosen) P1 /pages/our-story
├── Help
│   ├── FAQ                                P1  /pages/faq
│   ├── Shipping & Returns                 P1  /pages/shipping-returns
│   └── Contact                            P1  /pages/contact
├── Policies (privacy, terms, refund)      P1  /policies/[handle]  (one template)
├── Search results                         P1  /search
├── Cart (drawer + full page)              P1  /cart
├── Checkout (Shopify-hosted, branded)     P1  reference frames only
├── Account (Shopify-hosted)               P1  entry points only
├── 404                                    P1
└── Coming soon / waitlist (optional)      P1  launch is gated, not dated
Later (P2, do not design now): Wholesale, Stockists, Subscriptions/refills, "Find Your Familiar" quiz (only when 3+ teas exist; use the Bright ↔ Deep graphic until then), Artist editions, reviews/UGC gallery, locale and currency selector.
```

**Navigation (two levels maximum)**
- Header, left to right: logo · `Shop Matcha` (dropdown: All matcha · Which Matcha Today? · Gifts & sets · Accessories [P2]) · `Gifts` · `Brewing Guides` · `Witcha Academy` · `Our Story` · utilities: Search, Account, Cart (with count).
- Mobile: logo centred or left, menu button, search, cart. The menu is a full-height drawer with the same items, search first, then links, then social.
- Footer columns: **Shop** (Shop Matcha, Gifts, Accessories) · **Learn** (Brewing Guides, Witcha Academy, Our Story) · **Help** (FAQ, Shipping & Returns, Contact, Privacy, Terms, Refunds) · **Letters from the Academy** (newsletter) · social (Instagram, TikTok, Pinterest) · payment methods · business details (ABN placeholder) · tagline "Matcha, With Taste." beside the reversed logo.

### 6. Layout system

- **Grid:** desktop 12 columns, 64 px (`space-6`) side margins, 24 px (`space-4`) gutters, content width 1312 px. Mobile 4 columns, 16 px (`space-3`) margins and gutters.
- **Vertical rhythm:** 64 px between sections on desktop (`space-6`), 40 px on mobile; hero padding 96 px (`space-7`); card padding 24 px desktop, 16 px mobile.
- **Tablet rules (describe in notes, do not draw):** at 1024 px the product grid goes 4 → 3 columns and the PDP buy box stays beside the gallery; at 768 px the grid is 2 columns, the PDP stacks, the header collapses to the mobile pattern.
- **Touch targets** 44 × 44 px minimum. **Accessibility** WCAG 2.1 AA: visible keyboard focus, logical order, alt text on every illustration, no colour-only meaning, respects reduced motion.
- **Motion** (note only): drawers slide 200 ms; no parallax; no autoplay carousels.

### 7. Component inventory (build as a Figma-style component sheet first)

For every component show variants and states side by side and list props. Use these exact names.

**Foundations**

| Component | Variants / states |
| --- | --- |
| `Logo` | Large blue, Large reversed, Small blue, Small no-rules; clear-space guide |
| `Button` | primary, secondary, tertiary-link; sizes md/lg; default, hover, focus, active, disabled, loading (spinner replaces label, width fixed), full-width |
| `IconButton` | search, account, cart (with count), menu, close, plus, minus; 44 px |
| `TextInput`, `Textarea`, `Select`, `Checkbox`, `Radio` | default, focus, filled, error (message + icon), disabled; `radius-sm` |
| `OptionPill` (variant selector) | default, selected, hover, disabled, sold out (struck, "Sold out" on focus/hover), with price delta |
| `QuantityStepper` | default, min reached, max reached (stock), disabled |
| `Badge` | NEW, BEST SELLER, LIMITED, SALE, SOLD OUT; `label` style; fills: deep blue/ivory text, blush/deep blue text, outline |
| `Chip` | tasting note chip, filter chip (selected/unselected, removable) |
| `Accordion`, `Tabs` | closed/open/focus; tabs scroll horizontally on mobile |
| `Drawer`, `Modal`, `Toast` | focus trap, close, scrim; toast variants: success, error, info |
| `Breadcrumb`, `Pagination`/`LoadMore` | default, current, loading |
| `Skeleton` | card, gallery, text block, cart line |
| `ImagePlaceholder`, `ArchFrame` | rect/arch, per section 3.5 |
| `Divider` | `line-hairline`, optional gold hairline (decorative, tall arch echo only) |

**Commerce**

| Component | Contents and states | Shopify source |
| --- | --- | --- |
| `ProductCard` | 4:5 image (hover swaps to second image), badge slot, eyebrow (`RESERVE · DEEP`), name (max 2 lines), `TasteScale` mini, 2 note chips max, price (+ compare-at), optional "Quick add" (single-variant only) / "Choose size"; states: default, hover, focus, sold out (muted + "Notify me"), sale, loading | product, variant, metafields |
| `TasteScale` | Horizontal Bright ↔ Deep track, five stops, arch-shaped marker at `taste_position`, end labels in `label` style (BRIGHT, DEEP), optional character icons at stops (hidden until art exists). Variants: mini (card), full (PDP, home, collection header). Must also read without colour (position + text "Deep, 4 of 5") | `custom.taste_position` |
| `TastingNotes` | 2–3 chips + "Best for" icons | metafields |
| `PriceBlock` | price, compare-at, per-cup line, "incl. GST" note | variant |
| `Gallery` | desktop: main + thumbnail rail; mobile: swipe with counter "2 / 6"; lightbox with zoom; video slot; states: loading, single image | media |
| `StockNotice` | In stock · Low stock "Only [3] left" · Sold out (Notify me form) · Pre-order (ships [date], clear) | availability |
| `ShippingPromise` | one block by the CTA: dispatch time, delivery estimate, free-shipping threshold, returns link. **One source of truth, no contradictions** | settings |
| `AddToCart` | primary button with live price "Add to cart · $[00.00]"; loading → "Adding…" → "Added" (2 s) then reverts; disabled when no variant; sold out → "Notify me" | cart |
| `ExpressPay` | Shop Pay button (wallet buttons that Shopify supports on the surface) beneath the primary CTA, with "or" divider | cart |
| `StickyBuyBar` | appears when the main CTA scrolls out of view: thumbnail, name, selected size, price, Add to cart; mobile bottom, desktop top under header | product |
| `FactTable` | definition list on `surface-soft`: Origin · Cultivar · Harvest · Grade · Net weight · Pack date · Ingredients | metafields |
| `PrepMethodTabs` | Whisk · Frother · Shaker · Iced latte; each: grams, water ml/temp, milk ml, 3–4 numbered steps, time, 60-second video placeholder | metaobject |
| `CharacterPanel` | `ArchFrame` art, name, taste role, two-sentence story, link to Academy | metaobject |
| `ReviewSummary`, `ReviewList` | average + distribution, filter and sort, verified badge, photo reviews, "Load more"; **zero-review state** ("No reviews yet. Be the first to share how you made it.") | reviews app |
| `CartDrawer`, `CartLine`, `CartSummary` | see frame F | cart |
| `FreeShippingMeter` | sentence + 4 px track; states: empty, in progress, reached | cart cost vs threshold |
| `GiftNote` | toggle "This is a gift", 150-char textarea, note "No prices on the packing slip" | cart attributes |
| `UpsellRail` | "Pair with" 1–2 cards (tool or second tin), compact add button | recommendations |
| `PaymentBadges` | text/logo row; Visa, Mastercard, Amex, Apple Pay, Google Pay, Shop Pay, PayPal, Afterpay | static |
| `TrustStrip` | 3–4 items with icons (dispatch, free shipping over $[amount], secure checkout, returns) | static |

**Layout and content**

`AnnouncementBar` (one message, optional rotation off by default, dismiss not needed) · `Header` (default, sticky-compact on scroll) · `MegaMenu` · `MobileMenu` · `SearchOverlay` (popular searches, predictive results with thumbnails, no results) · `Footer` · `NewsletterBand` ("Letters from the Academy": new teas, artwork reveals, restock alerts; email field + button; success/error; **no discount pop-up**) · `ConsentBanner` · `Hero` · `SectionHeader` (eyebrow + `heading-2` + optional link) · `CollectionHeader` · `FilterBar`/`FilterDrawer` · `SortSelect` · `ArticleCard` · `RecipeCard` · `FAQList` · `ContactForm` · `PolicyLayout`.

### 8. Frames: build in this order, name each frame with its ID

Each page gets **Desktop 1440** and **Mobile 390**. Under each frame add a short annotation strip listing: components used · Shopify sources · states shown · image ratios.

#### A. Foundations (one board each)
- **A1 Tokens:** colours with usage and contrast notes, type scale on the real styles, spacing, radius incl. the arch.
- **A2 Buttons and forms:** every state in 7.
- **A3 Badges, chips, notices, toasts.**
- **A4 Icons:** search, account, cart, menu, close, plus, minus, chevrons, check, truck/dispatch, lock/secure, return, leaf/origin, thermometer, scale (grams), whisk, frother, shaker, iced glass, mail, Instagram, TikTok, Pinterest, star (reviews), gift, alert, info.
- **A5 Placeholders and image ratios.**
- **A6 Commerce component sheet:** `ProductCard`, `TasteScale`, `PriceBlock`, `OptionPill`, `StockNotice`, `ShippingPromise`, `AddToCart` states.

#### B. Global
- **B1 Header desktop:** default; sticky-compact state; `Shop Matcha` dropdown open (links left, a `TasteScale` teaser with arch-framed image placeholder right).
- **B2 Header mobile + menu drawer:** closed, open.
- **B3 Search overlay:** empty (popular searches), typing (predictive: 4 products with thumbnails + 2 guides), no results (suggest "Which Matcha Today?" and Contact).
- **B4 Footer:** desktop and mobile (columns collapse to accordions), newsletter band above in Witcha blue, deep-blue footer base with reversed logo + tagline.
- **B5 Consent banner and system toasts.**

#### C. Home (follows Brand Bible 11.2; products appear early)
Sections in order, desktop and mobile:
1. **Announcement bar:** `Free shipping over $[amount] · Dispatched from [city] within [x] business days`.
2. **Hero** on `surface-brand`: `display-xl` headline, sub-line, primary CTA `SHOP THE MATCHA`, secondary `MEET THE ACADEMY`; right side one large `ArchFrame` placeholder (product + character visual, pending). Echo the Brand CI cover: Witcha-blue slab with one to three arches rising from the bottom edge. Padding 96 px.
3. **Shop:** 2–3 `ProductCard`s (tin, taste role, 2–3 notes, price, Add to cart). With only one or two teas, centre them and add a third "Coming to the Academy" ghost card (`ImagePlaceholder`, no link).
4. **Why it tastes good:** real-tea photography placeholder + `FactTable` excerpt (origin, cultivar, harvest) + "chosen by Pop" line. No award mention.
5. **Which Matcha Today?:** the full `TasteScale` with the teas placed on it, Bright ↔ Deep, one line per position. (Replaces the quiz until 3+ teas exist.)
6. **Make it at home:** three method cards (whisk, frother, shaker) + iced latte, each links to a guide.
7. **Welcome to Witcha Academy:** short intro, `ArchFrame` placeholder, link `Meet the Academy`.
8. **Gifts:** gift set card, gift-note mention, delivery cut-off message `Order by [date] for [occasion]`.
9. **Reviews / UGC:** shown only when real reviews exist. Draw it with `SAMPLE DATA` tags and also draw the "hidden" state (section absent).
10. **Letters from the Academy:** `NewsletterBand`.
11. **Footer.**

#### D. Shop Matcha (collection) and Gifts
- **D1 Desktop:** `CollectionHeader` titled **"Which Matcha Today?"** with the full `TasteScale` as the primary way to choose; product grid (4 columns, 3 at 1024); result count; `SortSelect` (Featured · Best selling · Price low to high · Price high to low · Newest). Filters (availability, price, size, tasting note) **appear only when 6+ products**: draw that version too, and the 1–3 product version (centred cards, no filter bar).
- **D2 Mobile:** 2-column grid, sticky `Filter` and `Sort` buttons, filter drawer.
- **D3 States:** loading skeleton grid, sold-out card with "Notify me", sale card, empty result ("No teas match. Clear filters"), filter drawer open, "Load more" with count ("Showing 12 of 30").
- **D4 Gifts:** same template + gift-focused header, gift-note explainer, delivery cut-off banner, set cards (two-tin discovery set, tin + tool).

#### E. Product detail page (the most important page: design with the most care)
**Layout rules for readability:** 60–70 characters per line; `body` 17/28; one idea per block; facts in a definition list, not paragraphs; the key decision information is visible without scrolling on a 390 × 844 phone.

**E1 Desktop, top to bottom**
1. Breadcrumb: Home / Shop Matcha / [Name].
2. **Gallery (columns 1–7)** left, **buy box (columns 8–12)** right and **sticky** while the page scrolls. Gallery: 4:5 main image + vertical thumbnail rail; image plan: tin pack shot · powder colour (truthful) · hands whisking · iced latte · tin with character arch art (pending) · scale/size shot.
3. **Buy box** in this order:
   - Eyebrow `RESERVE · DEEP` (tier · taste role) and badge slot
   - `heading-1` product name (max 2 lines)
   - One line: `Kept at the Academy by [Character name]` (`body-small`; hidden if no character)
   - Rating (stars + count link to reviews; **hidden when zero reviews**)
   - `PriceBlock`: price, compare-at, `≈ $[0.00] per cup ([2] g serve)`, `incl. GST`
   - `TasteScale` full + 2–3 `TastingNotes` chips + `Best for` icons (Latte · Straight · Iced)
   - `OptionPill` size selector (30 g; add a second size to stress-test)
   - `QuantityStepper` + full-width `AddToCart` (`Add to cart · $[00.00]`)
   - `ExpressPay` (Shop Pay)
   - `ShippingPromise`: dispatch time, delivery estimate, free-shipping threshold, returns in 30 words or fewer, link to full policy
   - Optional pay-in-instalments message slot (Afterpay) under the price, off by default
   - `StockNotice` directly above the button
4. **Sticky anchor sub-nav** (desktop only) under the header: The tea · Make it · Storage · Meet [Character] · Reviews · FAQ.
5. **The tea:** 2–3 sentence description (structure from Brand Bible: "[Character] keeps the [taste role] tea at the Academy. Expect [2–3 notes]. From [region], [cultivar], [harvest]. Lovely [whisked / as a latte / over ice].") beside a `FactTable` and a powder-colour photo placeholder (pair every beauty shot with a fact shot).
6. **Make it:** `PrepMethodTabs` (Whisk · Frother · Shaker · Iced latte) with a 60-second video placeholder and a kindly worded troubleshooting link (clumps, bitterness, dull colour).
7. **Storage and freshness:** three icon rows (cool, dry, closed tight) and `[opened shelf-life, to be confirmed]`.
8. **Meet [Character]:** `CharacterPanel`.
9. **Reviews:** `ReviewSummary` + `ReviewList`; draw the zero-review state and a populated state with `SAMPLE DATA`.
10. **FAQ** (4–5 `Accordion`s: Is it for lattes? How do I store it? How much per serve? When will it arrive? Can I send it as a gift?).
11. **Shipping and returns summary:** three columns on `surface-soft` (Dispatch · Delivery · Returns).
12. **Related:** `You might also like` (other teas on the scale) and `Pair with` (tools). Heading is explicit, never an unlabelled block.

**E2 Mobile:** the gallery is a swipe carousel with a counter; buy box order is eyebrow → name → price → taste scale → notes → size → quantity + Add to cart → shipping promise → express pay. Sections 5–11 become accordions; **The tea** and **Make it** are open by default. `StickyBuyBar` pins to the bottom once the main button leaves the screen.

**E3 States (draw each as its own frame):** default · size changed (price and stock update, no layout shift) · sale price · low stock · sold out (button becomes `Notify me` with email field) · pre-order · adding / added feedback (button state plus cart drawer opening) · gallery lightbox · loading skeleton · variant unavailable combination.

#### F. Cart (drawer first, then page)
- **F1 `CartDrawer` desktop** (480 px, slides from the right, scrim, focus trapped; opens automatically on add to cart): header `Your cart (2)` + close · `FreeShippingMeter` · `CartLine`s (80 px thumbnail, name, taste-role label, size, `QuantityStepper`, "Remove", line price) · `UpsellRail` "Pair with" · `GiftNote` · `CartSummary` (subtotal, "AUD, incl. GST", line "Shipping and discount codes are calculated at checkout") · primary full-width **`CHECKOUT`** · `ExpressPay` · `PaymentBadges` · text link `Keep shopping`.
- **F2 Mobile drawer:** full-width, sticky checkout footer showing subtotal + button.
- **F3 States:** empty ("Your cart is empty. Which matcha today?" + two tin cards + `Shop matcha`) · one item below the free-shipping threshold · threshold reached · line out of stock (inline message, line muted, checkout still reachable for other lines) · quantity capped by stock · updating (line skeleton) · network error with retry · gift note open.
- **F4 Cart page** desktop and mobile: same components in a two-column layout (lines left, summary right sticky), `You may also like` below, empty state.

#### G. Checkout (Shopify-hosted: branded reference only)
Add a visible banner on these frames: `SHOPIFY-HOSTED · LAYOUT NOT CUSTOM · BRAND SETTINGS ONLY`. Show how brand settings apply: ivory page background, deep-blue primary button with white label, `radius-sm` inputs, `small` blue logo in the header, order summary on `surface-soft`, Jost/Libre Caslon where the plan allows (otherwise nearest available, noted).
- **G1:** express pay row → contact (email, optional newsletter tick box **unticked**) → delivery (country, address autocomplete, suburb, state, postcode, optional phone) → shipping method (Standard / Express with cost and estimated days).
- **G2:** payment (card, Apple Pay, Google Pay, Shop Pay, PayPal, Afterpay) → `Pay now`.
- **G3 Order confirmation:** order number, summary, "What happens next" (dispatch → tracking → arrives), gift note summary, link `Make it at home` to brewing guides, optional create-account prompt.
- Mobile versions of G1 and G3 with the collapsible order summary.

**Seamless checkout principles (apply across B–G, and call out where each is met):** the cart opens in place; one primary button; guest checkout by default; express pay visible on PDP and cart; shipping and returns promise shown **before** checkout; free-shipping progress visible; no pop-ups or discount traps; cart contents survive reloads; same logo, colour and button style on both sides of the handoff; every error is plain and tells the shopper what to do next.

#### H. Content pages
- **H1 Brewing Guides index:** header ("A Little Magic, Made at Home"), method filter chips (Whisk · Frother · Shaker · Iced), `RecipeCard` grid, newsletter band.
- **H2 Guide article / recipe:** title, method + time + serves, ingredients list (grams, ml), numbered steps, video placeholder, "Tea used" `ProductCard` inline, troubleshooting box, related guides.
- **H3 Witcha Academy:** world intro (two sentences from the Brand Bible), "Meet the Class" row of `CharacterPanel` placeholders (three empty arch frames, labelled pending), settings strip (conservatory, library window, garden bridge, tea room as text tiles), link to shop.
- **H4 Our Story:** founders (photo placeholders, `[confirm detail]` tags), how teas are chosen (Pop's tasting), sourcing from Yame (placeholder facts), CTA to shop.
- **H5 FAQ:** category tabs (Tea · Making it · Orders and shipping · Gifts), `FAQList`, contact prompt.
- **H6 Shipping & Returns:** single source for the promise shown elsewhere; table of rates and times; returns steps.
- **H7 Contact:** `ContactForm` (name, email, order number optional, topic select, message), details, response-time expectation, business details block (ABN placeholder).
- **H8 Policy template:** left contents list, readable column.

#### I. Utility
- **I1 Search results:** query echo, product results then guides, filters minimal, no-results state.
- **I2 404:** one calm line, arch frame placeholder, links to Shop Matcha and Home.
- **I3 Account entry:** logged-out header dropdown (Sign in · Create account) and note that the sign-in screen is Shopify-hosted.
- **I4 Coming soon / waitlist (optional):** logo, one line, email capture for restock/launch alerts, arch frame placeholder.

### 9. Competitor-informed decisions (apply these)

Observed on withmiles.com.au, rockysmatcha.com, matchasociety.com.au, hello-matcha.com.au (details in the companion file).

| Observation in the market | What we do |
| --- | --- |
| Shipping and dispatch info is buried in an accordion or contradicts itself (Matcha Society shows "5–10 business days" in the banner and "within 2 business days" on the page) | One `ShippingPromise` block next to the button, written from a single source |
| No competitor shows taste visually; only text or hidden filters (With Miles has taste-profile filters) | `TasteScale` on every card, the PDP, home and collection header |
| Stock and price glitches on PDPs (sold-out message beside an active button; struck-through price equal to price; blank unit price) | Strict `StockNotice` and `PriceBlock` rules: button state always matches availability; compare-at appears only when higher |
| Rating placed far from the title or inconsistent with reviews | Rating beside the title, only when real reviews exist |
| Preparation info lives on separate guide pages or in a single paragraph | `PrepMethodTabs` on the PDP, one tab per method |
| Hello Matcha shows per-cup cost and delivery cost by the button (works well) but pairs it with detox and weight claims | Keep honest per-cup cost and delivery by the button; **no health claims** |
| Free-shipping progress and "Pair with" cross-sell in the drawer (Rocky's, Matcha Society); order note (Matcha Society) | Include meter, upsell and gift note |
| Stacked offers (10% pop-up, 10% newsletter, "up to 15%") feel noisy | No pop-up; one calm newsletter band; no heavy launch discounting |
| Heavy navigation (With Miles has 6 top-level items plus many sub-items) | Five top-level items, two levels maximum |
| Educational content (Matcha Society: Green Issue, Recipes, Founder Stories) builds trust | Brewing Guides, Academy and Our Story sit in the primary nav, but never ahead of products on commerce pages |
| Review summaries labelled "AI generated" and unfiltered review lists | Real reviews only, with filter and sort, verified badge, photo reviews |
| No confirmed sticky add-to-cart in any competitor | `StickyBuyBar` on mobile and desktop |
| Gifting is a small afterthought | Gift note in cart, delivery cut-off banner, Gifts page |

### 10. Placeholder content (clearly marked, replace later)

- **Product 1 (working):** *Yame no Mukashi*, tier **Reserve · Deep**, 30 g, Yame (Fukuoka), 100% Okumidori, first harvest. Tasting notes `[Nutty] [Umami] [Mellow]` pending Pop's tasting. Price `$[00.00]`.
- **Product 2 (pending founder decision):** `[Daily tea name]`, tier **Daily · Bright**. Treat as a placeholder card with the same fields.
- **Characters:** `[Character name]`, taste role from the scale, accessory `[one object]`, art pending (empty arch).
- **Numbers:** write prices as `$[48.00]`-style bracketed placeholders; layout must survive `$[1,280.00]`. Free-shipping threshold `$[amount]`. Dispatch `[x]` business days from `[city]`.
- Business details: `ABN [pending]`, support email `[pending]`.
- Reviews: zero state is the default; any populated review carries `SAMPLE DATA`.
- Pre-launch rule: do not show a launch date.

### 11. Output format

- One frame per page per breakpoint, named `ID · Page · Desktop|Mobile` (for example `E1 · PDP · Desktop`), plus component states on the component sheet.
- A short **handover note** per page: sections, components, Shopify sources, states, ratios, content length guidance (title max 2 lines; description 40–60 words; tasting note chip max 24 characters).
- A one-page **sitemap diagram** and a **user flow** diagram for: Home → Collection → PDP → Add to cart → Cart drawer → Checkout → Confirmation (with the Shopify handoff marked).
- Mark all pending items with a visible `PENDING` tag.

### 12. Self-check before you finish

- [ ] No white or ivory text on Witcha blue; no gold text; secondary text only at 24 px+
- [ ] Headings regular weight; body 17 px+; labels in capitals
- [ ] Only supplied logo files, in permitted colours and sizes, with clear space
- [ ] Arch used only with plain line or solid; no fake character art; placeholders labelled
- [ ] Every price, stock state and badge traces to a Shopify field in the annotation
- [ ] Shipping promise appears once per surface and never contradicts itself
- [ ] Zero-review and sold-out states exist; no fabricated social proof
- [ ] No health claims, no award claim, no retired tagline, no discount pop-up
- [ ] Touch targets 44 px; focus states drawn; contrast checked on new colours
- [ ] DS GAPs listed on one summary frame

## PROMPT END

---

### 13. Stage prompts (use if the full prompt is too large for one pass)

**Stage 1 · Foundations and global.** "Using the WITCHA MATCHA Brand CI design system and the brief above, build frames A1–A6 and B1–B5 now. Create the component sheet first (section 7). Mark every DS GAP. Use the `ImagePlaceholder` component for all missing imagery. Stop when these frames are complete."

**Stage 2 · Core shopping journey.** "Continuing in the same file, build frames C (Home), D (Shop Matcha and Gifts), E (PDP, all states) and F (Cart drawer and page) for desktop 1440 and mobile 390. Apply section 9. Annotate each frame with components, Shopify sources, states and image ratios. The PDP must be easy to read: the buying decision is visible above the fold on mobile, and the buy box is sticky on desktop."

**Stage 3 · Checkout reference, content and utility.** "Continuing in the same file, build frames G (branded Shopify checkout reference with the SHOPIFY-HOSTED banner), H (content pages), I (utility pages), then the sitemap diagram, the purchase flow diagram, the handover notes and the self-check list from section 12."
