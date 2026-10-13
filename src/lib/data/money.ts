import type { Money } from "./types";

/** Parses a Shopify decimal string ("48.0", "48.00") into minor units without float drift. */
export function toMinorUnits(decimal: string): number {
  const trimmed = decimal.trim();
  const negative = trimmed.startsWith("-");
  const [whole = "0", frac = ""] = trimmed.replace(/^-/, "").split(".");
  const cents = Number.parseInt(whole || "0", 10) * 100 + Number.parseInt((frac + "00").slice(0, 2), 10);
  if (!Number.isFinite(cents)) return 0;
  return negative ? -cents : cents;
}

export function money(amount: number, currencyCode = "AUD", placeholder = false): Money {
  return placeholder ? { amount, currencyCode, placeholder: true } : { amount, currencyCode };
}

export function zero(currencyCode = "AUD"): Money {
  return { amount: 0, currencyCode };
}

/** Placeholder-ness is contagious: any stand-in figure makes the result a stand-in. */
export function addMoney(a: Money, b: Money): Money {
  return money(a.amount + b.amount, a.currencyCode, Boolean(a.placeholder || b.placeholder));
}

export function multiplyMoney(m: Money, by: number): Money {
  return money(Math.round(m.amount * by), m.currencyCode, Boolean(m.placeholder));
}

export function subtractMoney(a: Money, b: Money): Money {
  return money(a.amount - b.amount, a.currencyCode, Boolean(a.placeholder || b.placeholder));
}

export function sumMoney(items: Money[], currencyCode = "AUD"): Money {
  return items.reduce<Money>((acc, m) => addMoney(acc, m), zero(currencyCode));
}

/** Compare-at is shown only when strictly higher than the price. */
export function effectiveCompareAt(price: Money, compareAt: Money | null | undefined): Money | null {
  if (!compareAt) return null;
  if (compareAt.currencyCode !== price.currencyCode) return null;
  return compareAt.amount > price.amount ? compareAt : null;
}

const formatters = new Map<string, Intl.NumberFormat>();

function numberFormat(): Intl.NumberFormat {
  const key = "en-AU";
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(key, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    formatters.set(key, f);
  }
  return f;
}

/** "$48.00", or "$[48.00]" for placeholder figures (prototype convention). AUD shows a bare $. */
export function formatMoney(m: Money): string {
  const symbol = m.currencyCode === "AUD" ? "$" : `${m.currencyCode} `;
  const sign = m.amount < 0 ? "-" : "";
  const value = numberFormat().format(Math.abs(m.amount) / 100);
  return m.placeholder ? `${sign}${symbol}[${value}]` : `${sign}${symbol}${value}`;
}

/** Price ÷ servings; null when either input is missing (the line is then hidden). */
export function perCup(price: Money, servings: number | null | undefined): Money | null {
  if (!servings || servings <= 0 || price.amount <= 0) return null;
  return money(Math.round(price.amount / servings), price.currencyCode, Boolean(price.placeholder));
}
