import Link from "next/link";
import type { ReactNode } from "react";
import { SiftedPowder, UsuchaCup, WhiskedBowl } from "@/components/motion/MatchaScenes";
import { PROOF, TASTE_FIRST } from "@/lib/content/home";
import { TEAS_HREF } from "@/lib/config/site";
import styles from "./ProofStrip.module.css";

export type ProofTea = { handle: string; name: string; origin: string; cultivar: string | null; harvest: string | null };

/**
 * The three photos this strip is built for, in order. Until the founders supply them (no generated images),
 * each frame holds a captionless line drawing of the same subject. Swap `scene` for a next/image of the photo.
 */
const PHOTOS: Array<{ slot: string; scene: ReactNode }> = [
  { slot: "powder: matcha powder, close up, true colour", scene: <SiftedPowder /> },
  { slot: "hands: whisking a bowl of usucha", scene: <WhiskedBowl /> },
  { slot: "cup: the finished usucha", scene: <UsuchaCup /> },
];

/**
 * "Why it tastes good": the reality strip under the range (Bible: "Fantasy earns attention, reality earns
 * trust"). Real photos (stand-ins for now), each tea's origin, cultivar and harvest from its facts table, and
 * the selection story. Unconfirmed facts are null and simply not shown.
 */
export function ProofStrip({ teas }: { teas: ProofTea[] }) {
  return (
    <section className={styles.section} aria-labelledby="wm-proof-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <span className="label">{PROOF.label}</span>
          <h2 id="wm-proof-title" className={styles.heading}>
            {PROOF.heading}
          </h2>
          <Link href={TEAS_HREF} className="label-link">
            {TASTE_FIRST.link}
          </Link>
        </div>

        <div className={styles.photos} aria-hidden="true">
          {PHOTOS.map((p) => (
            <figure key={p.slot} className={styles.photo} data-photo-slot={p.slot}>
              {p.scene}
            </figure>
          ))}
        </div>

        <ul className={styles.specs}>
          {teas.map((t) => (
            <li key={t.handle} className={styles.tea}>
              <Link href={`/products/${t.handle}`} className={styles.name}>
                {t.name}
              </Link>
              <dl className={styles.facts}>
                <div>
                  <dt>{PROOF.facts.origin}</dt>
                  <dd>{t.origin}</dd>
                </div>
                {t.cultivar ? (
                  <div>
                    <dt>{PROOF.facts.cultivar}</dt>
                    <dd>{t.cultivar}</dd>
                  </div>
                ) : null}
                {t.harvest ? (
                  <div>
                    <dt>{PROOF.facts.harvest}</dt>
                    <dd>{t.harvest}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
