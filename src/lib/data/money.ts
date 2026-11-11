import type { Money } from "./types";

const formatter = new Intl.NumberFormat("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** `$48.00`, or null while the price is a placeholder or missing: an unconfirmed price is never rendered. */
export function priceLabel(m: Money | null | undefined): string | null {
  if (!m || m.placeholder) return null;
  return `$${formatter.format(m.amount)}`;
}

export function money(amount: number, placeholder = false): Money {
  return { amount: Math.round(amount * 100) / 100, currencyCode: "AUD", placeholder: placeholder || undefined };
}

export function addMoney(a: Money, b: Money): Money {
  return money(a.amount + b.amount, Boolean(a.placeholder || b.placeholder));
}

export function multiplyMoney(m: Money, factor: number): Money {
  return money(m.amount * factor, Boolean(m.placeholder));
}

export function zeroMoney(placeholder = false): Money {
  return money(0, placeholder);
}
