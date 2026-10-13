import { Skeleton } from "@/components/ui/Frame";
import styles from "@/components/content/Content.module.css";

export default function Loading() {
  return (
    <div className={styles.section} aria-busy="true" aria-label="Loading">
      <Skeleton width="40%" height={50} />
      <Skeleton height={22} />
      <Skeleton height={320} />
    </div>
  );
}
