import { Suspense } from "react";
import { getServerEnv } from "@/lib/config/env";
import { getCollection, getPairings, getSiteSettings } from "@/lib/data";
import { CartDrawer } from "./CartDrawer";
import type { CartExtras } from "./CartContents";

export async function getCartExtras(): Promise<CartExtras> {
  const [settings, pairings, matcha] = await Promise.all([getSiteSettings(), getPairings([], 3), getCollection("matcha", { first: 4 })]);
  return {
    threshold: settings.freeShippingThreshold,
    pairings,
    suggestions: (matcha?.products.nodes ?? []).filter((p) => p.availableForSale).slice(0, 2),
    shopPay: getServerEnv().NEXT_PUBLIC_FEATURE_SHOP_PAY,
  };
}

export async function CartDrawerServer() {
  const extras = await getCartExtras();
  // The drawer reads the pathname (to close on navigation), which needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <CartDrawer extras={extras} />
    </Suspense>
  );
}
