import Image from "next/image";
import Link from "next/link";
import catPortrait from "@/assets/cat/cat-portrait.png";
import { ACADEMY_TITLES } from "@/lib/content/academy";
import { ACADEMY } from "@/lib/content/home";
import styles from "./AcademyPreview.module.css";

/**
 * "Meet Witcha Academy." (copy v5.3 §1) with the four Academy titles and their flavour character (§5) set as a
 * class register, beside the client's cat ("one curious cat keeps them all company"). The register shows the
 * titles only; the full product names live in the range above.
 */
export function AcademyPreview() {
  return (
    <section className={styles.section} aria-labelledby="wm-academy-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.portrait}>
          <Image src={catPortrait} alt="" sizes="(max-width: 899px) 60vw, 30vw" className={styles.cat} />
        </div>
        <div className={styles.text}>
          <h2 id="wm-academy-title" className={styles.heading}>
            {ACADEMY.headingLeft} <i className="serif-italic">{ACADEMY.headingRight}</i>
          </h2>
          <p className={styles.body}>{ACADEMY.body}</p>
          <ol className={styles.register}>
            {ACADEMY_TITLES.map((t) => (
              <li key={t.handle}>
                <Link href={`/products/${t.handle}`} className={styles.title}>
                  {t.name.split(" — ")[0]}
                </Link>
                <span className={styles.character}>{t.character}</span>
              </li>
            ))}
          </ol>
          <Link href="/pages/academy" className="label-link">
            {ACADEMY.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
