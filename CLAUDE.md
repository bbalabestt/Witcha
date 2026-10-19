# WITCHA MATCHA storefront

Headless e-commerce storefront. Premium Japanese matcha, Australia first (Thailand later).
Next.js (App Router) + React + TypeScript. Shopify is the catalogue and commerce backend
(Storefront API). Checkout is Shopify-hosted.

## Source of truth, in order
1. `Witcha Matcha Prototype V4.dc.html` (Claude Design project; local copy `design/prototype-v4.dc.html`) for layout, states and behaviour. V2 (`design/prototype-v2.dc.html`) is kept for history only.
2. `witcha-matcha-brand-ci/` (tokens.json, fonts, logos): brand tokens and rules.
3. `docs/design-brief.md` (data mapping and component names).
4. Brand Bible v3.0 for copy and claim rules.
When two sources disagree, follow the higher one and log it in `docs/DEVIATIONS.md`. Never guess silently.

## Commands
- `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm e2e`
- Run `pnpm typecheck && pnpm lint && pnpm test` before every commit.

## Hard rules
- TypeScript strict. No `any` without a comment explaining why.
- Server Components by default. Add `"use client"` only for state, effects or browser APIs, and keep client islands small.
- Styling: CSS Modules + CSS custom properties generated from `tokens.json`. No hard-coded hex, px spacing or font names where a token exists. No Tailwind, no UI kit.
- Use semantic tokens (`--surface-*`, `--text-*`, `--action-*`, `--line-*`) in components; `--brand-*` only in brand blocks.
- Brand constraints (never break): no white or ivory text on Witcha blue (#A1D7D6); no gold text; headings weight 400; body 17px or larger; labels uppercase; square corners except inputs (4px) and the arch (top corners only); logo only from supplied SVGs at permitted sizes, never retyped.
- Copy: Australian English. No health, energy or detox claims. No award claim. No "Good Matcha, Better Days." (retired). Tagline "Matcha, With Taste." and brand line "Which Matcha Today?" are confirmed.
- No fabricated reviews, ratings, customer counts or press. Reviews render a real zero-state until a reviews provider is connected.
- No placeholder AI art and no stock cat imagery. Use `<ImagePlaceholder>` (labelled, ratio-correct).
- Secrets only in server env vars. Never expose the private Storefront token or webhook secret to the client.
- Accessibility: WCAG 2.1 AA, visible focus, 44px touch targets, labelled controls, focus trap in drawers/modals, `prefers-reduced-motion` respected.
- Do not copy `support.js` or any prototype runtime into production code.
- Commit small and often, conventional commits. Never push, never force-push, never touch git config.
