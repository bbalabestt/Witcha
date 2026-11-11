import Link from "next/link";
import type { ReactNode } from "react";
import { RecipeDrawing, WhiskedBowl } from "@/components/motion/MatchaScenes";
import { Icon, type IconName } from "@/components/ui/Icon";
import { YOUR_CUP } from "@/lib/content/home";
import styles from "./Methods.module.css";

const RECIPES_HREF = "/pages/recipes";

/** Icon and drawing for each method note, in copy v5.3 §4 order: whisk, frother, shaker, cold whisk. */
const LOOK: Array<{ icon: IconName; scene: () => ReactNode }> = [
  { icon: "whisk", scene: () => <WhiskedBowl /> },
  { icon: "frother", scene: () => <RecipeDrawing id="iced-matcha-latte" /> },
  { icon: "shaker", scene: () => <RecipeDrawing id="iced-matcha-americano" /> },
  { icon: "iced", scene: () => <RecipeDrawing id="usucha" /> },
];

/**
 * "Your cup. Your way." (copy v5.3 §1) with the four method notes (§4). Each card shows what was V4's flip
 * side, always: an arch with a drawing of the drink, the method and its note. No flip (project lead).
 */
export function Methods({ notes }: { notes: Array<[string, string]> }) {
  return (
    <section className={styles.section} aria-labelledby="wm-methods-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <div className={styles.titles}>
            <h2 id="wm-methods-title" className="display-section" data-reveal="wipe-l">
              {YOUR_CUP.heading} <i className="serif-italic">{YOUR_CUP.headingItalic}</i>
            </h2>
            <p className={styles.body} data-reveal="left" data-delay="120">
              {YOUR_CUP.body}
            </p>
          </div>
          <Link href={RECIPES_HREF} className="label-link" data-reveal="right">
            {YOUR_CUP.cta}
          </Link>
        </div>
        <div className={styles.grid}>
          {notes.map(([name, note], i) => {
            const look = LOOK[i] ?? LOOK[0]!;
            return (
              <div key={name} className={styles.slot} data-reveal={i < 2 ? "left" : "right"} data-delay={String([0, 120, 120, 0][i] ?? 0)}>
                <Link href={RECIPES_HREF} className={styles.card}>
                  <span className={styles.photoArch} aria-hidden="true">
                    <span className={styles.photo}>{look.scene()}</span>
                    <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className={styles.nameRow}>
                    <Icon name={look.icon} size={28} />
                    <span className={styles.name}>{name}</span>
                  </span>
                  <span className={`body-small ${styles.meas}`}>{note}</span>
                  <span className={styles.backFoot} aria-hidden="true">
                    {YOUR_CUP.cta} →
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
