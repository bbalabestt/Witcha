"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaThumb";
import { productEyebrow } from "@/lib/data/product";
import type { Money, Product } from "@/lib/data/types";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import { CartSummary } from "./CartSummary";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { GiftNote } from "./GiftNote";
import { UpsellRail } from "./UpsellRail";
import styles from "./Cart.module.css";

export type CartExtras = {
  threshold: Money;
  pairings: Product[];
  /** Teas suggested in the empty state. */
  suggestions: Product[];
  shopPay: boolean;
};

export function StatusLine() {
  const { status, clearStatus } = useCart();
  if (!status) return null;
  return (
    <div className={status.tone === "error" ? styles.statusError : styles.statusInfo} role={status.tone === "error" ? "alert" : "status"}>
      <p>{status.message}</p>
      <div className={styles.statusActions}>
        {status.retry ? (
          <Button variant="link" onClick={status.retry}>
            Try again
          </Button>
        ) : null}
        <Button variant="link" onClick={clearStatus}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

export function EmptyCart({ suggestions, onNavigate }: { suggestions: Product[]; onNavigate?: () => void }) {
  return (
    <div className={styles.empty}>
      <p className="heading-3">Your cart is empty. Which matcha today?</p>
      {suggestions.length ? (
        <ul className={styles.suggestions}>
          {suggestions.slice(0, 2).map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.handle}`} className={styles.suggestion} onClick={onNavigate}>
                <MediaFrame media={p.media[0] ?? null} ratio="4:5" sizes="200px" />
                <span className={styles.eyebrow}>{productEyebrow(p)}</span>
                <span>{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Button href="/collections/matcha" size="xl" fullWidth>
        Shop Matcha
      </Button>
    </div>
  );
}

/** Lines, meter, pair-with and gift note: shared by the drawer and the cart page. */
export function CartBody({ extras, onNavigate }: { extras: CartExtras; onNavigate?: () => void }) {
  const { cart } = useCart();
  if (!cart || cart.lines.length === 0) return null;
  return (
    <>
      <FreeShippingMeter subtotal={cart.cost.subtotal} threshold={extras.threshold} />
      <StatusLine />
      <ul className={styles.lines} aria-label="Items in your cart">
        {cart.lines.map((l) => (
          <CartLineItem key={l.id} line={l} onNavigate={onNavigate} />
        ))}
      </ul>
      <UpsellRail products={extras.pairings} />
      <GiftNote attributes={cart.attributes} />
    </>
  );
}

export function CartFooter({ extras }: { extras: CartExtras }) {
  const { cart, pending } = useCart();
  if (!cart || cart.lines.length === 0) return null;
  return <CartSummary cart={cart} pending={pending} shopPay={extras.shopPay} />;
}

export function useCartIsEmpty(): boolean {
  const { cart } = useCart();
  return !cart || cart.lines.length === 0;
}
