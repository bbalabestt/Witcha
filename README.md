# WITCHA MATCHA storefront

Headless storefront for WITCHA MATCHA: Next.js 16 (App Router, Cache Components), React 19 and
TypeScript, with Shopify (Storefront API) as the catalogue, cart and Shopify-hosted checkout.
Built from Claude Design **Prototype V2** and the brand CI in `witcha-matcha-brand-ci/`.

## Run it

Requirements: Node 22+, pnpm 11 (`corepack enable`).

```bash
pnpm install
pnpm dev            # http://localhost:3000, fixtures mode, no Shopify needed
```

### Fixtures mode (default)

`COMMERCE_SOURCE=fixtures` (or unset) serves a placeholder catalogue taken from the prototype:
two teas, two gift sets and two tools, six brewing guides, five FAQ entries. Every price is a
bracketed placeholder (`$[48.00]`), unnamed teas and characters are `[..]`, and there are no
reviews. The cart works end to end in memory; Checkout goes to
`https://checkout.fixtures.invalid/…` (a stand-in for Shopify's `checkoutUrl`).

### Shopify mode

```bash
cp .env.example .env.local
# set COMMERCE_SOURCE=shopify, SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_PRIVATE_TOKEN
pnpm dev
```

Store setup (scopes, metafields, metaobjects, collections, menus, webhooks, checkout branding)
is in [`docs/SHOPIFY-SETUP.md`](docs/SHOPIFY-SETUP.md). Environment variables are validated at
startup (`src/lib/config/env.ts`); a bad or missing value stops the server with a clear message.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build (also regenerates tokens and icons) / serve it |
| `pnpm typecheck` | Route types + `tsc --noEmit` |
| `pnpm lint` | ESLint (Next core-web-vitals + TypeScript) |
| `pnpm test` | Unit tests (Vitest + Testing Library) |
| `pnpm e2e` | Playwright against a production build on port 3100 (run `pnpm build` first) |
| `pnpm e2e:update` | Re-record screenshot baselines |
| `pnpm check:bundle` | Fails if server secrets appear in the client bundle (after `pnpm build`) |
| `pnpm tokens` / `pnpm icons` | Regenerate `src/styles/tokens.css` / `icons.generated.ts` from the brand CI |

Run `pnpm typecheck && pnpm lint && pnpm test` before every commit (see `CLAUDE.md`).

## How it fits together

```
src/app/(shop)/          pages: home, collections, products, cart, search, blogs, pages, policies
src/app/api/             revalidate (webhooks), search, newsletter, notify-me, contact
src/components/ui/       primitives (Button, Field, Dialog, Disclosure, Frame, Icon, Logo, Toast…)
src/components/commerce/ ProductCard, TasteScale, PriceBlock, StockNotice, ShippingPromise…
src/components/pdp/      Gallery, BuyBox, StickyBuyBar, NotifyMe, PDP sections
src/components/cart/     CartProvider (optimistic), CartDrawer, CartLine, meter, gift note, upsell
src/components/layout/   Header, MegaMenu, MobileMenu, SearchOverlay, Footer, NewsletterBand…
src/components/home/     Hero scrub, marquees, taste dial, Academy wheel/shelf, manifesto
src/lib/data/            domain types, CommerceRepository, fixtures, cached reads (tags)
src/lib/shopify/         Storefront client, queries, raw types, mappers, sanitiser
src/lib/cart/            cookie, server actions, optimistic reducer
src/lib/providers/       newsletter / back-in-stock / contact / reviews (dev stubs)
src/lib/config/          env schema, site settings fallback
```

- **One data interface, two implementations.** Components only see domain types
  (`src/lib/data/types.ts`). `getRepository()` picks fixtures or Shopify.
- **Caching.** Catalogue and content reads use `"use cache"` with `cacheLife` and tags
  (`products`, `product:{handle}`, `collections`, `collection:{handle}`, `menus`, `settings`,
  `content`). Shopify webhooks hit `/api/revalidate`, which verifies the HMAC and calls
  `revalidateTag(tag, "max")`. The cart is never cached.
- **Cart.** The cart id lives in an httpOnly cookie. Server actions call the Storefront Cart
  API; the client applies changes optimistically and rolls back with an inline error and Retry.
  An expired cart id silently becomes a new cart. Checkout is a plain link to `cart.checkoutUrl`
  in the same tab.
- **Rendering.** Pages prerender (Partial Prerendering); only URL- or cookie-dependent parts
  stream. The cart loads in the browser after the page renders so every page keeps a static shell.
- **Styling.** CSS Modules + custom properties generated from `tokens.json`. No Tailwind, no UI kit.

## Quality status (fixtures, production build)

- Unit: 115 tests. e2e: purchase path, V2 motion (wheel, familiar, curtain), keyboard-only checkout, drawer focus/Escape, axe on 18
  routes plus open drawer/search (zero serious/critical), screenshot tests at 1440 and 390.
- Lighthouse mobile (simulated slow 4G): Home 93 / LCP 3.0 s / CLS 0.001, Collection 96 /
  LCP 2.3 s / CLS 0, PDP 97 / LCP 2.2 s / CLS 0. Accessibility and Best Practices 100.
  SEO reads 69 locally only because `robots.txt` blocks indexing off the production domain.

Decisions and deviations from the prototype and brief: [`docs/DEVIATIONS.md`](docs/DEVIATIONS.md).
What is still placeholder or undecided: [`docs/HANDOVER.md`](docs/HANDOVER.md).
