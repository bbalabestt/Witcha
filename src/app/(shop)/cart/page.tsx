import type { Metadata } from "next";
import { toCardData, toUpsellItems } from "@/components/commerce/card-data";
import { CartPageView } from "@/components/commerce/CartPage";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Breadcrumb } from "@/components/ui/Navigation";
import { env } from "@/lib/config/env";
import { getProducts, getSiteSettings } from "@/lib/data/catalog";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const [settings, products] = await Promise.all([getSiteSettings(), getProducts()]);
  const teas = products.filter((p) => p.kind === "tea").slice(0, 3);
  return (
    <>
      <section className={`container ${styles.page}`}>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <CartPageView threshold={settings.freeShippingThreshold} upsell={toUpsellItems(products)} shopPay={env().shopPay} />
      </section>
      <section className={`container ${styles.more}`}>
        <h2 className="heading-2">You may also like</h2>
        <div className={styles.grid}>
          {teas.map((p) => (
            <div key={p.handle} data-reveal="up">
              <ProductCard card={toCardData(p)} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
