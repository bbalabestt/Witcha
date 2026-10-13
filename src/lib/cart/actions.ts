"use server";

import { refresh } from "next/cache";
import { getRepository } from "@/lib/data";
import { CartUserError } from "@/lib/data/repository";
import type { Cart, CartLineInput } from "@/lib/data/types";
import { getCartId, setCartId } from "./server";

export type CartActionResult = { ok: true; cart: Cart } | { ok: false; error: string };

const GENERIC = "We couldn’t update your cart. Check your connection and try again.";

/**
 * Adds lines to the shopper's cart, creating one when there is none or the stored id has expired
 * (never an error for the shopper).
 */
export async function addToCart(lines: CartLineInput[]): Promise<CartActionResult> {
  const clean = lines
    .filter((l) => typeof l.variantId === "string" && l.variantId.startsWith("gid://shopify/ProductVariant/"))
    .map((l) => ({ variantId: l.variantId, quantity: Math.min(99, Math.max(1, Math.trunc(Number(l.quantity) || 1))) }));
  if (!clean.length) return { ok: false, error: "Choose a size first." };

  const repo = getRepository();
  try {
    const id = await getCartId();
    let cart = id ? await repo.addCartLines(id, clean) : null;
    if (!cart) cart = await repo.createCart(clean);
    await setCartId(cart.id);
    // Re-render server UI that reads the cart (header count).
    refresh();
    return { ok: true, cart };
  } catch (err) {
    if (err instanceof CartUserError) return { ok: false, error: err.message };
    console.error("[cart] add failed", err);
    return { ok: false, error: GENERIC };
  }
}

/** Form-friendly wrapper: `<form action={addToCartForm}>` with hidden `variantId` and `quantity`. */
export async function addToCartForm(_prev: CartActionResult | null, formData: FormData): Promise<CartActionResult> {
  return addToCart([{ variantId: String(formData.get("variantId") ?? ""), quantity: Number(formData.get("quantity") ?? 1) }]);
}
