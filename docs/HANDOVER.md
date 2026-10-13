# Handover

State of the storefront at the end of milestones M0–M9, what is still placeholder, and what needs
a decision. Decisions already taken are in `DEVIATIONS.md`.

## What is built

| Milestone | Delivered |
| --- | --- |
| M0 | Next.js 16 scaffold, tokens pipeline (`pnpm tokens`), icons (`pnpm icons`), fonts, logo, prototype inventory |
| M1 | UI primitives and `/dev/components` (dev only) |
| M2 | Domain types, `CommerceRepository`, fixtures and Shopify implementations, mappers, env validation |
| M3 | Announcement bar, header + mega menu, mobile menu, search overlay (predictive), footer, newsletter band, floating MENU/TOP |
| M4 | Collections (taste header, sort, filters at 6+, load more), ProductCard, TasteScale, `/search` |
| M5 | PDP: gallery + lightbox, buy box, sizes via `?variant=`, stock/notify, sticky bar, prep tabs, character, reviews zero-state, FAQ, related, pair with, JSON-LD |
| M6 | Cart drawer and page, optimistic actions with rollback/retry, gift note, free-shipping meter, upsell, checkout handoff |
| M7 | Home (hero scrub, marquees, taste dial, shelf, manifesto, methods, Academy, gifts), guides, Academy, Our Story, FAQ, Shipping & Returns, Contact, policies, 404/error |
| M8 | SEO (metadata, sitemap, robots, OG image, JSON-LD), webhooks, security headers, waitlist mode, bundle secret check, e2e/axe/visual tests, CI, performance pass |
| M9 | README, SHOPIFY-SETUP, DEVIATIONS, this file |

## Placeholder content to replace

Everything below is visibly bracketed on the site today. None of it may be invented; it needs the
founders or the Brand Bible.

**Products and prices**
- All prices are `$[..]` in fixtures (48, 140, 32, 76, 70, 28, 22 are the prototype's stand-ins).
- `[Daily tea name]`, its notes `[Note]`, region, cultivar, harvest.
- `[Grade description]`, `[Pack date note]` for both teas.
- Gift set names `[Two-tin discovery set]`, `[Tin + bamboo whisk]`; accessory descriptions.
- Serves per tin (15 for 30 g, 50 for 100 g in fixtures), and the `([2] g serve)` note.
- `[opened shelf-life, to be confirmed]` (storage section and FAQ).

**Characters and world**
- `[Character name]` ×3, two-sentence stories, accessories, all character art (arch placeholders).
- Academy world intro `[Two-sentence world intro from the Brand Bible.]`.
- Home Academy copy is marked "COPY PENDING BRAND BIBLE".

**Story and business**
- Founder story `[Founder story, 60–80 words.]`, founder photos, sourcing facts (Our Story principle 2).
- ABN `[pending]`, support email, reply time `[1] business day`.

**Shipping and returns** (site settings)
- Free-shipping threshold `$[80.00]`, standard `$[9.95]`, express `$[14.95]`.
- Dispatch city `[city]`, `[x]` business days, delivery `[x–y]`, express `[x]`, returns `[30]` days,
  refund `[x]` days, gift cut-off `Order by [date] for [occasion]`.

**Imagery** (labelled `ImagePlaceholder`s, ratio-correct)
- Tin pack shots, true powder colour, hands whisking, iced latte, size/scale, gift sets, guide
  photos (3:2), 60-second prep videos, founder photos, hero tin + character art.

**Brand assets**
- Official TikTok and Pinterest marks (dashed slots in the footer); Instagram profile URL.
- Payment marks are text pills until official marks are supplied.
- Favicon (the default Next favicon is still in `src/app/favicon.ico`).

## Open decisions

| Decision | Options in the brief | Where it plugs in |
| --- | --- | --- |
| Reviews app | Judge.me, Okendo, Yotpo, Shopify Product Reviews | `ReviewsProvider` in `src/lib/providers`; UI zero-state already built |
| Newsletter | Klaviyo or Shopify Email / Customer API | `NewsletterProvider` (`NEWSLETTER_PROVIDER`) |
| Back in stock | Klaviyo back-in-stock or an app | `BackInStockProvider` |
| Contact email | Resend or similar | `ContactProvider` (`CONTACT_PROVIDER`, `CONTACT_TO_EMAIL`) |
| Shop Pay / express wallets | Shopify's Shop Pay component | `NEXT_PUBLIC_FEATURE_SHOP_PAY` slots on PDP and cart |
| Character model | Metaobject per tea (built), or a separate Academy metaobject list | `custom.character` |
| Hosting | Vercel (common for Next.js) or self-host | `pnpm build && pnpm start`; set env and webhook URL |
| Final copy | Brand Bible v3.0 | Pages in `src/app/(shop)/pages`, home in `src/app/(shop)/page.tsx` |
| Route curtain | Keep off (performance) or add behind a flag | DEVIATIONS D-50 |

In production, each stub provider answers with a `NotConfigured` error until it is replaced, so
forms show a friendly failure instead of pretending to succeed.

## Known issues and follow-ups

- **Home LCP** is 3.0 s on Lighthouse's simulated slow 4G (budget 2.5 s; Collection 2.3 s and PDP
  2.2 s meet it). The LCP element is hero copy text, waiting on the single render-blocking CSS
  chunk (about 70 KB). `experimental.inlineCss` brought it to 2.7 s but bloated HTML to 250 KB and
  slowed the PDP, so it is off. Next steps: trim home CSS, or revisit inlining once real imagery
  lands (an image LCP behaves differently).
- **Unknown product/collection handles** return the branded not-found page with `noindex`, but an
  HTTP 200 (soft 404; D-33). Unmatched paths return a real 404.
- **ProductCard** was built from the inventory description because `ProductCard.dc.html` was not
  exported (D-27). Compare it with the prototype card.
- **Shopify test responses** are hand-built in the Storefront API shape (D-14); re-record from the
  real store.
- **GraphQL types** are hand-written (D-13); switch to `graphql-codegen` once a token exists.
- **CSP** is report-only with `'unsafe-inline'` scripts (D-56); review reports before enforcing.
- **Rate limiting** on form routes is per instance (in memory); use a shared store with many
  instances.
- **Menus** have no webhook (D-58).

## How to verify

```bash
pnpm install
pnpm typecheck && pnpm lint && pnpm test   # 110 unit tests
pnpm build && pnpm check:bundle
pnpm e2e                                   # 34 e2e (purchase, keyboard, axe on 18 routes, visual)
```

Lighthouse (mobile, production build, fixtures): Home 93 / Collection 96 / PDP 97 performance;
Accessibility 100 and Best Practices 100 on all three; CLS 0–0.001.
