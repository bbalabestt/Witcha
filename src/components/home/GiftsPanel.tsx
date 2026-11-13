import { Button } from "@/components/ui/Button";
import { GIFTS } from "@/lib/content/home";
import { TEAS_HREF } from "@/lib/config/site";
import styles from "./GiftsPanel.module.css";

/** A gift tag on twine, drawn in the site's line style, carrying the real wordmark (never retyped). */
function GiftTag() {
  return (
    <svg viewBox="0 0 320 420" className={styles.tag} aria-hidden="true" data-loop="">
      <path className={styles.twine} d="M160 0 C150 40 176 64 160 96" />
      <g className={styles.swing}>
        <path className={styles.card} d="M112 120 L160 88 L208 120 V376 H112 Z" />
        <circle className={styles.hole} cx="160" cy="112" r="7" />
        <path className={styles.rule} d="M126 168 H194 M126 330 H194" />
        <image href="/logos/witcha-matcha_large_charcoal.svg" x="122" y="226" width="76" height="22" />
      </g>
    </svg>
  );
}

/**
 * Gifts (Bible p.47 puts them after the Academy). Copy is a mock from the Bible (p.14, p.31) for the founders to
 * rewrite; it promises nothing the shop cannot do yet (no gift note, delivery cut-off, bundle or price).
 */
export function GiftsPanel() {
  return (
    <section className={styles.section} aria-labelledby="wm-gifts-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          <h2 id="wm-gifts-title" className={styles.heading}>
            {GIFTS.heading}
          </h2>
          <p className={styles.body}>{GIFTS.body}</p>
          <p className={styles.occasions}>{GIFTS.occasions}</p>
          <Button href={TEAS_HREF} size="lg">
            {GIFTS.cta}
          </Button>
        </div>
        <GiftTag />
      </div>
    </section>
  );
}
