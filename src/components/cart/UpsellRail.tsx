"use client";

import { Button } from "@/components/ui/Button";
import { MediaThumb } from "@/components/ui/MediaThumb";
import { formatMoney } from "@/lib/data/money";
import { defaultVariant } from "@/lib/data/product";
import { merchandiseFor } from "@/lib/cart/optimistic";
import type { Product } from "@/lib/data/types";
import { useCart } from "./CartProvider";
import styles from "./Cart.module.css";

/** "Pair with": one or two tools or a second tin, compact add. Hides anything already in the cart. */
export function UpsellRail({ products, title = "Pair with", size = "compact", showTitle = true }: { products: Product[]; title?: string; size?: "compact" | "roomy"; showTitle?: boolean }) {
  const { cart, addItem } = useCart();
  const inCart = new Set(cart?.lines.map((l) => l.merchandise.productHandle));
  const list = products.filter((p) => p.availableForSale && !inCart.has(p.handle)).slice(0, 2);
  if (!list.length) return null;
  return (
    <section className={styles.upsell} aria-label={title}>
      {showTitle ? <h3 className="label">{title}</h3> : null}
      <ul>
        {list.map((p) => {
          const v = defaultVariant(p)!;
          return (
            <li key={p.id} className={size === "roomy" ? styles.upsellRoomy : undefined}>
              <MediaThumb media={p.media[0] ?? null} ratio="4:5" width={size === "roomy" ? 80 : 48} />
              <span className={styles.upsellText}>
                {size === "roomy" ? <span className={styles.eyebrow}>TOOL</span> : null}
                <span>{p.title}</span>
                <span className={styles.small}>{formatMoney(v.price)}</span>
              </span>
              <Button variant="secondary" size={size === "roomy" ? "md" : "sm"} onClick={() => void addItem(merchandiseFor(p, v), 1)} aria-label={`Add ${p.title} to cart`}>
                Add
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
