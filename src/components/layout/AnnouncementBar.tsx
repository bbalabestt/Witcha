import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/data/money";
import type { SiteSettings } from "@/lib/data/types";
import styles from "./AnnouncementBar.module.css";

/** One message, always shown (V4 1.1). Text comes from the same settings as the shipping promise. */
export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className={styles.bar} data-surface-dark="">
      <Icon name="truck" size={18} />
      <p>
        Free shipping over {formatMoney(settings.freeShippingThreshold)} · Dispatched from {settings.dispatchCity} within{" "}
        {settings.dispatchDays} business days
      </p>
    </div>
  );
}
