import { Icon } from "@/components/ui/Icon";
import { priceLabel } from "@/lib/data/money";
import type { SiteSettings } from "@/lib/data/types";
import styles from "./AnnouncementBar.module.css";

/** One message from the same settings as the shipping promise. Hidden until every value exists. */
export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const threshold = priceLabel(settings.freeShippingThreshold);
  if (!threshold || !settings.dispatchCity || !settings.dispatchDays) return null;
  return (
    <div className={styles.bar}>
      <Icon name="truck" size={18} />
      <p>
        Free shipping over {threshold} · Dispatched from {settings.dispatchCity} within {settings.dispatchDays} business days
      </p>
    </div>
  );
}
