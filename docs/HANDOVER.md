# Handover

State on 2026-10-17: Prototype V4 implemented on fixtures, with milestones M2 to M9 complete. Unit tests pass
(Vitest), and e2e passes (Playwright, desktop and mobile), including axe checks with no serious or critical
violations on every route.

## Decisions the client still needs to make

1. **Colour**: V4 defaults ship (Midnight primary, Cream surface). Cream reduces Witcha blue below the brief's 40–60% on brand surfaces. `data-surface="teal"` restores the original look (D-13).
2. **Art licence**: confirm the V3/V4 tin and painting art is commissioned and licensed (D-14).
3. **Promotion pop-up**: built, off by default (`PROMO_POPUP`), against the original brief (D-16).
4. **Reviews**: choose a Google/Facebook reviews app; implement `SocialReviewsProvider` (D-15).
5. **Providers**: newsletter (Klaviyo or Shopify), back-in-stock, contact (Resend): `src/lib/providers`.
6. **Names and copy**: Kosen and tea-room keeper names, character stories, Brand Bible world intro and Academy copy, founder story, sourcing facts.
7. **Numbers**: prices, free-shipping threshold, dispatch city/days, delivery times, returns window, ABN, support email. These live in `site_settings`.
8. **Social**: TikTok and Pinterest official marks and links; Instagram handle.

## Not built (by choice)

- V4 tweak variants other than the defaults: dark theme, the seven other primaries, wheel/horizontal shelves, scale taste view, gallery/shelf hero styles.
- Account pages (Shopify-hosted), subscriptions, quiz, wholesale (P2).
- Waitlist page (`NEXT_PUBLIC_SITE_MODE=waitlist` is read, but no page is wired to it yet).

## Known issues

- `next dev` logs a Next.js internal error during instant-navigation validation (D-24). Production is unaffected.
- Lighthouse budgets were not measured in this environment. Run them against a deployed preview.
- Visual baselines are not committed. Record them with `pnpm e2e --project=visual --update-snapshots` on the CI image.
