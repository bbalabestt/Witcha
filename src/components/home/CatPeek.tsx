"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import catPeek from "@/assets/cat/cat-peek.png";
import { motionAllowed, onFrame } from "@/components/motion/runtime";
import { PAW_EVENT, WHISK_EVENT } from "./MatchaBowl";
import styles from "./CatPeek.module.css";

/** Pupils measured in the client's drawing by `scripts/build-cat-peek.py` (image pixels, 485 × 635). */
const EYES = [
  { cx: 180.5, cy: 279.8, r: 23 },
  { cx: 323.9, cy: 277.1, r: 23.8 },
] as const;
/** How far a pupil can travel inside its eye, in image pixels. */
const TRAVEL = 5;

/**
 * The client's cat (their drawing, supplied 11 Nov 2026) peeking over the top of the hero arch, eyes on the
 * steaming bowl: the pupils follow the whisk while it moves and settle on the bowl when it rests. It blinks
 * now and then and leans in when its paw dabs the foam. Decorative only.
 */
export function CatPeek() {
  const ref = useRef<HTMLDivElement>(null);
  // The cat appears in both the desktop and phone heroes, so clip ids must be unique per instance.
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const pupils = root.querySelectorAll<SVGGElement>("[data-pupil]");
    const svg = root.querySelector("svg");
    if (!svg || !motionAllowed()) return;
    let target: { x: number; y: number } | null = null;
    let look = { x: 0, y: 1 };
    let lean = 0;

    const onWhisk = (e: Event) => {
      target = (e as CustomEvent<{ x: number; y: number }>).detail;
    };
    const onPaw = () => {
      lean = 1;
    };
    window.addEventListener(WHISK_EVENT, onWhisk);
    window.addEventListener(PAW_EVENT, onPaw);

    const stop = onFrame(() => {
      const r = svg.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > window.innerHeight) return;
      // Direction from the middle of the eyes to the whisk (or the bowl), as a unit vector.
      let gx = 0;
      let gy = 1;
      if (target) {
        const ex = r.left + r.width * 0.52;
        const ey = r.top + r.height * 0.44;
        const dx = target.x - ex;
        const dy = target.y - ey;
        const d = Math.hypot(dx, dy) || 1;
        gx = dx / d;
        gy = dy / d;
      }
      look = { x: look.x + (gx - look.x) * 0.12, y: look.y + (gy - look.y) * 0.12 };
      const t = `translate(${(look.x * TRAVEL).toFixed(2)} ${(look.y * TRAVEL).toFixed(2)})`;
      pupils.forEach((p) => p.setAttribute("transform", t));
      lean *= 0.94;
      root.style.setProperty("--lean", `${(lean * 5).toFixed(2)}%`);
      root.style.setProperty("--tilt", `${(look.x * 5).toFixed(2)}deg`);
    });

    return () => {
      stop();
      window.removeEventListener(WHISK_EVENT, onWhisk);
      window.removeEventListener(PAW_EVENT, onPaw);
    };
  }, []);

  return (
    <div ref={ref} className={styles.cat} aria-hidden="true">
      <div className={styles.head}>
        <Image src={catPeek} alt="" sizes="(max-width: 767px) 110px, 180px" className={styles.drawing} priority />
        <svg viewBox={`0 0 ${catPeek.width} ${catPeek.height}`} className={styles.eyes}>
          <defs>
            {EYES.map((e, i) => (
              <clipPath key={i} id={`${uid}-eye-${i}`}>
                <circle cx={e.cx} cy={e.cy} r={e.r + 1.5} />
              </clipPath>
            ))}
          </defs>
          {EYES.map((e, i) => (
            <g key={i} clipPath={`url(#${uid}-eye-${i})`}>
              <g data-pupil="">
                <circle cx={e.cx} cy={e.cy} r={e.r - 2} className={styles.pupil} />
                <circle cx={e.cx + e.r * 0.32} cy={e.cy - e.r * 0.36} r={e.r * 0.16} className={styles.glint} />
              </g>
              {/* The lid: drops over the eye for a blink. */}
              <rect x={e.cx - e.r - 2} y={e.cy - e.r - 2} width={(e.r + 2) * 2} height={(e.r + 2) * 2} className={styles.lid} data-loop="" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
