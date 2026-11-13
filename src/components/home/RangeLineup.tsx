"use client";

import Link from "next/link";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { addLabel, useAddFeedback } from "@/components/commerce/useAddFeedback";
import { TinPlaceholder } from "@/components/ui/TinPlaceholder";
import { RANGE } from "@/lib/content/home";
import { TEAS_HREF } from "@/lib/config/site";
import type { TeaType } from "@/lib/data/types";
import styles from "./RangeLineup.module.css";

export type RangeItem = {
  handle: string;
  name: string;
  type: string;
  teaType: TeaType | null;
  notes: string;
  bestFor: string | null;
  /** Null while prices are placeholders: nothing is shown. */
  price: string | null;
  preview: LinePreview | null;
};

function Tea({ item }: { item: RangeItem }) {
  const { state, run } = useAddFeedback();
  return (
    <li className={styles.tea}>
      <Link href={`/products/${item.handle}`} className={styles.stand} aria-label={item.name}>
        <TinPlaceholder teaType={item.teaType} className={styles.tin} />
      </Link>
      <div className={styles.info}>
        <span className={styles.type}>{item.type}</span>
        <Link href={`/products/${item.handle}`} className={styles.name}>
          {item.name}
        </Link>
        {item.notes ? <span className={styles.notes}>{item.notes}</span> : null}
        {item.bestFor ? <span className={styles.best}>{item.bestFor}</span> : null}
        <div className={styles.buy}>
          {item.price ? <span className={styles.price}>{item.price}</span> : null}
          {item.preview ? (
            <button type="button" className={`${styles.add} on-primary`} onClick={() => item.preview && void run(item.preview)}>
              {addLabel(state, "Add to cart")}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/**
 * The range, right under the hero (shop first). The four tins stand on one gold shelf line, like a shop
 * window; each column reads name → tasting words → best for → add to cart (copy v5.3 §1 card order).
 */
export function RangeLineup({ items }: { items: RangeItem[] }) {
  return (
    <section className={styles.section} aria-labelledby="wm-range-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <h2 id="wm-range-title" className={styles.heading}>
            {RANGE.heading}
          </h2>
          <div className={styles.aside}>
            <p>{RANGE.standfirst}</p>
            <Link href={TEAS_HREF} className="label-link">
              {RANGE.title}
            </Link>
          </div>
        </div>
        <ul className={styles.lineup}>
          {items.map((item) => (
            <Tea key={item.handle} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}
