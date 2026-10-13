"use client";

import { useEffect, useState } from "react";
import { RouteChange } from "@/components/layout/RouteChange";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Frame";
import { CartBody, CartFooter, EmptyCart, useCartIsEmpty, type CartExtras } from "./CartContents";
import { useCart } from "./CartProvider";
import styles from "./Cart.module.css";

export function CartDrawer({ extras }: { extras: CartExtras }) {
  const { isOpen, close, cart, loaded } = useCart();
  const empty = useCartIsEmpty();
  const count = cart?.totalQuantity ?? 0;
  // The full cart page replaces the drawer there.
  const [onCartPage, setOnCartPage] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setOnCartPage(window.location.pathname === "/cart"), 0);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <RouteChange
        onChange={(p) => {
          setOnCartPage(p === "/cart");
          close();
        }}
      />
      <Dialog open={isOpen && !onCartPage} onClose={close} placement="right" title={`Your cart (${count})`} closeLabel="Close cart">
        <div className={styles.drawer}>
          <div className={styles.drawerScroll}>
            {!loaded && !cart ? (
              <div className={styles.loading} aria-busy="true">
                <Skeleton height={22} />
                <Skeleton height={96} />
              </div>
            ) : empty ? (
              <EmptyCart suggestions={extras.suggestions} onNavigate={close} />
            ) : (
              <CartBody extras={extras} onNavigate={close} />
            )}
          </div>
          {!empty ? (
            <div className={styles.drawerFooter}>
              <CartFooter extras={extras} />
              <Button variant="link" onClick={close} className={styles.keepShopping}>
                Keep shopping
              </Button>
            </div>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
