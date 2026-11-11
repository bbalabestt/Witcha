import styles from "./motion.module.css";

const LINE = ["Matcha, With Taste.", "Which Matcha Today?"];
const REPEATS = Array.from({ length: 6 }, () => LINE).flat();

function Group() {
  return (
    <div className={styles.stripGroup}>
      {REPEATS.map((text, i) => (
        <span key={i}>{text}</span>
      ))}
    </div>
  );
}

/** The confirmed lines, drifting. Read once by screen readers; still and centred under reduced motion. */
export function BrandStrip() {
  return (
    <div className={styles.strip} data-loop="">
      <p className={styles.stripPlain} style={{ textAlign: "center" }}>
        {LINE.join(" · ")}
      </p>
      <div className={styles.stripTrack} aria-hidden="true">
        <Group />
        <Group />
      </div>
    </div>
  );
}
