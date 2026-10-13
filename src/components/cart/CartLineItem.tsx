"use client";

import Link from "next/link";
import { QuantityStepper } from "@/components/ui/Controls";
import { MediaThumb } from "@/components/ui/MediaThumb";
import { formatMoney } from "@/lib/data/money";
import { lineCap, OPTIMISTIC_PREFIX } from "@/lib/cart/optimistic";
import type { CartLine } from "@/lib/data/types";
import { useCart } from "./CartProvider";
import styles from "./Cart.module.css";

export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const { updateQuantity, removeLine } = useCart();
  const m = line.merchandise;
  const settling = line.id.startsWith(OPTIMISTIC_PREFIX);
  const cap = lineCap(m);
  const capped = m.quantityAvailable !== null && line.quantity >= cap && cap < 99;

  return (
    <li className={styles.line} data-settling={settling || undefined}>
      <MediaThumb media={m.image} ratio="4:5" width={80} />
      <div className={styles.lineBody}>
        <div className={styles.lineTop}>
          <span className={styles.eyebrow}>{m.eyebrow}</span>
          <span className={styles.linePrice}>{formatMoney(line.cost.total)}</span>
        </div>
        <Link href={`/products/${m.productHandle}`} className={styles.lineName} onClick={onNavigate}>
          {m.productTitle}
        </Link>
        <span className={styles.small}>{m.size}</span>
        <div className={styles.lineActions}>
          <QuantityStepper
            size="compact"
            label={`Quantity of ${m.productTitle}`}
            value={line.quantity}
            max={cap}
            disabled={settling || !m.availableForSale}
            onChange={(q) => void updateQuantity(line.id, q)}
          />
          <button type="button" className={styles.remove} onClick={() => void removeLine(line.id)} disabled={settling} aria-label={`Remove ${m.productTitle}, ${m.size}`}>
            Remove
          </button>
        </div>
        {!m.availableForSale ? (
          <p className={styles.warn}>Sold out. Remove it to check out.</p>
        ) : capped ? (
          <p className={styles.small}>Only {cap} available</p>
        ) : null}
      </div>
    </li>
  );
}
