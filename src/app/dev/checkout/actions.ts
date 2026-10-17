"use server";

import { cookies } from "next/headers";
import { CART_COOKIE } from "@/lib/cart/server";
import { env } from "@/lib/config/env";

/** Fixture-only: a completed reference order starts a fresh cart, as Shopify does after payment. */
export async function completeReferenceOrder() {
  if (env().commerceSource !== "fixtures") return;
  (await cookies()).delete(CART_COOKIE);
}
