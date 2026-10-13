"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Frame";
import { CartBody, CartFooter, EmptyCart, useCartIsEmpty, type CartExtras } from "./CartContents";
import { useCart } from "./CartProvider";
import styles from "./Cart.module.css";

export function CartDrawer({ extras }: { extras: CartExtras }) {
  const { isOpen, close, cart, loaded } = useCart();
  const empty = useCartIsEmpty();
  const pathname = usePathname();
  const count = cart?.totalQuantity ?? 0;

  // The full cart page replaces the drawer; close on any navigation.
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on route change only
  }, [pathname]);

  return (
    <Dialog open={isOpen && pathname !== "/cart"} onClose={close} placement="right" title={`Your cart (${count})`} closeLabel="Close cart">
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
  );
}
