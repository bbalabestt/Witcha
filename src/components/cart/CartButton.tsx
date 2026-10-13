"use client";

import { Icon } from "@/components/ui/Icon";
import { useCart } from "./CartProvider";
import styles from "@/components/layout/Header.module.css";

/** Header cart control: opens the drawer; the count is announced politely as it changes. */
export function CartButton() {
  const { cart, open } = useCart();
  const count = cart?.totalQuantity ?? 0;
  const label = count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty";
  return (
    <button type="button" className={styles.iconLink} aria-label={label} aria-haspopup="dialog" onClick={open}>
      <Icon name="cart" />
      {count > 0 ? (
        <span className={styles.count} aria-hidden="true">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
      <span className="visually-hidden" aria-live="polite">
        {count > 0 ? `${count} in cart` : ""}
      </span>
    </button>
  );
}
