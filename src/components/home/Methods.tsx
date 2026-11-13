import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { YOUR_CUP } from "@/lib/content/home";
import styles from "./Methods.module.css";

const RECIPES_HREF = "/pages/recipes";

/** Icon for each method note, in copy v5.3 §4 order: whisk, frother, shaker, cold whisk. */
const ICONS: IconName[] = ["whisk", "frother", "shaker", "iced"];

/**
 * "Your cup. Your way." (copy v5.3 §1) with the four method notes (§4) set as large type: each method is one
 * word, its note beside it. No cards and no drawings, so it reads unlike any other section.
 */
export function Methods({ notes }: { notes: Array<[string, string]> }) {
  return (
    <section className={styles.section} aria-labelledby="wm-methods-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <h2 id="wm-methods-title" className={styles.heading}>
            {YOUR_CUP.heading} <i className="serif-italic">{YOUR_CUP.headingItalic}</i>
          </h2>
          <p>{YOUR_CUP.body}</p>
          <Link href={RECIPES_HREF} className="label-link">
            {YOUR_CUP.cta}
          </Link>
        </div>
        <ul className={styles.list}>
          {notes.map(([name, note], i) => (
            <li key={name} className={styles.row}>
              <span className={styles.word}>
                <Icon name={ICONS[i] ?? "whisk"} size={28} className={styles.icon} />
                {name}
              </span>
              <span className={styles.note}>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
