"use client";

import Link from "next/link";
import { useState } from "react";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { addLabel, useAddFeedback } from "@/components/commerce/useAddFeedback";
import { SELECTION, SELECTION_ID } from "@/lib/content/home";
import type { TeaType } from "@/lib/data/types";
import styles from "./TeaChooser.module.css";

export type ChooserPick = {
  handle: string;
  /** The case from copy v5.3 §6 "Which tea should I choose?". */
  option: string;
  academyTitle: string;
  descriptor: string;
  type: string;
  teaType: TeaType | null;
  notes: string[];
  chooseItIf: string | null;
  price: string | null;
  preview: LinePreview | null;
};

/**
 * "Find your next cup": the client's own answer to "Which tea should I choose?", made into a chooser. Pick how
 * you drink tea on the left; the tea that answer names fills the panel on the right, ready to add to the cart.
 */
export function TeaChooser({ picks }: { picks: ChooserPick[] }) {
  const [index, setIndex] = useState(0);
  const pick = picks[index];
  const { state, run } = useAddFeedback();
  if (!pick) return null;

  return (
    <section id={SELECTION_ID} className={styles.section} aria-labelledby="wm-chooser-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.ask}>
          <h2 id="wm-chooser-title" className={styles.heading}>
            {SELECTION.heading}
          </h2>
          <p className={styles.body}>{SELECTION.body}</p>
          <div className={styles.options} role="radiogroup" aria-labelledby="wm-chooser-title">
            {picks.map((p, i) => (
              <button
                key={p.handle}
                type="button"
                role="radio"
                aria-checked={i === index}
                className={styles.option}
                onClick={() => setIndex(i)}
              >
                <span className={styles.mark} aria-hidden="true" />
                {p.option}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.answer} aria-live="polite">
          <div key={pick.handle} className={styles.reveal}>
            <span className={styles.type}>
              <span className={styles.dot} data-tea={pick.teaType ?? undefined} aria-hidden="true" />
              {pick.type}
            </span>
            <p className={styles.title}>{pick.academyTitle}</p>
            <p className={styles.descriptor}>{pick.descriptor}</p>
            {pick.notes.length ? (
              <ul className={styles.notes}>
                {pick.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            ) : null}
            {pick.chooseItIf ? (
              <p className={styles.because}>
                <span>Choose it if</span> {pick.chooseItIf}
              </p>
            ) : null}
            <div className={styles.actions}>
              {pick.price ? <span className={styles.price}>{pick.price}</span> : null}
              {pick.preview ? (
                <button type="button" className={`${styles.add} on-primary`} onClick={() => pick.preview && void run(pick.preview)}>
                  {addLabel(state, "Add to cart")}
                </button>
              ) : null}
              <Link href={`/products/${pick.handle}`} className="label-link">
                View tea
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
