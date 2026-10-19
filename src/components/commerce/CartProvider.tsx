"use client";

import { createContext, startTransition, Suspense, use, useCallback, useContext, useEffect, useMemo, useOptimistic, useRef, useState, type ReactNode } from "react";
import { addToCart, refreshCart, removeLine, updateGift, updateLineQuantity, type CartResult } from "@/lib/cart/actions";
import { cartTotals, lineCost } from "@/lib/data/cart-math";
import type { Cart, CartLine, Image, Money, ProductKind } from "@/lib/data/types";
import { useToast } from "@/components/ui/Toast";
import { emitFamiliar } from "@/components/motion/familiar-events";

/** What the drawer needs to draw a line before the server confirms it. */
export type LinePreview = {
  merchandiseId: string;
  handle: string;
  title: string;
  kind: ProductKind;
  eyebrow: string;
  tin: Image | null;
  variantTitle: string;
  price: Money;
  quantityAvailable: number | null;
};

export type CartOp =
  | { type: "add"; preview: LinePreview; quantity: number }
  | { type: "quantity"; lineId: string; quantity: number }
  | { type: "gift"; gift: boolean; note: string };

function emptyCart(placeholder: boolean): Cart {
  return { id: "", checkoutUrl: "", lines: [], totalQuantity: 0, subtotal: { amount: 0, currencyCode: "AUD", placeholder }, gift: false, giftNote: "" };
}

/** Pure optimistic reducer; exported for tests. */
export function applyCartOp(cart: Cart | null, op: CartOp): Cart {
  const base = cart ?? emptyCart(op.type === "add" ? Boolean(op.preview.price.placeholder) : false);
  let lines: CartLine[] = base.lines;
  if (op.type === "add") {
    const existing = lines.find((l) => l.merchandiseId === op.preview.merchandiseId);
    const cap = op.preview.quantityAvailable;
    if (existing) {
      lines = lines.map((l) => {
        if (l !== existing) return l;
        const quantity = cap === null ? l.quantity + op.quantity : Math.min(cap, l.quantity + op.quantity);
        return { ...l, quantity, cost: lineCost({ variant: l.variant, quantity }) };
      });
    } else {
      const p = op.preview;
      const variant = { title: p.variantTitle, price: p.price, availableForSale: true, quantityAvailable: p.quantityAvailable };
      lines = [
        ...lines,
        {
          id: `optimistic-${p.merchandiseId}`,
          merchandiseId: p.merchandiseId,
          quantity: op.quantity,
          cost: lineCost({ variant, quantity: op.quantity }),
          product: { handle: p.handle, title: p.title, kind: p.kind, eyebrow: p.eyebrow, tin: p.tin },
          variant,
        },
      ];
    }
  } else if (op.type === "quantity") {
    lines = lines
      .map((l) => (l.id === op.lineId ? { ...l, quantity: op.quantity, cost: lineCost({ variant: l.variant, quantity: op.quantity }) } : l))
      .filter((l) => l.quantity > 0);
  } else {
    return { ...base, gift: op.gift, giftNote: op.gift ? op.note : "" };
  }
  return { ...base, lines, ...cartTotals(lines, Boolean(base.subtotal.placeholder)) };
}

type CartContextValue = {
  cart: Cart | null;
  ready: boolean;
  /** True while any cart mutation is in flight (checkout shows "Updating…"). */
  updating: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (preview: LinePreview, quantity: number, options?: { openDrawer?: boolean }) => Promise<boolean>;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  setGift: (gift: boolean, note: string) => void;
  error: string | null;
  retry: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ cartPromise, children }: { cartPromise: Promise<Cart | null>; children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [inFlight, setInFlight] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [optimistic, apply] = useOptimistic(cart, applyCartOp);
  const toast = useToast();
  const lastFailed = useRef<{ op: CartOp; action: () => Promise<CartResult> } | null>(null);

  const hydrate = useCallback((c: Cart | null) => {
    setCart(c);
    setReady(true);
  }, []);

  const run = useCallback(
    (op: CartOp, action: () => Promise<CartResult>): Promise<boolean> =>
      new Promise((resolve) => {
        setInFlight((n) => n + 1);
        startTransition(async () => {
          apply(op);
          const result = await action().catch((): CartResult => ({ ok: false, error: "We couldn’t reach the cart. Check your connection and try again.", cart: null }));
          setInFlight((n) => n - 1);
          if (result.cart !== null || result.ok) setCart(result.cart);
          if (result.ok) {
            setError(null);
            lastFailed.current = null;
          } else {
            setError(result.error);
            lastFailed.current = { op, action };
            toast.show(result.error, "error");
          }
          resolve(result.ok);
        });
      }),
    [apply, toast],
  );

  const add = useCallback<CartContextValue["add"]>(
    async (preview, quantity, options) => {
      const ok = await run({ type: "add", preview, quantity }, () => addToCart(preview.merchandiseId, quantity));
      if (ok) {
        emitFamiliar({ type: "added" });
        if (options?.openDrawer !== false) setOpen(true);
      }
      return ok;
    },
    [run],
  );

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      void run({ type: "quantity", lineId, quantity }, () => updateLineQuantity(lineId, quantity));
    },
    [run],
  );

  const remove = useCallback(
    (lineId: string) => {
      void run({ type: "quantity", lineId, quantity: 0 }, () => removeLine(lineId)).then((ok) => {
        if (ok) toast.show("Removed from your cart.", "success");
      });
    },
    [run, toast],
  );

  const setGift = useCallback(
    (gift: boolean, note: string) => {
      void run({ type: "gift", gift, note }, () => updateGift(gift, note));
    },
    [run],
  );

  const retry = useCallback(() => {
    const failed = lastFailed.current;
    if (failed) void run(failed.op, failed.action);
    else void refreshCart().then(hydrate);
  }, [hydrate, run]);

  const value = useMemo<CartContextValue>(
    () => ({ cart: optimistic, ready, updating: inFlight > 0, open, setOpen, add, setQuantity, remove, setGift, error, retry }),
    [optimistic, ready, inFlight, open, add, setQuantity, remove, setGift, error, retry],
  );

  return (
    <CartContext.Provider value={value}>
      <CartHydrator promise={cartPromise} onCart={hydrate} />
      {children}
    </CartContext.Provider>
  );
}

/** Streams the request's cart in without suspending the page around it. */
function CartHydrator({ promise, onCart }: { promise: Promise<Cart | null>; onCart: (c: Cart | null) => void }) {
  return (
    <Suspense fallback={null}>
      <Hydrate promise={promise} onCart={onCart} />
    </Suspense>
  );
}

function Hydrate({ promise, onCart }: { promise: Promise<Cart | null>; onCart: (c: Cart | null) => void }) {
  const cart = use(promise);
  useEffect(() => onCart(cart), [cart, onCart]);
  return null;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
