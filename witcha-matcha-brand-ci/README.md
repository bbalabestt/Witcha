# WITCHA MATCHA

Premium Japanese matcha, Australia first. **Small magic, serious matcha:** the identity is calm, classic and premium; the magic lives in the painted world around it, not in the logo. The working principle is *Soft World, Structured System*: illustration can be dreamy, but the logo, type, colour and layout stay crisp and consistent.

Status labels used below: **Confirmed** (decided by the founders), **Proposed** (a working default until someone decides otherwise), **Pending** (not designed or decided yet).

## Logo — Confirmed

The master logo is the WITCHA MATCHA wordmark only: no tagline, symbol or cat. WITCHA sits over MATCHA, which is set in spaced capitals between two fine rules. Always use the supplied files in the Logos group; never retype the logo.

| Version | Set in | Use from |
| --- | --- | --- |
| Large | Libre Caslon Display + Libre Caslon Text | 40 mm / 160 px wide |
| Small | Libre Caslon Text | 25 mm / 100 px wide |
| Small, no rules | Libre Caslon Text, rules removed | below 25 mm / 100 px (min 18 mm / 64 px) |

- **Colours:** the logo is only ever `brand-deep-blue`, `brand-gold` (printed as foil), `brand-ivory` on deep blue, black or white. Never `brand-witcha-blue`.
- **Clear space:** the height of the W in WITCHA on all four sides.
- **Website header:** Large, deep blue, on `surface-page`. **Social profile picture:** the supplied deep blue avatar (Small, no rules).
- **Don't:** add stars, sparkles, moons or cats; stretch, rotate, outline or add shadows or gradients; move MATCHA or the rules; set the logo on busy imagery.

Full rules: the WITCHA MATCHA Logo Usage Guide (Claude Doc). Full file set (13 SVG versions, PNGs, social avatar): `witcha-matcha_logo-files_v1.zip`.

## Colour

`brand-witcha-blue` (#A1D7D6) is the colour people should remember: it leads on packaging and brand-led web sections. Deep blue carries the text and structure; ivory gives breathing space; gold is a foil accent.

- **Rough balance on brand-led surfaces:** Witcha blue 40–60%, ivory or aqua light for space, deep blue for type and lines, blush, sage and gold under 10% combined.
- **Text:** `text-primary` (deep blue) on ivory, Witcha blue or aqua light. Never white or ivory text on Witcha blue (1.6:1). Never gold text.
- **Secondary text:** `brand-blue-mid` only at 24px and above (4.45:1 on ivory).
- **Buttons:** `action-primary` (deep blue) with white labels, 7.8:1.
- Ivory, blush, sage and gold are **Proposed** values; print needs CMYK and Pantone matches from a proof.

## Typography

| Role | Face | Status |
| --- | --- | --- |
| Headlines | Libre Caslon Display (large) and Libre Caslon Text (section headings) | Confirmed with the logo |
| Body and interface | Jost | **Proposed**: a clean sans, as the Brand Bible asks; swap if a better fit is found |
| Tagline, small italic moments | Libre Caslon Text Italic | Confirmed |

All three are Google Fonts under the SIL Open Font License. Keep headings regular weight (400): the elegance comes from size and spacing, never bold. Body copy stays at 17px or larger.

## The arch

A tall window with a semicircular top is the brand's signature shape. Use it to frame character art on labels and imagery on the website (`radius-arch` on the top two corners only). Keep it plain: a single line or a solid shape, never ornate. Everything else is square (`radius-none`).

## Illustration and photography — Pending

- **Illustration:** original, impressionist-inspired painterly artwork of the feline characters, by a commissioned artist. Cats appear on labels, packaging scenes and content, never in the logo. Subtle stars or botanical details may appear inside illustrations as accents.
- **Photography:** real product, hands and kitchens in natural light; matcha colour shown truthfully; whisk, frother, shaker and iced preparation all shown.
- Until artwork exists, leave arch frames empty or use real product photography; never placeholder AI art.

## Voice and messaging

| Line | Role | Where |
| --- | --- | --- |
| Matcha, With Taste. | Tagline (Confirmed) | Near the logo on labels, website, note cards; never inside the logo |
| Which Matcha Today? | Brand line (Confirmed) | Shop page, taste scale (Bright to Deep), labels, social |
| Witch Matcha Today? | Playful variant (optional) | Social, note cards, Halloween only |

"Good Matcha, Better Days." is retired. No more than two brand lines on one pack. Tone: whimsical not childish, warm not saccharine, knowledgeable not intimidating. Australian English. Never health, energy or detox claims.

## For the website developer

- **CSS variables:** every token is a custom property, for example `var(--brand-deep-blue)`, `var(--surface-page)`, `var(--space-4)`, `var(--radius-arch)`, and `var(--font-display)`, `var(--font-serif)`, `var(--font-sans)`. Use the semantic tokens (`surface-*`, `text-*`, `action-*`, `line-*`) in components and the `brand-*` tokens only for brand blocks.
- **Type styles:** `display-xl`, `heading-1` to `heading-3`, `body`, `body-small`, `label`, `tagline` map to classes of the same name.
- **Fonts:** self-host the files in `fonts/`, or load from Google Fonts: `https://fonts.googleapis.com/css2?family=Jost:wght@400;500&family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,400;1,400&display=swap`.
- **Logo:** use the SVGs from the Logos group. Give the header logo `alt="WITCHA MATCHA"`.
- **Accessibility:** follow the text pairings in each colour token's note; focus rings in `line-control` (deep blue).
- **Still to come:** favicon (the wordmark can't work at 16 px), character artwork, final body font sign-off.

## Open items

- Trademark search (IP Australia): WITCHA, WITCHA MATCHA, "Matcha, With Taste.", "Which Matcha Today?".
- Lettering designer refinement of the wordmark, including a slightly larger MATCHA in the Small version.
- Favicon / small mark.
- Print proofs for colour and gold foil.
