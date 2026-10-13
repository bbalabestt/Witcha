"use client";

import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/data/money";
import { OPTIMISTIC_PREFIX } from "@/lib/cart/optimistic";
import type { Cart } from "@/lib/data/types";
import styles from "./Cart.module.css";

/** Subtotal, GST line and the single primary action: Shopify-hosted checkout in the same tab. */
export function CartSummary({ cart, pending, shopPay }: { cart: Cart; pending: boolean; shopPay: boolean }) {
  const settling = pending || cart.lines.some((l) => l.id.startsWith(OPTIMISTIC_PREFIX));
  const blocked = cart.lines.some((l) => !l.merchandise.availableForSale);
  const disabled = settling || blocked || !cart.checkoutUrl;
  return (
    <div className={styles.summary}>
      <div className={styles.subtotal}>
        <span>Subtotal</span>
        <span className={styles.subtotalValue}>{formatMoney(cart.cost.subtotal)}</span>
      </div>
      <p className={styles.small}>AUD, incl. GST. Shipping and discount codes are calculated at checkout.</p>
      {disabled ? (
        <span className={styles.checkout} aria-disabled="true" role="link">
          <Icon name="lock" size={18} />
          {settling ? "Updating…" : "Checkout"}
        </span>
      ) : (
        // Same tab, straight to Shopify's checkoutUrl. No custom checkout.
        <a href={cart.checkoutUrl} className={styles.checkout}>
          <Icon name="lock" size={18} />
          Checkout
        </a>
      )}
      {blocked ? <p className={styles.warn}>Remove sold-out items to check out.</p> : null}
      {shopPay ? <div className={styles.walletSlot}>Shop Pay · rendered by Shopify</div> : null}
    </div>
  );
}
