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
      <table className={styles.table}>
        <caption className="visually-hidden">Shipping rates</caption>
        <thead>
          <tr>
            <th scope="col">Method</th>
            <th scope="col">Cost</th>
            <th scope="col">Arrives</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Standard, metro</td>
            <td>
              {formatMoney(s.standardShipping)} · free over {formatMoney(s.freeShippingThreshold)}
            </td>
            <td>{s.deliveryDays} business days</td>
          </tr>
          <tr>
            <td>Express</td>
            <td>{formatMoney(s.expressShipping)}</td>
            <td>{s.expressDays} business days</td>
          </tr>
        </tbody>
      </table>
      <h2 className="heading-3">Returns in three steps</h2>
      <ol className={styles.steps}>
        <li>Email us within {s.returnsDays} days with your order number.</li>
        <li>Send the unopened tin back with the label we provide.</li>
        <li>We refund to your original payment within {s.refundDays} days.</li>
      </ol>
    </HelpLayout>
  );
}
