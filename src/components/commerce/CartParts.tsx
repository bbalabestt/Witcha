"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cartBlocked, freeShippingMeter } from "@/lib/data/cart-math";
import { formatMoney } from "@/lib/data/money";
import { GIFT_NOTE_MAX } from "@/lib/data/repository";
import type { Cart, CartLine as Line, Money } from "@/lib/data/types";
import { useCart, type LinePreview } from "./CartProvider";
import styles from "./CartParts.module.css";

export function FreeShippingMeter({ subtotal, threshold }: { subtotal: Money; threshold: Money }) {
  const m = freeShippingMeter(subtotal, threshold);
  return (
    <div className={styles.meter}>
      <p className={styles.meterText}>
        {m.kind === "reached" ? <Icon name="check" size={18} /> : null}
        {m.kind === "reached" ? "Free shipping unlocked." : `You’re ${formatMoney(m.remaining)} away from free shipping.`}
      </p>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Progress to free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(m.percent)}
      >
        <div className={styles.fill} style={{ width: `${m.percent}%` }} />
      </div>
    </div>
  );
}

export function CartLineItem({ line }: { line: Line }) {
  const { setQuantity, remove, setOpen } = useCart();
  const max = line.variant.quantityAvailable;
  const capped = max !== null && line.quantity >= max;
  const soldOut = !line.variant.availableForSale;
  const pending = line.id.startsWith("optimistic-");
  return (
    <li className={styles.line} data-muted={soldOut || undefined} aria-busy={pending || undefined}>
      <span className={styles.thumb}>
        {line.product.tin ? <Image src={line.product.tin.url} alt="" fill sizes="80px" className={styles.contain} /> : null}
      </span>
      <div className={styles.lineBody}>
        <div className={styles.lineTop}>
          <span className="label">{line.product.eyebrow}</span>
          <span className={styles.linePrice}>{formatMoney(line.cost)}</span>
        </div>
        <Link href={`/products/${line.product.handle}`} className={styles.lineName} onClick={() => setOpen(false)}>
          {line.product.title}
        </Link>
        {line.variant.title ? <span className="body-small">{line.variant.title}</span> : null}
        <div className={styles.lineActions}>
          <div className={styles.stepper} role="group" aria-label={`Quantity, ${line.product.title}`}>
            <button type="button" aria-label="Decrease quantity" disabled={pending || line.quantity <= 1} onClick={() => setQuantity(line.id, line.quantity - 1)}>
              <Icon name="minus" size={18} />
            </button>
            <output aria-live="polite">{line.quantity}</output>
            <button type="button" aria-label="Increase quantity" disabled={pending || capped || soldOut} onClick={() => setQuantity(line.id, line.quantity + 1)}>
              <Icon name="plus" size={18} />
            </button>
          </div>
          <button type="button" className={styles.remove} disabled={pending} onClick={() => remove(line.id)}>
            Remove
          </button>
        </div>
        {capped && !soldOut ? <p className="body-small">Only {max} available</p> : null}
        {soldOut ? (
          <p className={styles.lineError}>
            <Icon name="alert" size={18} />
            Sold out. Remove it to check out.
          </p>
        ) : null}
      </div>
    </li>
  );
}

export type UpsellItem = LinePreview & { label: string };

export function UpsellRail({ items, compact = false }: { items: UpsellItem[]; compact?: boolean }) {
  const { add, cart } = useCart();
  const visible = items.filter((i) => !cart?.lines.some((l) => l.merchandiseId === i.merchandiseId));
  if (visible.length === 0) return null;
  return (
    <div className={styles.upsell}>
      <span className="label">Pair with</span>
      {visible.map((i) => (
        <div key={i.merchandiseId} className={styles.upsellItem}>
          <span className={styles.upsellThumb} aria-hidden="true" />
          <span className={styles.upsellText}>
            <span className={compact ? "body-small" : undefined}>{i.title}</span>
            <span className="body-small">{formatMoney(i.price)}</span>
          </span>
          <button type="button" className={styles.upsellAdd} onClick={() => void add(i, 1, { openDrawer: true })} aria-label={`Add ${i.title}`}>
            Add
          </button>
        </div>
      ))}
    </div>
  );
}

export function GiftNote({ cart, idSuffix }: { cart: Cart; idSuffix: string }) {
  const { setGift } = useCart();
  const [note, setNote] = useState(cart.giftNote);
  const [confirmed, setConfirmed] = useState(cart.giftNote);
  const noteId = useId() + idSuffix;

  // Keep the field in step when the server confirms a different note.
  if (confirmed !== cart.giftNote) {
    setConfirmed(cart.giftNote);
    setNote(cart.giftNote);
  }

  return (
    <div className={styles.gift}>
      <label className={styles.giftToggle}>
        <input type="checkbox" checked={cart.gift} onChange={(e) => setGift(e.target.checked, note)} className={styles.giftInput} />
        <span className={styles.box} aria-hidden="true">
          <Icon name="check" size={14} strokeWidth={2} />
        </span>
        <span className={styles.giftLabel}>
          <Icon name="gift" size={20} />
          This is a gift
        </span>
      </label>
      {cart.gift ? (
        <div className={styles.giftNote}>
          <div className={styles.giftRow}>
            <label htmlFor={noteId} className={styles.fieldLabel}>
              Gift note
            </label>
            <span className="body-small">
              {note.length} / {GIFT_NOTE_MAX}
            </span>
          </div>
          <textarea
            id={noteId}
            rows={3}
            maxLength={GIFT_NOTE_MAX}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, GIFT_NOTE_MAX))}
            onBlur={() => note !== cart.giftNote && setGift(true, note)}
            className={styles.textarea}
          />
          <span className="body-small">No prices on the packing slip.</span>
        </div>
      ) : null}
    </div>
  );
}

export function CheckoutButton({ cart }: { cart: Cart }) {
  const { updating } = useCart();
  const blocked = cartBlocked(cart);
  const disabled = updating || blocked || !cart.checkoutUrl;
  return (
    <button
      type="button"
      className={`${styles.checkout} on-primary`}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={() => {
        // Shopify-hosted checkout, same tab (brief §4).
        if (!disabled) window.location.assign(cart.checkoutUrl);
      }}
    >
      {updating ? <span className={styles.spinner} aria-hidden="true" /> : <Icon name="lock" size={18} />}
      {updating ? "Updating…" : "Checkout"}
    </button>
  );
}

export function ShopPaySlot({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return (
      <div role="note" className={styles.shopPay}>
        Shop Pay slot · rendered by Shopify
      </div>
    );
  }
  // Wired when the Shopify component is configured (SHOP_PAY=on); never a drawn wallet button.
  return <div role="note" className={styles.shopPay} data-shop-pay="" />;
}
