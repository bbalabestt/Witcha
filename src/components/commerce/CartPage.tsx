"use client";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Frame";
import { LIVE } from "@/lib/config/launch";
import { TEAS_HREF } from "@/lib/config/site";
import { priceLabel } from "@/lib/data/money";
import type { Money } from "@/lib/data/types";
import { useCart } from "./CartProvider";
import { CartLineItem, CheckoutButton, FreeShippingMeter, GiftNote, ShopPaySlot, UpsellRail, type UpsellItem } from "./CartParts";
import styles from "./CartPage.module.css";

/** Same pieces as the drawer, in two columns. */
export function CartPageView({ threshold, upsell, shopPay }: { threshold: Money | null; upsell: UpsellItem[]; shopPay: boolean }) {
  const { cart, ready, error, retry } = useCart();
  const count = cart?.totalQuantity ?? 0;

  if (!ready) {
    return (
      <div className={styles.layout} aria-busy="true" aria-label="Loading your cart">
        <div className={styles.lines}>
          {[0, 1].map((i) => (
            <div key={i} className={styles.skeletonLine}>
              <Skeleton width={80} ratio="4:5" />
              <div className={styles.skeletonText}>
                <Skeleton width="40%" height={16} />
                <Skeleton width="70%" height={26} />
                <Skeleton width={132} height={44} />
              </div>
            </div>
          ))}
        </div>
        <Skeleton height={280} />
      </div>
    );
  }

  return (
    <>
      <h1 className="heading-1">Your cart ({count})</h1>
      {error ? (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button type="button" className="text-link" onClick={retry}>
            Try again
          </button>
        </div>
      ) : null}
      {!cart || cart.lines.length === 0 ? (
        <div className={styles.empty}>
          <p className="heading-3">Nothing brewing yet.</p>
          <Button href={TEAS_HREF} size="xl">
            Shop the teas
          </Button>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.lines}>
            <FreeShippingMeter subtotal={cart.subtotal} threshold={threshold} />
            <ul className={styles.list}>
              {cart.lines.map((l) => (
                <CartLineItem key={l.id} line={l} />
              ))}
            </ul>
            <UpsellRail items={upsell} />
          </div>
          <aside className={styles.summary} aria-label="Summary">
            <span className="label">Summary</span>
            {priceLabel(cart.subtotal) ? (
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <span className={styles.amount}>{priceLabel(cart.subtotal)}</span>
              </div>
            ) : null}
            {LIVE.gifts ? (
              <div className={styles.divided}>
                <GiftNote cart={cart} idSuffix="-page" />
              </div>
            ) : null}
            <CheckoutButton cart={cart} />
            <ShopPaySlot enabled={shopPay} />
          </aside>
        </div>
      )}
    </>
  );
}
