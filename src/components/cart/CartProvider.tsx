"use client";

import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import { addToCart, fetchCart, removeCartLine, updateCartLine, updateGift, type CartActionResult } from "@/lib/cart/actions";
import { applyCartOp, type CartOp } from "@/lib/cart/optimistic";
import type { Cart, CartAttributes, CartLineMerchandise } from "@/lib/data/types";

type Status = { tone: "info" | "error"; message: string; retry?: () => void } | null;

type CartContextValue = {
  /** Optimistic cart; null until the first load resolves (and when the shopper has no cart). */
  cart: Cart | null;
  loaded: boolean;
  pending: boolean;
  isOpen: boolean;
  status: Status;
  open: () => void;
  close: () => void;
  addItem: (merchandise: CartLineMerchandise, quantity: number) => Promise<CartActionResult>;
  updateQuantity: (lineId: string, quantity: number) => Promise<CartActionResult>;
  removeLine: (lineId: string) => Promise<CartActionResult>;
  setAttributes: (attributes: CartAttributes) => Promise<CartActionResult>;
  clearStatus: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [optimisticCart, applyOptimistic] = useOptimistic<Cart | null, CartOp>(cart, applyCartOp);
  const [pending, startCartTransition] = useTransition();
  const [isOpen, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const loading = useRef(false);
  const runRef = useRef<((op: CartOp, action: () => Promise<CartActionResult>, failure: string) => Promise<CartActionResult>) | null>(null);

  useEffect(() => {
    const load = () => {
      if (loading.current) return;
      loading.current = true;
      fetchCart()
        .then((c) => {
          // Transition: React finishes hydrating streamed boundaries before applying it, instead of
          // discarding their server HTML (hydration error #418 under slow CPUs).
          startTransition(() => {
            setCart(c);
            setLoaded(true);
          });
        })
        .catch(() => startTransition(() => setLoaded(true)))
        .finally(() => {
          loading.current = false;
        });
    };
    load();
    // Back/forward cache and other tabs can change the cart.
    const onShow = (e: PageTransitionEvent) => e.persisted && load();
    const onVisible = () => document.visibilityState === "visible" && load();
    window.addEventListener("pageshow", onShow);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const run = useCallback(
    (op: CartOp, action: () => Promise<CartActionResult>, failure: string): Promise<CartActionResult> =>
      new Promise((resolve) => {
        setStatus(null);
        startCartTransition(async () => {
          applyOptimistic(op);
          let result: CartActionResult;
          try {
            result = await action();
          } catch {
            result = { ok: false, error: "No connection. Check your internet and try again." };
          }
          if (result.ok) {
            const next = result.cart;
            startCartTransition(() => setCart(next));
            if (result.notice) setStatus({ tone: "info", message: result.notice });
          } else {
            // The optimistic change falls away when the transition ends: that is the rollback.
            const retry = () => void runRef.current?.(op, action, failure);
            setStatus({ tone: "error", message: `${failure} ${result.error}`, retry });
          }
          resolve(result);
        });
      }),
    [applyOptimistic],
  );

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart: optimisticCart,
      loaded,
      pending,
      isOpen,
      status,
      open: () => setOpen(true),
      close: () => setOpen(false),
      addItem: (merchandise, quantity) => {
        setOpen(true);
        return run({ type: "add", merchandise, quantity }, () => addToCart([{ variantId: merchandise.variantId, quantity }]), `${merchandise.productTitle} wasn’t added.`);
      },
      updateQuantity: (lineId, quantity) => run({ type: "update", lineId, quantity }, () => updateCartLine(lineId, quantity), "Quantity not changed."),
      removeLine: (lineId) => run({ type: "remove", lineId }, () => removeCartLine(lineId), "Item not removed."),
      setAttributes: (attributes) => run({ type: "attributes", attributes }, () => updateGift(attributes), "Gift note not saved."),
      clearStatus: () => setStatus(null),
    }),
    [optimisticCart, loaded, pending, isOpen, status, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
