import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/data/money";
import type { SiteSettings } from "@/lib/data/types";
import styles from "./ShippingPromise.module.css";

/** One source of truth for dispatch, delivery, free shipping and returns, next to the button (brief §9). */
export function ShippingPromise({ settings }: { settings: SiteSettings }) {
  return (
    <div className={styles.promise} data-reveal="up">
      <p>
        <Icon name="truck" size={20} />
        <span>
          <b>Dispatched within {settings.dispatchDays} business days</b> from {settings.dispatchCity}.
        </span>
      </p>
      <p>
        <Icon name="clock" size={20} />
        <span>Arrives in about {settings.deliveryDays} business days in metro Australia.</span>
      </p>
      <p>
        <Icon name="gift" size={20} />
        <span>
          Free shipping over {formatMoney(settings.freeShippingThreshold)}. Otherwise {formatMoney(settings.standardShipping)}.
        </span>
      </p>
      <p>
        <Icon name="return" size={20} />
        <span>
          Unopened tins can be returned within {settings.returnsDays} days.{" "}
          <Link href="/pages/shipping-returns" className="text-link">
            Shipping &amp; Returns
          </Link>
        </span>
      </p>
    </div>
  );
}

/** The three-column summary under the FAQ, from the same settings. */
export function ShippingSummary({ settings }: { settings: SiteSettings }) {
  return (
    <section className={styles.summary}>
      <div className={`container ${styles.summaryGrid}`}>
        <div data-reveal="up">
          <Icon name="truck" />
          <b className="label">Dispatch</b>
          Within {settings.dispatchDays} business days from {settings.dispatchCity}.
        </div>
        <div data-reveal="up" data-delay="80">
          <Icon name="clock" />
          <b className="label">Delivery</b>
          About {settings.deliveryDays} business days, metro Australia. Free over {formatMoney(settings.freeShippingThreshold)}.
        </div>
        <div data-reveal="up" data-delay="160">
          <Icon name="return" />
          <b className="label">Returns</b>
          Unopened tins within {settings.returnsDays} days.
        </div>
      </div>
    </section>
  );
}
