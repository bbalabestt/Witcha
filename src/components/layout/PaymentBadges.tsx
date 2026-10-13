import styles from "./Footer.module.css";

export const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Shop Pay", "PayPal", "Afterpay"] as const;

/** Text pills until official marks are supplied (prototype). Final list follows Shopify Payments settings. */
export function PaymentBadges({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <ul className={[styles.payments, tone === "light" ? styles.paymentsLight : undefined].filter(Boolean).join(" ")} aria-label="Payment methods">
      {PAYMENT_METHODS.map((m) => (
        <li key={m}>{m}</li>
      ))}
    </ul>
  );
}
