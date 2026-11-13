import Link from "next/link";
import type { ReactNode } from "react";
import { SiftedPowder, UsuchaCup, WhiskedBowl } from "@/components/motion/MatchaScenes";
import { PROOF } from "@/lib/content/home";
import styles from "./ProofStrip.module.css";

export type ProofTea = { handle: string; name: string; origin: string; cultivar: string | null; harvest: string | null };

/**
 * The three photos this section is built for. Until the founders supply them (no generated images), each
 * frame holds a captionless line drawing of the same subject. Swap `scene` for a next/image of the photo.
 */
const PHOTOS: Array<{ slot: string; scene: ReactNode; size: "tall" | "small" }> = [
  { slot: "powder: matcha powder, close up, true colour", scene: <SiftedPowder />, size: "tall" },
  { slot: "hands: whisking a bowl of usucha", scene: <WhiskedBowl />, size: "small" },
  { slot: "cup: the finished usucha, top down", scene: <UsuchaCup />, size: "small" },
];

/**
 * "Why it tastes good": the reality section (Bible: "Fantasy earns attention, reality earns trust"). A photo
 * collage beside a spec sheet of origin, cultivar and harvest for each tea. Unconfirmed facts show a dash.
 */
export function ProofStrip({ teas }: { teas: ProofTea[] }) {
  return (
    <section className={styles.section} aria-labelledby="wm-proof-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.collage} aria-hidden="true">
          {PHOTOS.map((p) => (
            <figure key={p.slot} className={styles.photo} data-size={p.size} data-photo-slot={p.slot}>
              {p.scene}
            </figure>
          ))}
        </div>

        <div className={styles.sheet}>
          <span className="label">{PROOF.label}</span>
          <h2 id="wm-proof-title" className={styles.heading}>
            {PROOF.heading}
          </h2>
          <table className={styles.specs}>
            <caption className="visually-hidden">Origin, cultivar and harvest of each tea</caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">Tea</span>
                </th>
                <th scope="col">{PROOF.facts.origin}</th>
                <th scope="col">{PROOF.facts.cultivar}</th>
                <th scope="col">{PROOF.facts.harvest}</th>
              </tr>
            </thead>
            <tbody>
              {teas.map((t) => (
                <tr key={t.handle}>
                  <th scope="row">
                    <Link href={`/products/${t.handle}`}>{t.name}</Link>
                  </th>
                  <td data-label={PROOF.facts.origin}>{t.origin}</td>
                  <td data-label={PROOF.facts.cultivar}>{t.cultivar ?? "–"}</td>
                  <td data-label={PROOF.facts.harvest}>{t.harvest ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
