import { effectiveCompareAt, formatMoney } from "@/lib/data/money";
import type { Money } from "@/lib/data/types";
import styles from "./PriceBlock.module.css";

type PriceBlockProps = {
  price: Money;
  compareAt?: Money | null;
  /** Prefix "From" (cards for multi-size products). */
  from?: boolean;
  /** Per-cup cost; hidden unless given. */
  perCup?: Money | null;
  /** e.g. "([2] g serve)". */
  perCupNote?: string;
  size?: "card" | "pdp";
  className?: string;
};

/** Price, struck compare-at (only when strictly higher), optional per-cup line. */
export function PriceBlock({ price, compareAt, from = false, perCup, perCupNote, size = "card", className }: PriceBlockProps) {
  const was = effectiveCompareAt(price, compareAt);
  return (
    <div className={[styles.block, styles[size], className].filter(Boolean).join(" ")}>
      <p className={styles.price}>
        {was ? <span className="visually-hidden">Sale price </span> : null}
        {from ? "From " : null}
        {formatMoney(price)}
        {was ? (
          <s className={styles.was}>
            <span className="visually-hidden">Was </span>
            {formatMoney(was)}
          </s>
        ) : null}
      </p>
      {perCup ? (
        <p className={styles.perCup}>
          ≈ {formatMoney(perCup)} per cup{perCupNote ? ` ${perCupNote}` : ""}
        </p>
      ) : null}
    </div>
  );
}
