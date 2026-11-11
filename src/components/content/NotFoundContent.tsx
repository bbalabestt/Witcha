import { Button } from "@/components/ui/Button";
import { TEAS_HREF } from "@/lib/config/site";
import styles from "./NotFoundContent.module.css";

/** Copy v5.3 §8. */
export function NotFoundContent() {
  return (
    <section className={`container ${styles.page}`}>
      <h1 className="heading-1">This page has wandered off.</h1>
      <p>Let&apos;s get you back to the teas.</p>
      <div className={styles.actions}>
        <Button href={TEAS_HREF} size="xl">
          Shop the teas
        </Button>
      </div>
    </section>
  );
}
