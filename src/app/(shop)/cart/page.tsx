import type { Metadata } from "next";
import { getCartExtras } from "@/components/cart/CartDrawerServer";
import { CartPageView } from "@/components/cart/CartPageView";
import { ShippingPromise } from "@/components/commerce/ShippingPromise";
import { getSiteSettings } from "@/lib/data";
import styles from "@/components/cart/Cart.module.css";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cart" },
};

export default async function CartPage() {
  const [extras, settings] = await Promise.all([getCartExtras(), getSiteSettings()]);
  return (
    <>
      <div className={styles.page}>
        <h1 className="heading-1">Your cart</h1>
        <CartPageView extras={extras} />
      </div>
      <ShippingPromise settings={settings} variant="trio" />
    </>
  );
}
