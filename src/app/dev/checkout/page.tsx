import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { env } from "@/lib/config/env";
import { repository } from "@/lib/data";
import { CheckoutReference } from "./CheckoutReference";

export const metadata: Metadata = { title: "Checkout reference", robots: { index: false, follow: false } };

/**
 * Fixture-mode stand-in for Shopify's checkout. With live Shopify data the cart's real `checkoutUrl` is used
 * and this route 404s.
 */
export default function CheckoutPage({ searchParams }: PageProps<"/dev/checkout">) {
  if (env().commerceSource !== "fixtures") notFound();
  return (
    <Suspense fallback={null}>
      <Checkout searchParams={searchParams} />
    </Suspense>
  );
}

async function Checkout({ searchParams }: { searchParams: PageProps<"/dev/checkout">["searchParams"] }) {
  const sp = await searchParams;
  const id = typeof sp.cart === "string" ? sp.cart : "";
  const cart = id ? await repository().getCart(id) : null;
  return <CheckoutReference cart={cart} />;
}
