import type { Metadata } from "next";
import { AcademyPreview } from "@/components/home/AcademyPreview";
import { ArchShelf, type ShelfItem } from "@/components/home/ArchShelf";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Methods } from "@/components/home/Methods";
import { TasteQuadrant, type QuadCell } from "@/components/home/TasteQuadrant";
import { Marquee } from "@/components/motion/Marquee";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { BRAND_LINE, TAGLINE, TASTE_FIRST, TASTE_FIRST_KEYS } from "@/lib/content/home";
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

  const cells: QuadCell[] = teas.map((p) => ({
    handle: p.handle,
    name: p.title,
    academyTitle: p.academyTitle,
    descriptor: p.descriptor,
    type: teaTypeLabel(p.teaType),
    teaType: p.teaType,
    notes: p.tastingNotes.join(" · "),
    bestFor: p.bestForShort,
    // Copy v5.3: only The Professor is best straight; the other three are best with milk.
    way: p.bestForShort && /straight/i.test(p.bestForShort) ? "straight" : "milk",
    price: cardPrice(p),
    preview: quickAdd(p),
  }));

  const shelf: ShelfItem[] = teas.map((p) => ({
    id: p.handle,
    handle: p.handle,
    name: p.title,
    eyebrow: teaTypeLabel(p.teaType),
    notes: p.tastingNotes.join(" · "),
    bestFor: p.bestForShort,
    price: cardPrice(p),
    teaType: p.teaType,
    preview: quickAdd(p),
  }));

  const words = TASTE_FIRST.body.split(" ").map((w) => ({ w, key: TASTE_FIRST_KEYS.includes(w.replace(/[^a-z0-9]/gi, "").toLowerCase()) }));

  return (
    <>
      <Hero />

      <div className={styles.bandDark} aria-hidden="true">
        <Marquee direction={1}>
          <span className={styles.bandItems}>
            {TAGLINE}
            <span className={styles.archLine} />
            {BRAND_LINE}
            <span className={styles.archSolid} />
            Whisked, frothed, shaken, iced
            <span className={styles.archLine} />
          </span>
        </Marquee>
      </div>
      <div className={styles.bandSoft} aria-hidden="true">
        <Marquee direction={-1}>
          <span className={styles.bandFacts}>{teas.map((p) => `${p.title} · `).join("").toUpperCase()}</span>
        </Marquee>
      </div>

      <TasteQuadrant cells={cells} />
      <ArchShelf items={shelf} />
      <Manifesto words={words} />
      <Methods notes={METHOD_NOTES} />
      <AcademyPreview />
    </>
  );
}
