"use client";

import Link from "next/link";
import { useState } from "react";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { addLabel, useAddFeedback } from "@/components/commerce/useAddFeedback";
import { RecipeDrawing } from "@/components/motion/MatchaScenes";
import { Icon } from "@/components/ui/Icon";
import { TinPlaceholder } from "@/components/ui/TinPlaceholder";
import { DRINK_WAYS, HERO, SELECTION, SELECTION_ID, type DrinkWay } from "@/lib/content/home";
import type { TeaType } from "@/lib/data/types";
import styles from "./TasteQuadrant.module.css";

export type QuadCell = {
  handle: string;
  name: string;
  academyTitle: string;
  descriptor: string;
  type: string;
  teaType: TeaType | null;
  notes: string;
  bestFor: string | null;
  way: DrinkWay;
  /** Null while prices are placeholders: nothing is shown. */
  price: string | null;
  preview: LinePreview | null;
};

/**
 * "Find your next cup" (copy v5.3 §1) in V4's quadrant: a STRAIGHT | WITH MILK switch and the four teas as a
 * 2 × 2 grid. Teas that are best the chosen way are outlined. No bright/deep axis: there is no taste scale at
 * launch (vendor list).
 */
export function TasteQuadrant({ cells }: { cells: QuadCell[] }) {
  const [way, setWay] = useState<DrinkWay>("straight");
  const defaultFor = (w: DrinkWay) => cells.find((c) => c.way === w)?.handle ?? cells[0]?.handle ?? "";
  const [selected, setSelected] = useState(() => defaultFor("straight"));
  const sel = cells.find((c) => c.handle === selected) ?? cells[0];
  const { state, run } = useAddFeedback();

  const switchWay = (w: DrinkWay) => {
    setWay(w);
    setSelected(defaultFor(w));
  };

  return (
    <section id={SELECTION_ID} className={`container ${styles.section}`} aria-labelledby="wm-quadrant-title">
      <div className={styles.left}>
        <span className="label" data-reveal="left">
          {HERO.secondary}
        </span>
        <h2 id="wm-quadrant-title" className="display-section" data-reveal="left" data-delay="80">
          Find your <i className="serif-italic">next cup</i>
        </h2>
        <p className={styles.body} data-reveal="left" data-delay="120">
          {SELECTION.body}
        </p>
        <div className={styles.toggle} role="radiogroup" aria-labelledby="wm-quadrant-title" data-reveal="left" data-delay="160">
          {(["straight", "milk"] as const).map((w) => (
            <button key={w} type="button" role="radio" aria-checked={way === w} onClick={() => switchWay(w)}>
              {DRINK_WAYS[w].label}
            </button>
          ))}
        </div>
        <div className={styles.window} data-reveal="arch-open">
          <div className={styles.photo} data-on={way === "straight" || undefined} aria-hidden="true">
            <RecipeDrawing id="usucha" />
          </div>
          <div className={styles.photo} data-on={way === "milk" || undefined} aria-hidden="true">
            <RecipeDrawing id="iced-matcha-latte" />
          </div>
          <div className={styles.windowBar}>
            <span className="label">{DRINK_WAYS[way].recipe}</span>
            <span className="body-small">{DRINK_WAYS[way].needs}</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.grid} data-reveal="right">
          {cells.map((c) => {
            const on = c.handle === selected;
            return (
              <button
                key={c.handle}
                type="button"
                className={styles.cell}
                data-state={on ? "selected" : c.way === way ? "suits" : "other"}
                data-way={c.way}
                aria-pressed={on}
                onClick={() => {
                  setSelected(c.handle);
                  setWay(c.way);
                }}
              >
                {on ? (
                  <span className={styles.selectedTag} aria-hidden="true">
                    <Icon name="check" size={14} strokeWidth={2} />
                  </span>
                ) : null}
                <span className="label">{c.type}</span>
                <span className={styles.art}>
                  <TinPlaceholder teaType={c.teaType} className={styles.tin} />
                </span>
                <span className={styles.teaName}>{c.academyTitle}</span>
                <span className="body-small">{c.descriptor}</span>
                {c.bestFor ? <span className={`body-small ${styles.best}`}>{c.bestFor}</span> : null}
              </button>
            );
          })}
        </div>

        {sel ? (
          <div className={styles.detail} aria-live="polite">
            <span className={styles.detailTin}>
              <TinPlaceholder teaType={sel.teaType} />
            </span>
            <div className={styles.detailText}>
              <span className="label">{sel.type}</span>
              <span className={styles.teaName}>{sel.name}</span>
              {sel.notes ? <span className="body-small">{sel.notes}</span> : null}
              <div className={styles.detailRow}>
                {sel.price ? <span className={styles.price}>{sel.price}</span> : <span />}
                <div className={styles.detailActions}>
                  <Link href={`/products/${sel.handle}`} className="label-link">
                    View tea
                  </Link>
                  {sel.preview ? (
                    <button type="button" className={`${styles.add} on-primary`} onClick={() => sel.preview && void run(sel.preview)}>
                      {addLabel(state, "Add to cart")}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
