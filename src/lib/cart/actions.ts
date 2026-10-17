"use server";

import { cookies } from "next/headers";
import { repository } from "@/lib/data";
import { CommerceError, GIFT_NOTE_MAX } from "@/lib/data/repository";
import type { Cart } from "@/lib/data/types";
import { CART_COOKIE, CART_COOKIE_OPTIONS } from "./server";

export type CartResult = { ok: true; cart: Cart } | { ok: false; error: string; cart: Cart | null };

function message(err: unknown): string {
  if (err instanceof CommerceError && err.kind === "user") return err.message;
  if (err instanceof CommerceError && err.kind === "network") return "We couldn’t reach the cart. Check your connection and try again.";
  return "Something went wrong with your cart. Please try again.";
}

async function currentId(): Promise<string | null> {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

async function remember(cart: Cart) {
  (await cookies()).set(CART_COOKIE, cart.id, CART_COOKIE_OPTIONS);
}

async function safeCurrent(): Promise<Cart | null> {
  const id = await currentId();
  if (!id) return null;
  try {
    return await repository().getCart(id);
  } catch {
    return null;
  }
}

function validQuantity(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 99;
}

export async function addToCart(merchandiseId: string, quantity: number): Promise<CartResult> {
  if (typeof merchandiseId !== "string" || !merchandiseId || !validQuantity(quantity) || quantity === 0) {
    return { ok: false, error: "Choose a size before adding to cart.", cart: null };
  }
  const repo = repository();
  try {
    const existing = await safeCurrent();
    const cart = existing
      ? await repo.addLines(existing.id, [{ merchandiseId, quantity }])
      : await repo.createCart([{ merchandiseId, quantity }]);
    await remember(cart);
    return { ok: true, cart };
  } catch (err) {
    return { ok: false, error: message(err), cart: await safeCurrent() };
  }
}

export async function updateLineQuantity(lineId: string, quantity: number): Promise<CartResult> {
  const id = await currentId();
  if (!id || !validQuantity(quantity)) return { ok: false, error: "That change didn’t go through.", cart: await safeCurrent() };
  try {
    const repo = repository();
    const cart = quantity === 0 ? await repo.removeLines(id, [lineId]) : await repo.updateLines(id, [{ id: lineId, quantity }]);
    return { ok: true, cart };
  } catch (err) {
    return { ok: false, error: message(err), cart: await safeCurrent() };
  }
}

export async function removeLine(lineId: string): Promise<CartResult> {
  return updateLineQuantity(lineId, 0);
}

export async function updateGift(gift: boolean, note: string): Promise<CartResult> {
  const id = await currentId();
  if (!id) return { ok: false, error: "Add a tea before writing a gift note.", cart: null };
  try {
    const cart = await repository().updateGift(id, Boolean(gift), String(note ?? "").slice(0, GIFT_NOTE_MAX));
    return { ok: true, cart };
  } catch (err) {
    return { ok: false, error: message(err), cart: await safeCurrent() };
  }
}

export async function refreshCart(): Promise<Cart | null> {
  return safeCurrent();
}
