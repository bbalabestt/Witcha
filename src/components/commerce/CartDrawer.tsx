"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { LIVE } from "@/lib/config/launch";
import { TEAS_HREF } from "@/lib/config/site";
import { priceLabel } from "@/lib/data/money";
import type { Money } from "@/lib/data/types";
import { useCart } from "./CartProvider";
import { CartLineItem, CheckoutButton, FreeShippingMeter, GiftNote, ShopPaySlot, UpsellRail, type UpsellItem } from "./CartParts";
import styles from "./CartDrawer.module.css";

/**
 * 480 px drawer from the right (full width on phones): focus trapped, Esc closes, focus returns to the trigger.
 * Opens automatically on add to cart. Checkout footer stays pinned.
 */
export function CartDrawer({ threshold, upsell, shopPay }: { threshold: Money | null; upsell: UpsellItem[]; shopPay: boolean }) {
  const { cart, open, setOpen, error, retry } = useCart();
  const count = cart?.totalQuantity ?? 0;
  const empty = !cart || cart.lines.length === 0;
  const subtotal = cart ? priceLabel(cart.subtotal) : null;

  return (
    <Dialog open={open} onClose={() => setOpen(false)} placement="right" title={`Your cart (${count})`} closeLabel="Close cart">
      <div className={styles.layout}>
        {error ? (
          <div className={styles.error} role="alert">
            <span>{error}</span>
            <button type="button" className="text-link" onClick={retry}>
              Try again
            </button>
          </div>
        ) : null}
        {empty ? (
          <div className={styles.empty}>
            <p className="heading-3">Nothing brewing yet.</p>
            <Button href={TEAS_HREF} size="xl" fullWidth>
              Shop the teas
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.scroll}>
              <FreeShippingMeter subtotal={cart.subtotal} threshold={threshold} />
              <ul className={styles.lines}>
                {cart.lines.map((l) => (
                  <CartLineItem key={l.id} line={l} />
                ))}
              </ul>
              <UpsellRail items={upsell} compact />
              {LIVE.gifts ? (
                <div className={styles.divided}>
                  <GiftNote cart={cart} idSuffix="-drawer" />
                </div>
              ) : null}
            </div>
            <div className={styles.footer}>
              {subtotal ? (
                <div className={styles.subtotal}>
                  <span>Subtotal</span>
                  <span className={styles.amount}>{subtotal}</span>
                </div>
              ) : null}
              <CheckoutButton cart={cart} />
              <ShopPaySlot enabled={shopPay} />
              <div className={styles.links}>
                <Link href="/cart" className="label-link" onClick={() => setOpen(false)}>
                  View cart
                </Link>
                <button type="button" className="label-link" onClick={() => setOpen(false)}>
                  Keep shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
