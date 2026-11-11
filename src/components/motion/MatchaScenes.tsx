import type { CSSProperties } from "react";
import styles from "./motion.module.css";

const delay = (d: number) => ({ "--d": d }) as CSSProperties;

const BUBBLES: Array<[number, number, number, number]> = [
  [108, 196, 7, 0], [176, 188, 5, 0.5], [196, 232, 8, 1], [120, 262, 6, 1.5], [158, 276, 7, 0.2], [98, 232, 5, 0.9],
  [140, 212, 4, 1.3], [178, 262, 5, 1.8], [128, 170, 4, 0.7], [204, 204, 4, 2.1], [86, 262, 4, 0.4], [154, 240, 5, 1.1],
];

/** A bamboo whisk with its tips at 0,0. */
function Whisk() {
  return (
    <g transform="rotate(16)">
      <path className={styles.whiskTines} d="M-19 0 C-22 -18 -13 -34 -11 -46 H11 C13 -34 22 -18 19 0 C8 7 -8 7 -19 0Z" />
      <path className={styles.line} d="M-11 3 L-6 -44 M-3 5 L-2 -44 M4 5 L2 -44 M12 3 L6 -44" />
      <rect className={styles.cream} x="-11" y="-92" width="22" height="46" rx="2" />
      <path className={styles.line} d="M-11 -52 H11" />
    </g>
  );
}

/** The signature moment: matcha being whisked in the hero arch, in the "M" motion the recipes teach. */
export function WhiskedBowl() {
  return (
    <svg viewBox="0 0 320 400" className={styles.scene} aria-hidden="true" data-loop="">
      <path className={styles.steam} style={delay(0)} pathLength={1} d="M104 92c-16-20 16-32 0-56" />
      <path className={styles.steam} style={delay(1.4)} pathLength={1} d="M146 80c-16-20 16-32 0-56" />
      <path className={styles.steam} style={delay(2.8)} pathLength={1} d="M188 92c-16-20 16-32 0-56" />

      <g transform="translate(232 214)">
        <rect className={styles.cream} x="6" y="16" width="64" height="104" />
        <rect className={styles.cream} x="0" y="0" width="76" height="17" />
      </g>

      <circle className={styles.cream} cx="148" cy="230" r="106" />
      <circle className={styles.matcha} cx="148" cy="230" r="90" />
      <circle className={styles.foamBed} cx="148" cy="230" r="72" />
      <g className={styles.swirling}>
        <path className={styles.swirl} d="M148 170a60 60 0 0 1 60 60" />
        <path className={styles.swirl} d="M148 290a60 60 0 0 1-60-60" />
      </g>
      <g className={styles.swirlingBack}>
        <path className={styles.swirl} d="M148 196a34 34 0 0 1 34 34" />
        <path className={styles.swirl} d="M148 264a34 34 0 0 1-34-34" />
      </g>
      {BUBBLES.map(([cx, cy, r, d]) => (
        <circle key={`${cx}-${cy}`} className={`${styles.bubble} ${styles.popping}`} style={delay(d)} cx={cx} cy={cy} r={r} />
      ))}

      <g transform="translate(148 232)">
        <g className={styles.whisk}>
          <Whisk />
        </g>
      </g>
    </svg>
  );
}

function Steam({ left, y }: { left: number; y: number }) {
  return (
    <g transform={`translate(${left} ${y})`}>
      <path className={styles.steam} style={delay(0)} pathLength={1} d="M-16 0c-8-10 8-16 0-28" />
      <path className={styles.steam} style={delay(1.2)} pathLength={1} d="M0 -3c-8-10 8-16 0-28" />
      <path className={styles.steam} style={delay(2.4)} pathLength={1} d="M16 0c-8-10 8-16 0-28" />
    </g>
  );
}

const SPECKS: Array<[number, number, number]> = [[38, 2.2, 0], [50, 1.8, 0.7], [60, 2.4, 1.5], [70, 1.8, 0.3], [82, 2.2, 1.1], [56, 1.6, 1.9], [76, 2, 2.2]];

/** Powder falling from a sieve into a soft mound. */
export function SiftedPowder() {
  return (
    <svg viewBox="0 0 120 160" className={styles.scene} aria-hidden="true" data-loop="">
      <g className={styles.sifting}>
        <path className={styles.cream} d="M26 22 H94 C92 40 74 48 60 48 C46 48 28 40 26 22Z" />
        <path className={styles.line} d="M94 22 H114" />
      </g>
      {SPECKS.map(([left, r, d]) => (
        <circle key={`${left}-${d}`} className={`${styles.matcha} ${styles.falling}`} style={{ ...delay(d), "--fall": "78px" } as CSSProperties} cx={left} cy="52" r={r} />
      ))}
      <path className={styles.matcha} d="M18 146 C34 146 42 118 60 118 C78 118 86 146 102 146Z" />
      <path className={styles.line} d="M10 146 H110" />
    </svg>
  );
}

/** Usucha from above, foam still moving. */
export function UsuchaCup() {
  return (
    <svg viewBox="0 0 120 160" className={styles.scene} aria-hidden="true" data-loop="">
      <Steam left={60} y={44} />
      <circle className={styles.cream} cx="60" cy="96" r="46" />
      <circle className={styles.matcha} cx="60" cy="96" r="38" />
      <circle className={styles.foamBed} cx="60" cy="96" r="30" />
      <g className={styles.swirling}>
        <path className={styles.swirl} d="M60 72a24 24 0 0 1 24 24" />
        <path className={styles.swirl} d="M60 120a24 24 0 0 1-24-24" />
      </g>
      {[[48, 84, 3, 0], [72, 90, 2.5, 0.8], [56, 108, 3.5, 1.5], [72, 108, 2.5, 0.4]].map(([cx, cy, r, d]) => (
        <circle key={`${cx}-${cy}`} className={`${styles.bubble} ${styles.popping}`} style={delay(d!)} cx={cx} cy={cy} r={r} />
      ))}
    </svg>
  );
}

/** Hojicha, warm and steaming. It never shares matcha's green. */
export function HojichaCup() {
  return (
    <svg viewBox="0 0 120 160" className={styles.scene} aria-hidden="true" data-loop="">
      <Steam left={60} y={70} />
      <defs>
        <clipPath id="wm-hojicha-cup">
          <path d="M22 78 H98 V92 C98 122 82 142 60 142 C38 142 22 122 22 92Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#wm-hojicha-cup)">
        <rect className={`${styles.hojicha} ${styles.sloshing}`} x="14" y="90" width="92" height="60" />
      </g>
      <path className={styles.line} d="M22 78 H98 V92 C98 122 82 142 60 142 C38 142 22 122 22 92Z" />
    </svg>
  );
}

const SURFACE = "M0 8 Q10 0 20 8 T40 8 T60 8 T80 8 T100 8 T120 8 T140 8 T160 8 T180 8 T200 8 V200 H0Z";

function Glass({ id, milk, tint, ice }: { id: string; milk: boolean; tint: "matcha" | "hojicha"; ice: Array<[number, number, number]> }) {
  const layer = tint === "hojicha" ? styles.layerHojicha : styles.layer;
  return (
    <svg viewBox="0 0 160 110" className={styles.scene} aria-hidden="true" data-loop="">
      <defs>
        <clipPath id={id}>
          <path d="M56 14 H104 L100 104 H60Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {milk ? <rect className={styles.milk} x="50" y="10" width="60" height="96" /> : null}
        <g transform={milk ? "translate(30 28)" : "translate(30 24)"}>
          <path className={`${milk ? layer : tint === "hojicha" ? styles.hojicha : styles.matcha} ${styles.sliding}`} d={SURFACE} />
        </g>
        {milk ? (
          <g transform="translate(30 68)">
            <path className={`${styles.milk} ${styles.sliding}`} d={SURFACE} />
          </g>
        ) : null}
        {ice.map(([left, y, d]) => (
          <rect key={`${left}-${y}`} className={`${styles.ice} ${styles.bobbing}`} style={delay(d)} x={left} y={y} width="13" height="13" rx="2" />
        ))}
      </g>
      <path className={styles.line} d="M56 14 H104 L100 104 H60Z" />
    </svg>
  );
}

function SideBowl() {
  return (
    <svg viewBox="0 0 160 110" className={styles.scene} aria-hidden="true" data-loop="">
      <g transform="translate(80 40)">
        <path className={styles.steam} style={delay(0)} pathLength={1} d="M-22 0c-7-9 7-14 0-24" />
        <path className={styles.steam} style={delay(2)} pathLength={1} d="M-8 -2c-7-9 7-14 0-24" />
      </g>
      <defs>
        <clipPath id="wm-side-bowl">
          <path d="M34 50 H126 C126 82 108 100 80 100 C52 100 34 82 34 50Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#wm-side-bowl)">
        <rect className={`${styles.matcha} ${styles.sloshing}`} x="28" y="56" width="104" height="50" />
        <circle className={`${styles.bubble} ${styles.popping}`} style={delay(0)} cx="60" cy="60" r="4" />
        <circle className={`${styles.bubble} ${styles.popping}`} style={delay(0.8)} cx="86" cy="59" r="3" />
        <circle className={`${styles.bubble} ${styles.popping}`} style={delay(1.6)} cx="104" cy="61" r="3.5" />
      </g>
      <path className={styles.line} d="M34 50 H126 C126 82 108 100 80 100 C52 100 34 82 34 50Z" />
      <g transform="translate(94 70) scale(0.42)">
        <g className={styles.whisk}>
          <Whisk />
        </g>
      </g>
    </svg>
  );
}

const DRAWINGS = {
  usucha: () => <SideBowl />,
  "iced-matcha-latte": () => <Glass id="wm-glass-latte" milk tint="matcha" ice={[[62, 32, 0], [84, 46, 1.2], [66, 58, 0.6]]} />,
  "iced-matcha-americano": () => <Glass id="wm-glass-americano" milk={false} tint="matcha" ice={[[66, 36, 0.4], [84, 54, 1.4], [64, 70, 0.9]]} />,
  "hojicha-latte": () => <Glass id="wm-glass-hojicha" milk tint="hojicha" ice={[[62, 32, 0], [84, 46, 1.2], [66, 58, 0.6]]} />,
} as const;

export type RecipeDrawingId = keyof typeof DRAWINGS;

export function RecipeDrawing({ id }: { id: RecipeDrawingId }) {
  return DRAWINGS[id]();
}
