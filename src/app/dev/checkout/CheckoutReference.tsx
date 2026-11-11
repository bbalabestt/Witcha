import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { TEAS_HREF } from "@/lib/config/site";
import type { Cart } from "@/lib/data/types";
import styles from "./checkout.module.css";

/** End of the fixture flow: the real checkout is Shopify's own page once the store is connected. */
export function CheckoutReference({ cart }: { cart: Cart | null }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="WITCHA MATCHA home">
          <Logo variant="small" width={120} />
        </Link>
      </header>
      <section className={styles.body}>
        <h1 className="heading-1">Checkout preview</h1>
        <p>Checkout opens on Shopify once the store is connected.</p>
        {cart && cart.lines.length ? (
          <ul className={styles.lines}>
            {cart.lines.map((l) => (
              <li key={l.id}>
                {l.quantity} × {l.product.title}
                {l.variant.title ? ` · ${l.variant.title}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            <Link href={TEAS_HREF} className="text-link">
              Shop the teas
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
