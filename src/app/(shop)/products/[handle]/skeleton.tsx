import { Skeleton } from "@/components/ui/Frame";
import styles from "@/components/pdp/Pdp.module.css";

/** Same grid as the loaded page: 4:5 gallery beside the buy box. */
export function PdpSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <div className={styles.crumbs}>
        <Skeleton width={220} height={22} />
      </div>
      <section className={styles.hero}>
        <div className={styles.gallery}>
          <Skeleton ratio="4:5" />
        </div>
        <div className={styles.buyBox}>
          <Skeleton width={140} height={16} />
          <Skeleton width="80%" height={50} />
          <Skeleton width={120} height={30} />
          <Skeleton height={160} />
          <Skeleton height={56} />
          <Skeleton height={52} />
        </div>
      </section>
    </div>
  );
}
