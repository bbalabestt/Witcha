import type { Metadata } from "next";
import { HelpLayout } from "@/components/content/HelpLayout";
import { ShippingPromise } from "@/components/commerce/ShippingPromise";
import { getSiteSettings } from "@/lib/data";
import { formatMoney } from "@/lib/data/money";
import styles from "@/components/content/Content.module.css";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Delivery costs and times across Australia, and how returns work.",
  alternates: { canonical: "/pages/shipping-returns" },
};

export default async function ShippingReturnsPage() {
  const s = await getSiteSettings();
  return (
    <HelpLayout current="/pages/shipping-returns">
      <p>This page is the single source for the shipping promise shown on product pages and in the cart.</p>
      <ShippingPromise settings={s} />
      <table className={styles.table}>
        <caption className="visually-hidden">Shipping methods</caption>
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
      <h2 className="heading-2">Returns in three steps</h2>
      <ol className={styles.numbered}>
        <li>Email us within {s.returnsDays} days with your order number.</li>
        <li>Send the unopened tin back with the label we provide.</li>
        <li>We refund to your original payment within {s.refundDays} days.</li>
      </ol>
    </HelpLayout>
  );
}
