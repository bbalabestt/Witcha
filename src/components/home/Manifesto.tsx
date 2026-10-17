"use client";

import { useEffect, useRef } from "react";
import { clamp01, motionAllowed, onFrame, sectionProgress } from "@/components/motion/runtime";
import styles from "./Manifesto.module.css";

const MOTES: Array<[number, number, number, "gold" | "blue"]> = [
  [8, 22, 5, "gold"], [18, 78, 4, "blue"], [34, 14, 3, "gold"], [52, 86, 5, "blue"],
  [66, 18, 4, "gold"], [82, 30, 3, "blue"], [90, 62, 4, "gold"], [4, 58, 4, "blue"],
];
const STARS: Array<[number, number, number]> = [[12, 12, 12], [46, 8, 9], [78, 12, 14], [6, 84, 10], [60, 74, 8]];

/* Unread words sit at #658399 (≈3.7:1, passes 3:1 for large text) and step to the primary as they light. */
const UNREAD = [101, 131, 153];

function readPrimary(): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = "var(--wm-primary)";
  document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/\d+/g);
  probe.remove();
  return m && m.length >= 3 ? [Number(m[0]), Number(m[1]), Number(m[2])] : [35, 57, 91];
}

/** "Why it tastes good": words light up with scroll, key words get a gold underline, the bowl fills. */
export function Manifesto({ words, facts }: { words: Array<{ w: string; key: boolean }>; facts: string[] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const els = section.querySelectorAll<HTMLElement>("[data-w]");
    const fill = section.querySelector<HTMLElement>("[data-fill]");
    const foam = section.querySelector<HTMLElement>("[data-foam-ring]");
    const lit = readPrimary();
    return onFrame(({ now }) => {
      const motion = motionAllowed();
      const p = motion ? sectionProgress(section) : 1;
      const count = p * els.length * 1.15;
      els.forEach((w, i) => {
        const t = clamp01(count - i);
        const c = UNREAD.map((u, k) => Math.round(u + (lit[k]! - u) * t));
        w.style.color = `rgb(${c[0]},${c[1]},${c[2]})`;
        const u = w.firstElementChild as HTMLElement | null;
        if (u) u.style.transform = `rotate(-1.2deg) scaleX(${t.toFixed(3)})`;
      });
      if (fill) fill.style.height = `${(14 + 66 * p).toFixed(1)}%`;
      if (foam && motion) foam.style.transform = `rotate(${((now * 0.006) % 360).toFixed(1)}deg)`;
    });
  }, []);

  return (
    <section ref={ref} className={styles.section} data-cat-line="Taste first. Always." aria-labelledby="wm-why-title">
      <div className={styles.stage}>
        <div className={styles.bowl} aria-hidden="true">
          <div className={styles.fill} data-fill="">
            <div className={styles.waveWrap}>
              <div className={styles.wave} data-wave="">
                <svg viewBox="0 0 200 14" preserveAspectRatio="none">
                  <path d="M0 7 Q12.5 0 25 7 T50 7 T75 7 T100 7 T125 7 T150 7 T175 7 T200 7 V14 H0 Z" fill="var(--surface-soft)" />
                </svg>
              </div>
            </div>
          </div>
          <div className={styles.foam} data-foam-ring="" />
        </div>
        {MOTES.map(([l, t, s, c], i) => (
          <span key={i} data-float="" aria-hidden="true" className="mote" style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, background: c === "gold" ? "var(--brand-gold)" : "var(--surface-hover)" }} />
        ))}
        {STARS.map(([l, t, s], i) => (
          <span key={i} data-twinkle="" aria-hidden="true" className="twinkle" style={{ left: `${l}%`, top: `${t}%`, width: s, height: s }} />
        ))}
        <div className={styles.content}>
          <h2 id="wm-why-title" className="label">
            Why it tastes good
          </h2>
          <p className={styles.words}>
            {words.map((w, i) => (
              <span key={i} data-w="" className={styles.word}>
                {w.key ? <span className={styles.underline} aria-hidden="true" /> : null}
                {w.w}
              </span>
            ))}
          </p>
          <div className={styles.facts}>
            {facts.map((f, i) => (
              <span key={f} data-reveal="right" data-delay={String(i * 100)} className={styles.fact}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
