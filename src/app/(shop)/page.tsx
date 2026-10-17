import { AcademyKeeper } from "@/components/home/AcademyKeeper";
import { ArchShelf, type ShelfItem } from "@/components/home/ArchShelf";
import { GiftsPanel } from "@/components/home/GiftsPanel";
import { Hero } from "@/components/home/Hero";
import { HomeReviews } from "@/components/home/HomeReviews";
import { Manifesto } from "@/components/home/Manifesto";
import { Methods } from "@/components/home/Methods";
import { PromoPopup } from "@/components/home/PromoPopup";
import { TasteQuadrant, type QuadCell } from "@/components/home/TasteQuadrant";
import { Marquee } from "@/components/motion/Marquee";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { toGiftSet } from "@/components/commerce/card-data";
import { env } from "@/lib/config/env";
import { ACADEMY_INTRO, GHOST_LINES, MANIFESTO, MANIFESTO_KEYS, QUADRANT, ROASTED_HANDLE } from "@/lib/content/home";
import { getCharacters, getGuides, getPrepMethods, getProducts, getSiteSettings } from "@/lib/data/catalog";
import { formatMoney } from "@/lib/data/money";
import { eyebrow, firstAvailable } from "@/lib/data/product";
import type { Product } from "@/lib/data/types";
import { socialReviews } from "@/lib/providers";
import styles from "./home.module.css";

const DREAMER_TIN = { url: "/art/05-fifth-sku-concept-tin-mockup.webp", alt: "", width: 720, height: 720 };

/** Quick add from the home sections takes the first available size, as in V4. */
function quickAdd(p: Product): LinePreview | null {
  const v = firstAvailable(p);
  if (!v || !v.availableForSale) return null;
  return { merchandiseId: v.id, handle: p.handle, title: p.title, kind: p.kind, eyebrow: eyebrow(p), tin: p.tin, variantTitle: v.title, price: v.price, quantityAvailable: v.quantityAvailable };
}

export default async function Home() {
  const e = env();
  const [products, characters, methods, guides, settings, reviews] = await Promise.all([
    getProducts(),
    getCharacters(),
    getPrepMethods(),
    getGuides(),
    getSiteSettings(),
    socialReviews.get(),
  ]);
  const byHandle = new Map(products.map((p) => [p.handle, p]));
  const charByHandle = new Map(characters.map((c) => [c.handle, c]));
  const teas = products.filter((p) => p.kind === "tea");
  const lead = teas.find((p) => p.facts) ?? teas[0];
  const dreamer = characters.find((c) => c.concept);

  const quad: QuadCell[] = QUADRANT.map((q, i) => {
    const p = q.handle ? byHandle.get(q.handle) : undefined;
    const c = charByHandle.get(q.character);
    const v = p ? firstAvailable(p) : null;
    return {
      id: `${q.row}-${q.side}-${i}`,
      row: q.row,
      role: `${q.side} · ${q.row}`.toUpperCase(),
      keeper: c?.name ?? "[Keeper]",
      tea: p ? p.title : "Concept · being tasted",
      art: c?.art ?? null,
      product:
        p && v
          ? {
              handle: p.handle,
              eyebrow: eyebrow(p),
              notes: p.tastingNotes.join(" · "),
              price: `${formatMoney(v.price)}${v.title ? ` · ${v.title}` : ""}`,
              tin: p.tin,
              preview: quickAdd(p),
            }
          : null,
      conceptTin: p ? null : DREAMER_TIN,
    };
  });

  const shelf: ShelfItem[] = [
    ...teas.map((p) => {
      const v = firstAvailable(p);
      return {
        id: p.handle,
        handle: p.handle,
        name: p.title,
        eyebrow: eyebrow(p),
        line: `${p.tastingNotes.join(" · ")}. Kept by ${p.character?.name ?? "[keeper]"}.`,
        price: v ? formatMoney(v.price) : "",
        tin: p.tin,
        key: p.character?.art ?? null,
        preview: quickAdd(p),
      };
    }),
    ...(dreamer
      ? [
          {
            id: dreamer.handle,
            handle: null,
            name: dreamer.name,
            eyebrow: "CONCEPT · BRIGHT",
            line: "A fifth tea is being tasted. Letters from the Academy hear first.",
            price: "Coming soon",
            tin: DREAMER_TIN,
            key: dreamer.art,
            preview: null,
          },
        ]
      : []),
  ];

  const guideFor = (id: string) => guides.find((g) => g.method === id && !g.troubleshooting);
  const methodCards = methods.map((m) => {
    const g = guideFor(m.id);
    return { id: m.id, name: m.name, summary: m.summary, photo: m.poster.url, href: g ? `/blogs/brewing-guides/${g.handle}` : "/blogs/brewing-guides" };
  });

  const set = products.find((p) => p.kind === "gift");
  const setData = set ? toGiftSet(set) : null;

  const marqueeFacts = lead?.facts
    ? `${lead.facts.origin} · ${lead.facts.cultivar.replace(/^100% /, "")} · ${lead.facts.harvest} · 2 g a cup · 80°C · free shipping over ${formatMoney(settings.freeShippingThreshold)} · gift notes in the cart · `.toUpperCase()
    : "";
  const manifesto = MANIFESTO.split(" ").map((w) => ({ w, key: MANIFESTO_KEYS.includes(w.replace(/[^a-z]/gi, "").toLowerCase()) }));
  const facts = lead?.facts ? [`Origin · ${lead.facts.origin}`, `Cultivar · ${lead.facts.cultivar}`, `Harvest · ${lead.facts.harvest.replace(/ harvest$/i, "")}`] : [];

  return (
    <>
      <Hero backdrop="/art/heroes-02-everyday-matcha-desktop.jpg" backdropOpacity={0.22} />

      <div className={styles.bandDark} aria-hidden="true">
        <Marquee direction={1}>
          <span className={styles.bandItems}>
            Matcha, With Taste.<span className={styles.archLine} />
            Which Matcha Today?<span className={styles.archSolid} />
            Bright to deep<span className={styles.archLine} />
            Whisked, frothed, shaken, iced<span className={styles.archSolid} />
          </span>
        </Marquee>
      </div>
      {marqueeFacts ? (
        <div className={styles.bandSoft} aria-hidden="true">
          <Marquee direction={-1}>
            <span className={styles.bandFacts}>{marqueeFacts}</span>
          </Marquee>
        </div>
      ) : null}

      <TasteQuadrant cells={quad} roastedHandle={byHandle.has(ROASTED_HANDLE) ? ROASTED_HANDLE : null} />
      <ArchShelf items={shelf} backdrop />
      <Manifesto words={manifesto} facts={facts} />
      <Methods methods={methodCards} />
      <AcademyKeeper intro={ACADEMY_INTRO} ghost={GHOST_LINES} />
      <GiftsPanel cutoff={settings.giftCutoff} />
      {reviews.reviews.length ? <HomeReviews reviews={reviews} /> : null}
      {e.promoPopup ? <PromoPopup set={setData?.preview ?? null} price={setData?.price ?? ""} /> : null}
    </>
  );
}
