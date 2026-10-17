# WITCHA MATCHA storefront

Headless storefront for WITCHA MATCHA (premium Japanese matcha, Australia first): Next.js 16 App Router, React 19,
TypeScript, CSS Modules over generated brand tokens. Shopify is the catalogue and commerce backend through the
Storefront API, and checkout is Shopify-hosted.

The design source of truth is **Prototype V4** (`design/prototype-v4.dc.html`). See `CLAUDE.md` for the standing rules
and `docs/DEVIATIONS.md` for every decision where the build differs from V4 or the brief.

## Run it

```bash
pnpm install
cp .env.example .env.local   # fixtures work with no credentials
pnpm dev                     # http://localhost:3000
```

With `COMMERCE_SOURCE=fixtures` (the default) the site runs on V4's fixture teas with bracketed placeholder prices,
an in-memory cart, and a branded reference of Shopify's checkout at `/dev/checkout`. The component sheet lives at
`/dev/components` (not in production builds).

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build (regenerates tokens and icons first) |
| `pnpm typecheck` | Route types + `tsc` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests (price, stock, cart, mappers, env, security) |
| `pnpm e2e` | Playwright: purchase path, keyboard path, mobile buy bar, axe on every route |
| `pnpm e2e --project=visual --update-snapshots` | Record screenshot baselines (opt-in) |
| `pnpm tokens` / `pnpm icons` | Regenerate `tokens.css` / the icon map |

Run `pnpm typecheck && pnpm lint && pnpm test` before every commit.

## Where things live

```
src/app/(shop)/          pages: home, collections, products, cart, guides, pages, policies, search
src/app/api/             search, newsletter, notify-me, contact, revalidate (Shopify webhooks)
src/app/dev/             component sheet, fixture checkout reference
src/components/ui/       primitives (M1)
src/components/layout/   header, menus, search, footer, newsletter, floating controls
src/components/commerce/ cart provider and drawer, product card, taste scale, gift sets
src/components/product/  gallery, buy box + sticky bar, prep tabs, shipping promise
src/components/home/     V4 home sections
src/components/motion/   reveal runtime, marquee, route curtain, pixel familiar
src/lib/data/            domain types, cached catalogue, fixtures, repository interface
src/lib/shopify/         Storefront client, queries, mappers, repository
src/lib/cart/            cart cookie and server actions
src/lib/providers/       newsletter, back-in-stock, contact, social reviews (swappable stubs)
```

## Going live

Follow `docs/SHOPIFY-SETUP.md`, set `COMMERCE_SOURCE=shopify` and the Shopify variables, then check
`docs/HANDOVER.md` for what is still pending.
