import { Button } from "@/components/ui/Button";
import { TinPlaceholder } from "@/components/ui/TinPlaceholder";
import { GIFTS, HERO, SELECTION_ID } from "@/lib/content/home";
import { TEAS_HREF } from "@/lib/config/site";
import styles from "./GiftsPanel.module.css";

/**
 * Gifts, back in V4's framed panel (Bible p.47 puts gifts after the Academy). Copy is drafted from the Bible
 * and waits on the founders' sign-off; it promises nothing the shop cannot do yet (no gift note, delivery
 * cut-off, bundle or price), so it points to the teas themselves. The tins are the faded stand-ins.
 */
export function GiftsPanel() {
  return (
    <section className={`container ${styles.section}`} aria-labelledby="wm-gifts-title">
      <div className={styles.frame}>
        <div className={styles.text}>
          <span className="label">{GIFTS.label}</span>
          <h2 id="wm-gifts-title" className="display-section">
            {GIFTS.heading}
          </h2>
          <p className={styles.body}>{GIFTS.body}</p>
          <div className={styles.actions}>
            <Button href={TEAS_HREF} size="lg">
              {HERO.primary}
            </Button>
            <Button href={`/#${SELECTION_ID}`} variant="secondary" size="lg">
              {HERO.secondary}
            </Button>
          </div>
        </div>
        <div className={styles.arch} aria-hidden="true">
          <span className={styles.tins}>
            <TinPlaceholder teaType="matcha" className={styles.back} />
            <TinPlaceholder teaType="hojicha" className={styles.front} />
            <TinPlaceholder teaType="matcha" className={styles.back} />
          </span>
        </div>
      </div>
    </section>
  );
}
