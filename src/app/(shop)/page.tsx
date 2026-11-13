import type { Metadata } from "next";
import { AcademyPreview } from "@/components/home/AcademyPreview";
import { GiftsPanel } from "@/components/home/GiftsPanel";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Methods } from "@/components/home/Methods";
import { ProofStrip, type ProofTea } from "@/components/home/ProofStrip";
import { RangeLineup, type RangeItem } from "@/components/home/RangeLineup";
import { TeaChooser, type ChooserPick } from "@/components/home/TeaChooser";
import { Marquee } from "@/components/motion/Marquee";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { CHOOSER, ORIGINS, TAGLINE, TASTE_FIRST, TASTE_FIRST_KEYS } from "@/lib/content/home";
import { METHOD_NOTES } from "@/lib/content/recipes";
import { SEO } from "@/lib/content/seo";
import { getProducts } from "@/lib/data/catalog";
import { cardPrice, firstAvailable, teaTypeLabel } from "@/lib/data/product";
import type { Product } from "@/lib/data/types";
import styles from "./home.module.css";

export const metadata: Metadata = { title: { absolute: SEO.home.title }, description: SEO.home.description };

/** Quick add from the home sections takes the first available size, as in V4. */
function quickAdd(p: Product): LinePreview | null {
  const v = firstAvailable(p);
  if (!v || !v.availableForSale) return null;
  return { merchandiseId: v.id, handle: p.handle, title: p.title, kind: p.kind, teaType: p.teaType, tin: p.tin, variantTitle: v.title, price: v.price, quantityAvailable: v.quantityAvailable };
}

export default async function Home() {
  const teas = (await getProducts()).filter((p) => p.kind === "tea");
  const byHandle = new Map(teas.map((p) => [p.handle, p]));

  const range: RangeItem[] = teas.map((p) => ({
    handle: p.handle,
    name: p.title,
    type: teaTypeLabel(p.teaType),
    teaType: p.teaType,
    notes: p.tastingNotes.join(" · "),
    bestFor: p.bestForShort,
    price: cardPrice(p),
    preview: quickAdd(p),
  }));

  const proof: ProofTea[] = teas.flatMap((p) =>
    // The descriptor names each row: the full names are in the range just above.
    p.facts ? [{ handle: p.handle, name: p.descriptor, origin: p.facts.origin, cultivar: p.facts.cultivar, harvest: p.facts.harvest }] : [],
  );

  const picks: ChooserPick[] = CHOOSER.flatMap((c) => {
    const p = byHandle.get(c.handle);
    return p
      ? [
          {
            handle: p.handle,
            option: c.option,
            academyTitle: p.academyTitle,
            descriptor: p.descriptor,
            type: teaTypeLabel(p.teaType),
            teaType: p.teaType,
            notes: p.tastingNotes,
            chooseItIf: p.chooseItIf,
            price: cardPrice(p),
            preview: quickAdd(p),
          },
        ]
      : [];
  });

  const words = TASTE_FIRST.body.split(" ").map((w) => ({ w, key: TASTE_FIRST_KEYS.includes(w.replace(/[^a-z0-9]/gi, "").toLowerCase()) }));

  return (
    <>
      {/* Bible p.47 order, shop first: hero → products → taste proof → selection → make it at home → Academy → gifts. */}
      <Hero />
      <RangeLineup items={range} />

      <div className={styles.bandDark} aria-hidden="true">
        <Marquee direction={1}>
          <span className={styles.bandItems}>
            {TAGLINE}
            <span className={styles.sep} />
            Whisked, frothed, shaken, iced
            <span className={styles.sep} />
          </span>
        </Marquee>
      </div>
      <div className={styles.bandSoft} aria-hidden="true">
        <Marquee direction={-1}>
          <span className={styles.bandFacts}>{ORIGINS.map((o) => `${o} · `).join("").toUpperCase()}</span>
        </Marquee>
      </div>

      <ProofStrip teas={proof} />
      <Manifesto words={words} />
      <TeaChooser picks={picks} />
      <Methods notes={METHOD_NOTES} />
      <AcademyPreview />
      <GiftsPanel />
    </>
  );
}
