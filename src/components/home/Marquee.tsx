import { Fragment } from "react";
import styles from "./Home.module.css";

/**
 * Decorative moving strip (aria-hidden; the same words appear elsewhere on the page). A CSS loop runs
 * until MarqueeDriver takes over and ties speed and skew to scroll velocity. Still under reduced motion.
 */
export function Marquee({ items, tone, reverse = false }: { items: string[]; tone: "deep" | "soft"; reverse?: boolean }) {
  const run = (key: string) => (
    <span className={styles.marqueeRun} key={key}>
      {items.map((t, i) => (
        <Fragment key={`${t}-${i}`}>
          <span>{t}</span>
          {tone === "deep" ? <span className={i % 2 ? styles.glyphFill : styles.glyphLine} /> : <span>·</span>}
        </Fragment>
      ))}
    </span>
  );
  return (
    <div className={[styles.marquee, tone === "deep" ? styles.marqueeDeep : styles.marqueeSoft].join(" ")} aria-hidden="true">
      <div className={[styles.marqueeTrack, reverse ? styles.marqueeReverse : undefined].filter(Boolean).join(" ")} data-marquee={reverse ? -1 : 1}>
        {run("a")}
        {run("b")}
      </div>
    </div>
  );
}
