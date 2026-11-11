import styles from "./motion.module.css";

// Four identical crests per half, so sliding by half the width loops without a seam.
const WAVE = "M0 20 Q150 2 300 20 T600 20 T900 20 T1200 20 T1500 20 T1800 20 T2100 20 T2400 20 V40 H0Z";

/** A slow tea-surface edge where a mint band meets cream. */
export function LiquidEdge({ side = "bottom" }: { side?: "top" | "bottom" }) {
  return (
    <div className={`${styles.edge} ${side === "top" ? `${styles.edgeTop} ${styles.edgeSlow}` : styles.edgeBottom}`} aria-hidden="true" data-loop="">
      <svg viewBox="0 0 2400 40" preserveAspectRatio="none">
        <path d={WAVE} />
      </svg>
    </div>
  );
}
