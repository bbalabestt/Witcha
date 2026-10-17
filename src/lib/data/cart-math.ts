import { addMoney, multiplyMoney, zeroMoney } from "./money";
import type { Cart, CartLine, Money } from "./types";

export function lineCost(line: Pick<CartLine, "variant" | "quantity">): Money {
  return multiplyMoney(line.variant.price, line.quantity);
}

export function cartTotals(lines: CartLine[], placeholder: boolean): Pick<Cart, "subtotal" | "totalQuantity"> {
  return {
    subtotal: lines.reduce((sum, l) => addMoney(sum, l.cost), zeroMoney(placeholder)),
    totalQuantity: lines.reduce((n, l) => n + l.quantity, 0),
  };
}

/** Caps a requested quantity to known stock; unknown stock is uncapped. */
export function capQuantity(requested: number, available: number | null): number {
  const q = Math.max(0, Math.trunc(requested));
  return available === null ? q : Math.min(q, Math.max(0, available));
}

export type MeterState = { kind: "empty" | "progress" | "reached"; remaining: Money; percent: number };

/** Free-shipping meter: sentence + 4 px track; states empty, in progress, reached. */
export function freeShippingMeter(subtotal: Money, threshold: Money): MeterState {
  const remaining = Math.max(0, threshold.amount - subtotal.amount);
  const percent = threshold.amount <= 0 ? 100 : Math.min(100, (subtotal.amount / threshold.amount) * 100);
  const kind = subtotal.amount <= 0 ? "empty" : remaining <= 0 ? "reached" : "progress";
  return { kind, remaining: { ...threshold, amount: Math.round(remaining * 100) / 100 }, percent };
}

export function cartBlocked(cart: Cart): boolean {
  return cart.lines.some((l) => !l.variant.availableForSale);
}
