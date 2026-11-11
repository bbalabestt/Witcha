# Handover

State on 2026-10-31: storefront rebuilt from the client handoff of 29 Oct 2026, on fixtures. No Shopify store is connected yet, so Shopify mapping is proved against recorded responses only.

## Flip a flag when the input arrives

Everything held lives in `src/lib/config/launch.ts`. A false flag removes the block, its links and its sitemap entry.

| Input | Owner | Unlocks |
| --- | --- | --- |
| The Rebel's tasting words and facts; hojicha ingredient and latte milk; storage; cups per tin; Scholar dose | Wichita | `CONFIRMED.*` |
| Whether hojicha was in the 40+ samples | Wichita | Hojicha selection line (copy §1 note) |
| Prices, inventory, GST registration | Founders | Real prices appear automatically with Shopify data |
| Pack shots and recipe photography | Founders | `tin`, gallery, recipe and "Taste comes first" photos. Needed before launch (C7) |
| Privacy Policy and legal text | Founders | `LIVE.policies`, then `LIVE.newsletter` |
| Shipping and returns values, support email, reply time, contact provider | Founders | `LIVE.shippingReturns`, `LIVE.announcementBar`, `LIVE.contact` |
| Social URLs (`SOCIAL` in `site.ts`), enabled payment methods | Earth | Footer links, `LIVE.paymentBadges` |
| Cat name, art and licence | Founders | `LIVE.academyCat`, Home cat image |
| Founder story | Founders | `LIVE.ourStory` (add the copy to the page first) |
| Gift and accessory scope | Founders | `LIVE.gifts`, `LIVE.accessories` |
| Trade mark check on four titles; food-labelling review | Attorney / expert | Before tins are printed |
| Shopify store | Store admin | `COMMERCE_SOURCE=shopify`, follow `docs/SHOPIFY-SETUP.md`. Indexing starts here via `robots.ts` |

## Newsletter, when it is built

Storefront `customerCreate` needs a password, so a sign-up needs the Admin API `customerCreate` with `emailMarketingConsent`, from a server-only token with `write_customers`. Check Shopify's docs at the time. Record consent separately from purchases, and flip `LIVE.newsletter` only with the Privacy Policy live.

## Founder sign-off still needed

- Interface labels and the cookie banner, which have no client wording (`docs/COPY-SOURCES.md`).
- The conflict defaults C1 to C11 in `docs/DEVIATIONS.md`, especially the tea accent colours (C2).

## Not built, per the vendor list

Cat art, taste scale, organic or award claims, 100 g, refills, quiz, subscriptions, account pages.

## Known issues

- The favicon is a stand-in mint arch (`src/app/icon.svg`). Replace it with the monogram once the designer delivers one.
- Supplier names remain in git history and in `design/prototype-v*.dc.html`. Keep the repo private. Handoff docs stay in gitignored `docs/client/`.
- `next dev` logs a Next.js internal error during instant-navigation validation (D-24). Production is unaffected.
- Lighthouse budgets were not measured. Run them against a deployed preview.
- Visual baselines are not committed. Record them with `pnpm e2e --project=visual --update-snapshots` on the CI image.
- Playwright's own browser may need `pnpm exec playwright install` on a fresh machine.
