import { Skeleton } from "@/components/ui/Frame";
import styles from "@/components/commerce/Collection.module.css";

/** Collection skeleton: header band and a card grid with the final 4:5 ratios, so nothing shifts. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading teas">
      <section className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.headerCopy}>
            <Skeleton width={160} height={22} />
            <Skeleton width="min(420px, 80%)" height={44} />
            <Skeleton width="min(520px, 90%)" height={56} />
          </div>
        </div>
      </section>
      <div className={`container ${styles.body}`}>
        <Skeleton height={44} />
        <div className={styles.grid}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton ratio="4:5" />
              <Skeleton width="40%" height={16} />
              <Skeleton width="70%" height={30} />
              <Skeleton height={44} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
