import type { Metadata } from "next";
import { toUpsellItems } from "@/components/commerce/card-data";
import { CartPageView } from "@/components/commerce/CartPage";
import { Breadcrumb } from "@/components/ui/Navigation";
import { env } from "@/lib/config/env";
import { getProducts, getSiteSettings } from "@/lib/data/catalog";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const [settings, products] = await Promise.all([getSiteSettings(), getProducts()]);
  return (
    <section className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <CartPageView threshold={settings.freeShippingThreshold} upsell={toUpsellItems(products)} shopPay={env().shopPay} />
    </section>
  );
}
