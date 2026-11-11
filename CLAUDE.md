# WITCHA MATCHA storefront

Headless e-commerce storefront. Premium Japanese matcha, Australia first (Thailand later).
Next.js (App Router) + React + TypeScript. Shopify is the catalogue and commerce backend
(Storefront API). Checkout is Shopify-hosted.

## Source of truth, in order
Handoff docs live in `docs/client/` (gitignored: they name suppliers).
1. `docs/client/VENDOR-FIX-LIST.md`: what to build and remove.
2. `docs/client/WEBSITE-COPY-DRAFT.md` (copy v5.3): words, used as written. `[confirm]` blocks stay hidden.
3. `docs/client/CONTENT-CHECKLIST.md`: fields, image specs, status.
4. Brand Bible v3.0 (29 Oct 2026, not in git): strategy and claim rules.
5. The supplied home mock: layout only, where it does not contradict the above.
6. `witcha-matcha-brand-ci/`: type scale and spacing.
Layout and motion: the live Prototype V4 storefront (`origin/main`, 19 Oct 2026) keeps its structure; only its words, colours and cat art change (project lead, 11 Nov 2026). When two sources disagree, follow the higher one and log it in `docs/DEVIATIONS.md`. Never guess silently.

## Commands
- `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm e2e`
- Run `pnpm typecheck && pnpm lint && pnpm test` before every commit.

## Hard rules
- TypeScript strict. No `any` without a comment explaining why.
- Server Components by default. Add `"use client"` only for state, effects or browser APIs, and keep client islands small.
- Styling: CSS Modules + CSS custom properties generated from `tokens.json`. No hard-coded hex, px spacing or font names where a token exists. No Tailwind, no UI kit.
- Use semantic tokens (`--surface-*`, `--text-*`, `--action-*`, `--line-*`) in components; `--brand-*` only in brand blocks.
- Colour set v2 only: mint `#A1D7D6`, cream `#FAF6EE`, charcoal `#383832`, charcoal soft `#555450`, hairline `#DDD6C6`, error `#8E3328`, gold `#B39A62`, tea accents `#648612` / `#93723C`. `tests/unit/palette.test.ts` enforces it.
- Brand constraints (never break): no white or cream text on mint; gold only as thin lines on cream, never text; no large dark blocks, no dark mode; primary buttons charcoal with cream label; tea accents only as small strips and dots; headings weight 400; body 17px or larger; labels uppercase; square corners except inputs (4px) and the arch (top corners only); logo only from the SVGs in `public/logos`, never retyped.
- Copy: Australian English, as written in copy v5.3. Tagline "Matcha, With Taste." and brand line "Which Matcha Today?" are confirmed. No health, energy, sleep or caffeine-level claims; no organic, award or grade claims; no "Good Matcha, Better Days." or "Worth the Whisk."
- We choose tea; we never imply growing, roasting or blending it. The co-founder's public name is Wichita.
- Product names are Academy title + descriptor wherever a customer chooses or checks. Supplier names are never public: not on the site, in URLs, SKUs, SEO, tests or commits.
- Hold, don't fake: unconfirmed content stays off through `src/lib/config/launch.ts`. Never publish a bracket or placeholder claim. No fabricated reviews, ratings, customer counts or press.
- No placeholder AI art and no stock cat imagery. Missing pack shots are a faded, cat-free tin mock-up on cream (`TinPlaceholder`, PNGs from `scripts/build-tin-mockups.mjs`); other missing images are captionless line drawings.
- Motion sells the tea, not the cat: whisking, foam, steam, powder, pouring. The only cat is the client's own drawing peeking over the hero arch (`CatPeek`, built from `design/cat/` by `scripts/build-cat-peek.py`); no other cat art, name or story until the founders supply them. Reveals may slide and fade, but never blur. Loops that run on their own check `loopsAllowed()`. No sparkles, stars or floating dots. Looping parts carry `data-loop` so the pause control reaches them.
- Secrets only in server env vars. Never expose the private Storefront token or webhook secret to the client.
- Accessibility: WCAG 2.1 AA, visible focus, 44px touch targets, labelled controls, focus trap in drawers/modals, `prefers-reduced-motion` respected.
- Do not copy `support.js` or any prototype runtime into production code.
- Commit small and often, conventional commits. Never push, never force-push, never touch git config.
