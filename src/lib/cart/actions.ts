"use server";

import { getRepository } from "@/lib/data";
import { CartUserError } from "@/lib/data/repository";
import type { Cart, CartAttributes, CartLineInput } from "@/lib/data/types";
import { getBackInStockProvider } from "@/lib/providers";
import { EMAIL_RE } from "@/lib/server/rate-limit";
import { getCartId, readCart, setCartId } from "./server";

export type CartActionResult = { ok: true; cart: Cart; notice?: string } | { ok: false; error: string };

const GENERIC = "We couldn’t update your cart. Check your connection and try again.";
const EXPIRED = "Your cart had expired, so we started a fresh one.";

function fail(err: unknown): CartActionResult {
  if (err instanceof CartUserError) return { ok: false, error: err.message };
  console.error("[cart] mutation failed", err);
  return { ok: false, error: GENERIC };
}

function cleanLines(lines: CartLineInput[]): CartLineInput[] {
  return lines
    .filter((l) => typeof l.variantId === "string" && l.variantId.startsWith("gid://shopify/ProductVariant/"))
    .map((l) => ({ variantId: l.variantId, quantity: Math.min(99, Math.max(1, Math.trunc(Number(l.quantity) || 1))) }))
    .slice(0, 20);
}

/** Current cart for client hydration (never cached). */
export async function fetchCart(): Promise<Cart | null> {
  return readCart();
}

/**
 * Adds lines, creating a cart when there is none or the stored id has expired
 * (never an error for the shopper).
 */
export async function addToCart(lines: CartLineInput[]): Promise<CartActionResult> {
  const clean = cleanLines(lines);
  if (!clean.length) return { ok: false, error: "Choose a size first." };
  const repo = getRepository();
  try {
    const id = await getCartId();
    let cart = id ? await repo.addCartLines(id, clean) : null;
    if (!cart) cart = await repo.createCart(clean);
    await setCartId(cart.id);
    return { ok: true, cart };
  } catch (err) {
    return fail(err);
  }
}

/** Form-friendly wrapper: `<form action>` with hidden `variantId` and `quantity`. */
export async function addToCartForm(_prev: CartActionResult | null, formData: FormData): Promise<CartActionResult> {
  return addToCart([{ variantId: String(formData.get("variantId") ?? ""), quantity: Number(formData.get("quantity") ?? 1) }]);
}

async function withCart(run: (cartId: string) => Promise<Cart | null>): Promise<CartActionResult> {
  const repo = getRepository();
  try {
    const id = await getCartId();
    const cart = id ? await run(id) : null;
    if (cart) return { ok: true, cart };
    const fresh = await repo.createCart();
    await setCartId(fresh.id);
    return { ok: true, cart: fresh, notice: EXPIRED };
  } catch (err) {
    return fail(err);
  }
}

export async function updateCartLine(lineId: string, quantity: number): Promise<CartActionResult> {
  const q = Math.max(0, Math.min(99, Math.trunc(Number(quantity) || 0)));
  if (typeof lineId !== "string" || !lineId) return { ok: false, error: GENERIC };
  return withCart((id) => (q === 0 ? getRepository().removeCartLines(id, [lineId]) : getRepository().updateCartLines(id, [{ lineId, quantity: q }])));
}

export async function removeCartLine(lineId: string): Promise<CartActionResult> {
  if (typeof lineId !== "string" || !lineId) return { ok: false, error: GENERIC };
  return withCart((id) => getRepository().removeCartLines(id, [lineId]));
}

export async function updateGift(attributes: CartAttributes): Promise<CartActionResult> {
  const clean: CartAttributes = { gift: Boolean(attributes.gift), giftNote: String(attributes.giftNote ?? "").slice(0, 150) };
  return withCart((id) => getRepository().updateCartAttributes(id, clean));
}

export type NotifyResult = { ok: true } | { ok: false; error: string };

/** "Notify me" for a sold-out size. */
export async function requestBackInStock(input: { email: string; variantId: string; productHandle: string }): Promise<NotifyResult> {
  const email = String(input.email ?? "").trim();
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: "Check the email address, e.g. name@example.com." };
  try {
    const r = await getBackInStockProvider().register({ email, variantId: String(input.variantId), productHandle: String(input.productHandle) });
    return r.ok ? { ok: true } : { ok: false, error: r.message };
  } catch (err) {
    console.error("[notify-me]", err);
    return { ok: false, error: "We couldn’t save that just now. Try again in a moment." };
  }
}
