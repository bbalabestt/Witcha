import { multiplyMoney, sumMoney, zero } from "@/lib/data/money";
import { productEyebrow } from "@/lib/data/product";
import type { Cart, CartAttributes, CartLine, CartLineMerchandise, Money, Product, Variant } from "@/lib/data/types";

/**
 * Pure cart maths used for optimistic updates. The server cart always replaces the optimistic one
 * when the mutation settles; on failure the optimistic state simply falls away (rollback).
 */

export type CartOp =
  | { type: "add"; merchandise: CartLineMerchandise; quantity: number }
  | { type: "update"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string }
  | { type: "attributes"; attributes: CartAttributes };

export const OPTIMISTIC_PREFIX = "optimistic:";
export const MAX_LINE_QUANTITY = 99;

export function lineCap(m: Pick<CartLineMerchandise, "quantityAvailable">): number {
  return m.quantityAvailable !== null && m.quantityAvailable > 0 ? Math.min(m.quantityAvailable, MAX_LINE_QUANTITY) : MAX_LINE_QUANTITY;
}

export function merchandiseFor(product: Pick<Product, "handle" | "title" | "kind" | "taste" | "media">, variant: Variant): CartLineMerchandise {
  return {
    variantId: variant.id,
    productHandle: product.handle,
    productTitle: product.title,
    productKind: product.kind,
    eyebrow: productEyebrow(product),
    size: variant.size,
    image: variant.image ?? product.media[0] ?? null,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable,
  };
}

function withTotals(base: Cart, lines: CartLine[], currencyCode: string): Cart {
  const subtotal: Money = lines.length ? sumMoney(lines.map((l) => l.cost.total), currencyCode) : zero(currencyCode);
  return {
    ...base,
    lines,
    totalQuantity: lines.reduce((n, l) => n + l.quantity, 0),
    cost: { subtotal, total: subtotal },
  };
}

export const EMPTY_CART: Cart = {
  id: "",
  checkoutUrl: "",
  lines: [],
  totalQuantity: 0,
  cost: { subtotal: zero(), total: zero() },
  attributes: { gift: false, giftNote: "" },
  note: "",
};

export function applyCartOp(cart: Cart | null, op: CartOp): Cart {
  const base = cart ?? EMPTY_CART;
  const currency = base.cost.subtotal.currencyCode;
  switch (op.type) {
    case "add": {
      const existing = base.lines.find((l) => l.merchandise.variantId === op.merchandise.variantId);
      const cap = lineCap(op.merchandise);
      const lines = existing
        ? base.lines.map((l) => {
            if (l !== existing) return l;
            const quantity = Math.min(cap, l.quantity + op.quantity);
            return { ...l, quantity, cost: { total: multiplyMoney(l.merchandise.price, quantity) } };
          })
        : [
            ...base.lines,
            {
              id: `${OPTIMISTIC_PREFIX}${op.merchandise.variantId}`,
              quantity: Math.min(cap, op.quantity),
              merchandise: op.merchandise,
              cost: { total: multiplyMoney(op.merchandise.price, Math.min(cap, op.quantity)) },
            },
          ];
      return withTotals(base, lines, op.merchandise.price.currencyCode || currency);
    }
    case "update": {
      if (op.quantity <= 0) return applyCartOp(base, { type: "remove", lineId: op.lineId });
      const lines = base.lines.map((l) => {
        if (l.id !== op.lineId) return l;
        const quantity = Math.min(lineCap(l.merchandise), Math.trunc(op.quantity));
        return { ...l, quantity, cost: { total: multiplyMoney(l.merchandise.price, quantity) } };
      });
      return withTotals(base, lines, currency);
    }
    case "remove":
      return withTotals(
        base,
        base.lines.filter((l) => l.id !== op.lineId),
        currency,
      );
    case "attributes":
      return { ...base, attributes: { gift: op.attributes.gift, giftNote: op.attributes.giftNote.slice(0, 150) } };
  }
}

export type MeterState = { kind: "progress"; remaining: Money; percent: number } | { kind: "reached"; percent: 100 };

/** Free-shipping meter from the same threshold the announcement bar and shipping promise use. */
export function freeShippingMeter(subtotal: Money, threshold: Money): MeterState {
  if (threshold.amount <= 0 || subtotal.amount >= threshold.amount) return { kind: "reached", percent: 100 };
  const remaining: Money = {
    amount: threshold.amount - subtotal.amount,
    currencyCode: threshold.currencyCode,
    ...(threshold.placeholder || subtotal.placeholder ? { placeholder: true } : {}),
  };
  return { kind: "progress", remaining, percent: Math.max(0, Math.min(100, (subtotal.amount / threshold.amount) * 100)) };
}
