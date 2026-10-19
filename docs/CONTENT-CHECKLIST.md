# Content checklist: what the client must supply

Every item on the site that still shows sample, placeholder or concept content. Hand this to the client and the marketing team. Branch `feat/v4-storefront`, checked 2026-10-19.

**How to read it**
- **Where it's edited**:
  - **Shopify**: edited in Shopify admin, no developer needed (products, metafields, metaobjects, blog, policies, menus, settings).
  - **Code**: text or images set in the code today. A developer must change them, or first move them into a Shopify metaobject so marketing can edit them (see §9).
- **Now**: what the site shows today. Brackets like `[x]` and `$[48.00]` are deliberate placeholders, so nobody mistakes them for real values.
- Setup details for every Shopify field are in `docs/SHOPIFY-SETUP.md`.

---

## 1. Image specifications

Upload at the **recommended** size. Shopify's CDN serves smaller versions automatically, so one large file covers phones and retina screens. Export as **JPG or WebP, sRGB**, ideally **under 500 KB**. Every image needs **alt text** (one plain sentence describing it).

| Image type | Ratio | Recommended upload | Current sample file | Used in |
| --- | --- | --- | --- | --- |
| Tin pack shot (product on plain background) | 1:1 | 1440 × 1440 | 720 × 720 WebP | Product cards, PDP gallery, cart, hero arch, quadrant |
| Character key visual (cat + tin + scene) | 1:1 | 1640 × 1640 | 820 × 820 WebP | Keeper panel, shelf, quadrant, Academy |
| Home hero backdrop | 2:1 | 2880 × 1440 (+ phone crop 1080 × 1440, 3:4) | 1800 × 900 JPG | Home hero (shown at 22% opacity behind the arch) |
| Article / guide photo | 3:2 | 1920 × 1280 | 960 × 640 JPG | Brewing guides list and article header, search |
| PDP gallery lifestyle photo | 4:5 | 1600 × 2000 | reuses article art | PDP gallery (hands whisking, iced latte, powder colour, scale shot) |
| Method photo (whisk / frother / shaker / iced) | 4:5 | 1600 × 2000 | reuses article/hero art | Home "made at home" cards, PDP prep tabs poster |
| Method video (optional) | 16:9 | 1920 × 1080 MP4, ≤ 60 s, no sound needed | none | PDP prep tabs |
| Gift set photo | 4:5 | 1600 × 2000 | Kosen tin stand-in | Home gifts panel, gift cards |
| Arch character art (Academy, 404) | 3:4 | 1200 × 1600 | key visuals cropped | Academy page, not-found page |

**Art licence:** all 15 files in `public/art` are concepts supplied with Prototype V4. Before launch the client must confirm they are commissioned and licensed (DEVIATIONS D-14). "The Dreamer" (file 05) is a concept for a fifth tea and is labelled as one.

---

## 2. Business numbers and settings (Shopify → metaobject `site_settings`)

One record feeds the announcement bar, PDP delivery promise, cart free-shipping meter and the Shipping & Returns page, so they can never contradict each other.

| Field | Now | Needed |
| --- | --- | --- |
| Free-shipping threshold | `$[80.00]` | AUD amount |
| Standard / express shipping price | `$[9.95]` / `$[14.95]` | AUD amounts |
| Dispatch city | `[city]` | e.g. Melbourne |
| Dispatch days | `[x]` | business days |
| Standard / express delivery time | `[x–y]` / `[x]` days | ranges |
| Returns window / refund time | `[30]` / `[x]` days | days |
| Gift cut-off line | "Order by [date] for [occasion]" | e.g. "Order by 18 Dec for Christmas" |
| Opened shelf life | `[opened shelf-life, to be confirmed]` | e.g. "Use within 6 weeks of opening" |
| Support email | `[support email pending]` | address |
| ABN | `[pending]` | number |
| Reply time | `[1] business day` | |
| Low-stock threshold | 5 | confirm |

---

## 3. Products (Shopify → Products)

**Current catalogue:**
- 4 teas: Yame no Mukashi, Kosen Daily Matcha, The Charmer, Organic Hojicha.
- 2 gift sets: `[Two-tin discovery set]` and `[Tin + bamboo whisk]`, both marked PENDING.
- 2 tools: Bamboo whisk, Handheld frother.
- **All prices are placeholders.**

**For every product:**

| Field | Guidance | Status |
| --- | --- | --- |
| Title | as on the tin | gift set names pending |
| Description | 60–100 words, Australian English, taste-first, no health/energy/detox claims | sample copy written from the brief; client to approve |
| Variants | sizes (e.g. 30 g / 100 g), price, compare-at price (sale), SKU, inventory | **prices placeholder** |
| `servings` | cups per tin (per variant if sizes differ) | drives "≈ $x a cup"; hidden if empty |
| `taste_position` 1–5, `taste_role`, `tier` | where it sits Bright → Deep | set in samples; confirm |
| `tasting_notes` | 2–3 words, ≤ 24 characters each | set in samples; confirm |
| `best_for` | Latte / Straight / Iced | confirm |
| Fact table: `origin_region`, `cultivar`, `harvest`, `net_weight`, `ingredients` | facts only | set in samples; **sourcing facts need confirming** |
| `grade_description`, `pack_date_note` | one line each | **`[Grade description]`, `[Pack date note]` on all teas** |
| `storage_note` | optional extra line | empty |
| `character` | link to the keeper (see §4) | linked in samples |
| `pending` | ticks the PENDING tag; untick at launch | gift sets ticked |

**Gallery per tea (6 slots, see §1 for sizes):**
1. Tin pack shot (1:1).
2. Tin + arch art (1:1).
3. Hands whisking (4:5).
4. Iced latte (4:5).
5. **True powder colour** (4:5): placeholder today.
6. **Size / scale shot**, tin in a hand (4:5): placeholder today.

Gift sets need their own photos (contents laid out, 4:5). Tools need a pack shot and an in-use photo.

**Collections** (`matcha`, `gifts`, `accessories`): title and 1–2 sentence description. Sample copy exists.

---

## 4. Characters / keepers (Shopify → metaobject `character`)

| Keeper | Tea | Name | Story | Art |
| --- | --- | --- | --- | --- |
| The Professor | Yame no Mukashi | ✓ | **missing** | concept ✓ |
| The Charmer | The Charmer | ✓ | **missing** | concept ✓ |
| Kosen keeper | Kosen Daily Matcha | **`[Name pending]`** | **missing** | concept ✓ |
| Tea-room keeper | Organic Hojicha | **`[Name pending]`** | **missing** | concept ✓ |
| The Dreamer | fifth tea (concept) | ✓ | **missing** | concept, labelled |

Per keeper:
- `taste_role`, e.g. "Keeper of the deep tea".
- `story`, 40–60 words from the Brand Bible.
- `accessory`, the one treasured object.
- `art`, the key visual (1:1).

---

## 5. Home page

| Section | Content | Now | Where edited |
| --- | --- | --- | --- |
| Announcement bar | free-shipping line + dispatch promise | placeholders from §2 | Shopify (`site_settings`) |
| **Hero** | Headline "A Little Magic / in every / Matcha Moment.", sub-line, two buttons (Shop the matcha / Meet the Academy), circular badge text | final-looking copy from the prototype; client to approve | **Code** (`src/components/home/Hero.tsx`) |
| Hero | Backdrop image (2:1) + tin in the arch (1:1) | concept art: "everyday matcha" backdrop, Professor tin | **Code** |
| Marquee 1 | "Matcha, With Taste. · Which Matcha Today? · Bright to deep · Whisked, frothed, shaken, iced" | confirmed brand lines | Code |
| Marquee 2 | origin · cultivar · harvest · 2 g a cup · 80°C · free shipping over … | built from the lead tea's facts and `site_settings` | Shopify |
| Taste quadrant | which tea sits in each corner (Bright/Deep × Pure/Latte), keeper names | mapping set; 2 names pending | Code (`src/lib/content/home.ts`) + Shopify (characters) |
| Academy shelf | one card per tea + Dreamer concept card ("A fifth tea is being tasted…") | from products | Shopify (products); concept line in Code |
| "Why it tastes good" | 1 paragraph (~45 words) + 7 underlined key words; 3 fact chips | sample copy "Every tin is tasted by Pop…"; chips from lead tea | **Code** (`home.ts`) + Shopify (facts) |
| "A little magic, made at home" | 4 method cards: name, measurements line, **photo (4:5)** | photos reuse article/hero art; Shaker and Iced share one | Shopify (`prep_method`) |
| "Every tea has a keeper" | intro paragraph (~110 words), rolling place names, character art (3:4) | **"Copy pending Brand Bible"** tag shown | **Code** (`home.ts`) |
| Gifts panel | heading, line, cut-off date, **gift photo (4:5)** | gift-set stand-in image; cut-off placeholder | Code (copy, image) + Shopify (cut-off) |
| Reviews | real reviews only | hidden until a reviews app is connected (Google/Facebook, D-15) | Provider |
| Promotion pop-up | offer, dates, featured set | **off by default**; "Promotion · [dates to confirm]" | Code + env flag `PROMO_POPUP` |

---

## 6. Brewing guides (Shopify → Blog `brewing-guides`)

Six articles exist as titles only. **The body text is empty in all six.**

| Article | Method | Image now |
| --- | --- | --- |
| How to whisk matcha | whisk | whisking concept |
| A frothed matcha latte | frother | hero concept |
| Shaken iced matcha | shaker | iced concept |
| Iced latte, poured over | iced | iced concept |
| Clumps, bitterness, dull colour: fixes | troubleshooting | whisking concept |
| Oat, almond or dairy? | frother | hero concept |

**Per article:**
- Title.
- Header photo (3:2).
- Body, 300–700 words.
- Metafields `method`, `time`, `serves`, and `troubleshooting` for the fixes article.
- An excerpt for SEO (≤ 155 characters).

"You'll need" and the step list come from the matching `prep_method` record. Each record needs:
- Grams, water ml and temperature.
- Milk ml.
- Time.
- 3–6 steps.
- Optional video (16:9) with a poster image.

---

## 7. Other pages

| Page | Needed | Now | Where edited |
| --- | --- | --- | --- |
| **Our Story** | Founder story 60–80 words; sourcing facts (farm, relationship, harvest timing); optional founder/farm photo (4:5) | "[Founder story, 60–80 words.]", "[Sourcing facts…]" with PENDING tags | **Code** (`src/app/(shop)/pages/our-story/page.tsx`) |
| **Witcha Academy** | Two-sentence world intro (Brand Bible); 4 places (conservatory, library window, garden bridge, tea room) one line each; keeper stories | "[Two-sentence world intro…]" with PENDING tag | **Code** + Shopify (characters) |
| **FAQ** | Real Q&As in 4 groups: tea, making, orders, gifts; mark which also show on product pages | 5 sample entries | Shopify (`faq_entry`) |
| **Contact** | Support email, reply time; a form provider (e.g. Resend) | placeholders; form not connected | Shopify (`site_settings`) + Developer |
| **Shipping & Returns** | Values from §2 | placeholders | Shopify (`site_settings`) |
| **Policies** (Privacy, Terms, Refund, Shipping) | Full legal text | "[Privacy policy text from Shopify admin…]" | Shopify → Settings → Policies |
| 404 page | final line + art (3:4) | concept art | Code |

---

## 8. Global, footer, SEO

| Item | Needed | Now | Where edited |
| --- | --- | --- | --- |
| Main and footer menus | final links | sample menus | Shopify → Navigation |
| Social links | Instagram handle; TikTok and Pinterest URLs **and their official logo files** from each platform's brand kit | TikTok/Pinterest marks are empty "pending" boxes | Code (`Footer.tsx`) |
| Newsletter | provider (Klaviyo or Shopify Email) + welcome email | form not connected | Developer |
| Back-in-stock alerts | provider | not connected | Developer |
| Page titles and meta descriptions | home and static pages (≤ 60 / ≤ 155 characters) | written from the brief | Code; products, collections and articles use Shopify's SEO fields |
| Social share image | 1200 × 630 | generated automatically from brand fonts | Code (optional custom image) |
| Payment badges | payment methods actually enabled | sample set | Code |

---

## 9. Making the "Code" items editable by marketing

These are fixed in code today:
- Hero copy and images.
- Manifesto text.
- Academy intro and place names.
- Gifts panel copy and image.
- Promo pop-up.
- Our Story and Academy page text.
- Social links.

`src/lib/content/home.ts` notes the intended path: a **`home_settings` metaobject** in Shopify. A developer can wire it in about half a day. Marketing could then change these themselves, without a deploy:
- Hero headline and images.
- Section copy.
- Gift image.
- The pop-up offer.

Recommended before handover to marketing.

---

## 10. Client decisions that block content

From `docs/HANDOVER.md`:
1. Colour direction (Midnight + Cream default, or the original Witcha-blue look).
2. Art licence for all concept art.
3. Promotion pop-up on or off.
4. Reviews app.
5. Newsletter, back-in-stock and contact providers.
6. Names: Kosen keeper and tea-room keeper.
7. Final prices and gift-set contents.
