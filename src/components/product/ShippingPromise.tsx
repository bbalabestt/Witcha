import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { priceLabel } from "@/lib/data/money";
import type { SiteSettings } from "@/lib/data/types";
import styles from "./ShippingPromise.module.css";

/** One source of truth for dispatch, delivery, free shipping and returns, next to the button (brief §9). */
export function ShippingPromise({ settings }: { settings: SiteSettings }) {
  return (
    <div className={styles.promise}>
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
          Free shipping over {priceLabel(settings.freeShippingThreshold)}. Otherwise {priceLabel(settings.standardShipping)}.
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
