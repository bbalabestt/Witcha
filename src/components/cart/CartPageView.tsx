"use client";

import { Skeleton } from "@/components/ui/Frame";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import { CartSummary } from "./CartSummary";
import { EmptyCart, StatusLine, type CartExtras } from "./CartContents";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { GiftNote } from "./GiftNote";
import { UpsellRail } from "./UpsellRail";
import styles from "./Cart.module.css";

/** Full cart page: same pieces as the drawer, laid out with the summary beside the lines. */
export function CartPageView({ extras }: { extras: CartExtras }) {
  const { cart, loaded, pending } = useCart();

  if (!loaded && !cart) {
    return (
      <div className={styles.pageGrid} aria-busy="true">
        <div className={styles.pageMain}>
          <Skeleton height={22} />
          <Skeleton height={120} />
        </div>
        <Skeleton height={220} />
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className={styles.pageEmpty}>
        <EmptyCart suggestions={extras.suggestions} />
      </div>
    );
  }

  return (
    <div className={styles.pageGrid}>
      <div className={styles.pageMain}>
        <FreeShippingMeter subtotal={cart.cost.subtotal} threshold={extras.threshold} />
        <StatusLine />
        <ul className={styles.lines} aria-label="Items in your cart">
          {cart.lines.map((l) => (
            <CartLineItem key={l.id} line={l} />
          ))}
        </ul>
        <UpsellRail products={extras.pairings} size="roomy" />
      </div>
      <aside className={styles.pageAside} aria-label="Order summary">
        <GiftNote attributes={cart.attributes} />
        <CartSummary cart={cart} pending={pending} shopPay={extras.shopPay} />
      </aside>
    </div>
  );
}
