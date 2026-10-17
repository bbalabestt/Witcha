import "server-only";
import { cookies } from "next/headers";
import { repository } from "@/lib/data";
import type { Cart } from "@/lib/data/types";

export const CART_COOKIE = "wm_cart";

export const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/** Reads the cart for this request. An expired or unknown id behaves like an empty cart, never an error. */
export async function readCart(): Promise<Cart | null> {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  if (!id) return null;
  try {
    return await repository().getCart(id);
  } catch {
    return null;
  }
}
