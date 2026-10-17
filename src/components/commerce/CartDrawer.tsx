"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { formatMoney } from "@/lib/data/money";
import type { Money } from "@/lib/data/types";
import { useCart } from "./CartProvider";
import { CartLineItem, CheckoutButton, FreeShippingMeter, GiftNote, ShopPaySlot, UpsellRail, type UpsellItem } from "./CartParts";
import styles from "./CartDrawer.module.css";

export type EmptyCartTea = { handle: string; title: string; eyebrow: string; tin: { url: string; alt: string } | null };

/**
 * 480 px drawer from the right (full width on phones): focus trapped, Esc closes, focus returns to the trigger.
 * Opens automatically on add to cart. Checkout footer stays pinned.
 */
export function CartDrawer({
  threshold,
  upsell,
  emptyTeas,
  shopPay,
}: {
  threshold: Money;
  upsell: UpsellItem[];
  emptyTeas: EmptyCartTea[];
  shopPay: boolean;
}) {
  const { cart, open, setOpen, error, retry } = useCart();
  const count = cart?.totalQuantity ?? 0;
  const empty = !cart || cart.lines.length === 0;

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
            <p className="heading-3">Your cart is empty. Which matcha today?</p>
            <div className={styles.emptyGrid}>
              {emptyTeas.map((t) => (
                <Link key={t.handle} href={`/products/${t.handle}`} className={styles.emptyCard} onClick={() => setOpen(false)}>
                  <span className={styles.emptyImg}>
                    {t.tin ? <Image src={t.tin.url} alt="" fill sizes="200px" className={styles.contain} /> : null}
                  </span>
                  <span className="label">{t.eyebrow}</span>
                  <span className="body-small">{t.title}</span>
                </Link>
              ))}
            </div>
            <Button href="/collections/matcha" size="xl" fullWidth>
              Shop matcha
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
              <div className={styles.divided}>
                <GiftNote cart={cart} idSuffix="-drawer" />
              </div>
            </div>
            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <span className={styles.amount}>{formatMoney(cart.subtotal)}</span>
              </div>
              <p className="body-small">AUD, incl. GST. Shipping and discount codes are calculated at checkout.</p>
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
