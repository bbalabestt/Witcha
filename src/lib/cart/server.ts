import "server-only";
import { cookies } from "next/headers";
import { getRepository } from "@/lib/data";
import type { Cart } from "@/lib/data/types";

export const CART_COOKIE = "wm_cart";
const MAX_AGE = 60 * 60 * 24 * 14; // Shopify carts live ~10 days without activity; renewed on each write.

export async function getCartId(): Promise<string | null> {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

export async function setCartId(id: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearCartId(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}

/** The shopper's cart, or null when there is none or the stored id has expired. Never cached. */
export async function readCart(): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  try {
    return await getRepository().getCart(id);
  } catch (err) {
    console.error("[cart] read failed", err);
    return null;
  }
}
