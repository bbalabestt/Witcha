"use client";

import Image from "next/image";
import type { Image as Img } from "@/lib/data/types";
import type { LinePreview } from "./CartProvider";
import { addLabel, useAddFeedback } from "./useAddFeedback";
import styles from "./GiftSetCard.module.css";

export type GiftSetData = {
  handle: string;
  title: string;
  note: string;
  price: string;
  pending: boolean;
  tins: Img[];
  preview: LinePreview | null;
};

export function GiftSetCard({ set }: { set: GiftSetData }) {
  const { state, run } = useAddFeedback();
  return (
    <article className={styles.card}>
      <div className={styles.image} data-pair={set.tins.length > 1 || undefined}>
        {set.tins.slice(0, 2).map((t, i) => (
          <span key={t.url} className={styles.tin} data-side={i === 0 ? "left" : "right"}>
            <Image src={t.url} alt={i === 0 ? `${set.title}: ${t.alt}` : ""} fill sizes="200px" className={styles.contain} />
          </span>
        ))}
        {set.pending ? <span className={`pending-tag ${styles.pending}`}>Pending</span> : null}
      </div>
      <span className="label">Gift set</span>
      <h3 className="heading-3">{set.title}</h3>
      <p className="body-small">{set.note}</p>
      <span className={styles.price}>{set.price}</span>
      <button
        type="button"
        className={styles.add}
        data-state={state}
        aria-live="polite"
        disabled={!set.preview}
        onClick={() => set.preview && void run(set.preview)}
      >
        {set.preview ? addLabel(state, "Add to cart") : "Sold out"}
      </button>
    </article>
  );
}
