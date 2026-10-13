import { NewsletterForm } from "./NewsletterForm";
import styles from "./NewsletterBand.module.css";

/** "Letters from the Academy". No pop-ups, no discount bait, checkbox-free (opt-in is the submit). */
export function NewsletterBand() {
  return (
    <section className={styles.band} aria-labelledby="newsletter-heading">
      <span className={styles.archSoft} aria-hidden="true" />
      <span className={styles.archIvory} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className="label">Letters from the Academy</span>
          <h2 id="newsletter-heading" className="heading-1">
            New teas, artwork reveals and restock alerts.
          </h2>
          <p>A few letters a season. No pop-ups, no countdowns.</p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
