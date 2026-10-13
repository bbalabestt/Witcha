import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/data/money";
import { freeShippingMeter } from "@/lib/cart/optimistic";
import type { Money } from "@/lib/data/types";
import styles from "./Cart.module.css";

export function FreeShippingMeter({ subtotal, threshold }: { subtotal: Money; threshold: Money }) {
  const m = freeShippingMeter(subtotal, threshold);
  return (
    <div className={styles.meter}>
      <p className={styles.small} aria-live="polite">
        {m.kind === "reached" ? (
          <>
            <Icon name="check" size={18} />
            Free shipping unlocked.
          </>
        ) : (
          <>You’re {formatMoney(m.remaining)} away from free shipping.</>
        )}
      </p>
      <div className={styles.track} role="progressbar" aria-label="Progress to free shipping" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(m.percent)}>
        <span className={styles.fill} style={{ transform: `scaleX(${m.percent / 100})` }} />
      </div>
    </div>
  );
}
