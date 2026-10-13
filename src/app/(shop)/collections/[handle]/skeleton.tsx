import { Skeleton } from "@/components/ui/Frame";
import styles from "@/components/commerce/Collection.module.css";

/** Matches the final grid so nothing shifts when products stream in. */
export function CollectionSkeleton({ cards = 3, withHeader = false }: { cards?: number; withHeader?: boolean }) {
  const grid = (
    <section className={styles.results} aria-busy="true" aria-label="Loading products">
      <div className={styles.toolbar}>
        <Skeleton width={120} height={22} />
        <Skeleton width={200} height={44} />
      </div>
      <ul className={styles.grid}>
        {Array.from({ length: cards }, (_, i) => (
          <li key={i} className={styles.skeletonCard}>
            <Skeleton ratio="4:5" />
            <Skeleton width="40%" height={16} />
            <Skeleton width="80%" height={30} />
            <Skeleton width="60%" height={16} />
            <Skeleton width="30%" height={28} />
            <Skeleton height={44} />
          </li>
        ))}
      </ul>
    </section>
  );
  if (!withHeader) return grid;
  return (
    <>
      <div className={[styles.header, styles.header_plain].join(" ")} aria-hidden="true">
        <div className={styles.headerInner}>
          <div className={styles.headerCopy}>
            <Skeleton width={160} height={22} />
            <Skeleton width="70%" height={50} />
            <Skeleton width="90%" height={56} />
          </div>
        </div>
      </div>
      {grid}
    </>
  );
}
