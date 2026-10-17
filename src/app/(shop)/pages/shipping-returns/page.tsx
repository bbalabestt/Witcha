import type { Metadata } from "next";
import { HelpLayout } from "@/components/content/HelpLayout";
import { getSiteSettings } from "@/lib/data/catalog";
import { formatMoney } from "@/lib/data/money";
import styles from "@/components/content/HelpLayout.module.css";

export const metadata: Metadata = { title: "Shipping & Returns", alternates: { canonical: "/pages/shipping-returns" } };

/** The single source for the shipping promise shown on product pages and in the cart. */
export default async function ShippingPage() {
  const s = await getSiteSettings();
  return (
    <HelpLayout title="Shipping & Returns" current="/pages/shipping-returns">
      <p>
        We dispatch from {s.dispatchCity} within {s.dispatchDays} business days. Rates, times and refund days below come from our store
        settings, the same ones shown on every product page and in your cart.
      </p>
      <div className={styles.table} role="table" aria-label="Shipping rates">
        <b role="columnheader">Method</b>
        <b role="columnheader">Cost</b>
        <b role="columnheader">Arrives</b>
        <span role="cell">Standard, metro</span>
        <span role="cell">
          {formatMoney(s.standardShipping)} · free over {formatMoney(s.freeShippingThreshold)}
        </span>
        <span role="cell">{s.deliveryDays} business days</span>
        <span role="cell">Express</span>
        <span role="cell">{formatMoney(s.expressShipping)}</span>
        <span role="cell">{s.expressDays} business days</span>
      </div>
      <h2 className="heading-3">Returns in three steps</h2>
      <ol className={styles.steps}>
        <li>Email us within {s.returnsDays} days with your order number.</li>
        <li>Send the unopened tin back with the label we provide.</li>
        <li>We refund to your original payment within {s.refundDays} days.</li>
      </ol>
    </HelpLayout>
  );
}
