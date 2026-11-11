"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { addLabel, useAddFeedback } from "@/components/commerce/useAddFeedback";
import { RecipeDrawing, type RecipeDrawingId } from "@/components/motion/MatchaScenes";
import { hoverCapable } from "@/components/motion/runtime";
import { TinPlaceholder } from "@/components/ui/TinPlaceholder";
import { HERO, RANGE } from "@/lib/content/home";
import { TEAS_HREF } from "@/lib/config/site";
import type { TeaType } from "@/lib/data/types";
import styles from "./ArchShelf.module.css";

export type ShelfItem = {
  id: string;
  handle: string;
  name: string;
  eyebrow: string;
  notes: string;
  bestFor: string | null;
  /** Null while prices are placeholders: nothing is shown. */
  price: string | null;
  teaType: TeaType | null;
  preview: LinePreview | null;
};

/** The drink each tea is best for (copy v5.3 §1 "Best for"), shown in the arch on hover. */
function sceneFor(item: ShelfItem): RecipeDrawingId {
  if (item.teaType === "hojicha") return "hojicha-latte";
  return item.bestFor && /straight/i.test(item.bestFor) ? "usucha" : "iced-matcha-latte";
}

function ShelfArch({ item, index, on, onEnter, onLeave }: { item: ShelfItem; index: number; on: boolean; onEnter: () => void; onLeave: () => void }) {
  const { state, run } = useAddFeedback();
  const router = useRouter();

  return (
    // Touch screens get no sticky hover: tapping opens the tea instead (V4 mobile round).
    <div className={styles.item} data-on={on || undefined} onMouseEnter={() => hoverCapable() && onEnter()} onMouseLeave={onLeave}>
      <div className={styles.inner} data-reveal="up" data-delay={String(index * 90)}>
        <button
          type="button"
          className={styles.arch}
          data-tint={index % 2 ? "soft" : "page"}
          onFocus={onEnter}
          onBlur={onLeave}
          onClick={() => router.push(`/products/${item.handle}`)}
        >
          <span className={styles.tin} aria-hidden="true">
            <TinPlaceholder teaType={item.teaType} />
          </span>
          <span className={styles.key} aria-hidden="true">
            <RecipeDrawing id={sceneFor(item)} />
          </span>
          <span className="visually-hidden">{item.name}</span>
          <span className={styles.number} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </button>
        <div className={styles.text}>
          <span className={`label ${styles.eyebrow}`}>{item.eyebrow}</span>
          <Link href={`/products/${item.handle}`} className={styles.name}>
            {item.name}
          </Link>
          <span className={`body-small ${styles.line}`}>
            {item.notes ? (
              <>
                {item.notes}
                <br />
              </>
            ) : null}
            {item.bestFor}
          </span>
          <div className={styles.buy}>
            {item.price ? <span className={styles.price}>{item.price}</span> : <span />}
            {item.preview ? (
              <button type="button" className={`${styles.add} on-primary`} onClick={() => item.preview && void run(item.preview)}>
                {addLabel(state, "Add to cart")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The four teas in V4's arch windows, about a screen tall. Hover or focus lifts the tin away to show the drink
 * that tea is best for (desktop pointer only). Arches keep their width, so the row never reflows. Phones scroll
 * it sideways.
 * Words: copy v5.3 §3 (Teas collection title and intro); "The range" is the home mock's label.
 */
export function ArchShelf({ items }: { items: ShelfItem[] }) {
  const [hover, setHover] = useState(-1);
  return (
    <section className={styles.section} aria-labelledby="wm-shelf-title">
      <div className={`container ${styles.content}`}>
        <div className={styles.head}>
          <div className={styles.titles}>
            <span className="label" data-reveal="left">
              The range
            </span>
            <h2 id="wm-shelf-title" className="display-section" data-reveal="wipe-l">
              {RANGE.title}
            </h2>
          </div>
          <div className={styles.intro} data-reveal="right">
            <p>{RANGE.intro}</p>
            <Link href={TEAS_HREF} className="label-link">
              {HERO.primary}
            </Link>
          </div>
        </div>
        <div className={styles.row}>
          {items.map((item, i) => (
            <ShelfArch
              key={item.id}
              item={item}
              index={i}
              on={hover === i}
              onEnter={() => setHover(i)}
              onLeave={() => setHover((h) => (h === i ? -1 : h))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
