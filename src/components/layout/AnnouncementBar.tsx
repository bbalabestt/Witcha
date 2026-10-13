import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/data/money";
import type { SiteSettings } from "@/lib/data/types";
import styles from "./AnnouncementBar.module.css";

/** Fills `{threshold}`, `{city}` and `{days}` in the settings message from the same settings. */
export function announcementText(s: SiteSettings): string {
  return s.announcement
    .replaceAll("{threshold}", formatMoney(s.freeShippingThreshold))
    .replaceAll("{city}", s.dispatchCity)
    .replaceAll("{days}", s.dispatchDays);
}

export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className={styles.bar}>
      <Icon name="truck" size={18} />
      <p>{announcementText(settings)}</p>
    </div>
  );
}
