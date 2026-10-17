import { Skeleton } from "@/components/ui/Frame";
import styles from "./page.module.css";

/** Gallery + buy box skeleton in the final proportions. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading tea">
      <div className={`container ${styles.crumbs}`}>
        <Skeleton width={240} height={22} />
      </div>
      <section className={`container ${styles.top}`}>
        <div className={styles.stack}>
          <Skeleton ratio="4:5" />
        </div>
        <div className={styles.stack}>
          <Skeleton width="40%" height={16} />
          <Skeleton width="80%" height={50} />
          <Skeleton width="30%" height={30} />
          <Skeleton height={180} />
          <Skeleton height={56} />
          <Skeleton height={52} />
        </div>
      </section>
    </div>
  );
}
