"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { clamp01, loopsAllowed, motionAllowed, onFrame, sectionProgress } from "@/components/motion/runtime";
import { TASTE_FIRST } from "@/lib/content/home";
import { TEAS_HREF } from "@/lib/config/site";
import styles from "./Manifesto.module.css";

/** Resolves a colour token to RGB so the scroll can blend between two of them. */
function readColour(token: string, fallback: [number, number, number]): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/[\d.]+/g);
  probe.remove();
  return m && m.length >= 3 ? [Number(m[0]), Number(m[1]), Number(m[2])] : fallback;
}

/**
 * "Taste comes first." (copy v5.3 §1): words light up with scroll (unlit words stay readable, 3.6:1 at this
 * size), key words get a gold underline on cream, and the bowl fills with matcha.
 */
export function Manifesto({ words }: { words: Array<{ w: string; key: boolean }> }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const els = section.querySelectorAll<HTMLElement>("[data-w]");
    const fill = section.querySelector<HTMLElement>("[data-fill]");
    const foam = section.querySelector<HTMLElement>("[data-foam-ring]");
    const lit = readColour("--text-primary", [56, 56, 50]);
    const unread = readColour("--text-unlit", [138, 136, 128]);
    return onFrame(({ now }) => {
      const motion = motionAllowed();
      const p = motion ? sectionProgress(section) : 1;
      const count = p * els.length * 1.15;
      els.forEach((w, i) => {
        const t = clamp01(count - i);
        const c = unread.map((u, k) => Math.round(u + (lit[k]! - u) * t));
        w.style.color = `rgb(${c[0]},${c[1]},${c[2]})`;
        const u = w.firstElementChild as HTMLElement | null;
        if (u) u.style.transform = `rotate(-1.2deg) scaleX(${t.toFixed(3)})`;
      });
      if (fill) fill.style.height = `${(14 + 66 * p).toFixed(1)}%`;
      if (foam && loopsAllowed()) foam.style.transform = `rotate(${((now * 0.006) % 360).toFixed(1)}deg)`;
    });
  }, []);

  return (
    <section ref={ref} className={styles.section} aria-labelledby="wm-why-title">
      <div className={styles.stage}>
        <div className={styles.bowl} aria-hidden="true">
          <div className={styles.fill} data-fill="">
            <div className={styles.waveWrap}>
              <div className={styles.wave} data-wave="">
                <svg viewBox="0 0 200 14" preserveAspectRatio="none">
                  <path d="M0 7 Q12.5 0 25 7 T50 7 T75 7 T100 7 T125 7 T150 7 T175 7 T200 7 V14 H0 Z" fill="var(--matcha-mid)" />
                </svg>
              </div>
            </div>
          </div>
          <div className={styles.foam} data-foam-ring="" />
        </div>
        <div className={styles.content}>
          <h2 id="wm-why-title" className="label">
            {TASTE_FIRST.heading}
          </h2>
          <p className={styles.words}>
            {/* Real spaces between the word spans, so the sentence reads as one for assistive tech and copy-paste. */}
            {words.map((w, i) => (
              <Fragment key={i}>
                <span data-w="" className={styles.word}>
                  {w.key ? <span className={styles.underline} aria-hidden="true" /> : null}
                  {w.w}
                </span>{" "}
              </Fragment>
            ))}
          </p>
          <Link href={TEAS_HREF} className="label-link" data-reveal="right">
            {TASTE_FIRST.link}
          </Link>
        </div>
      </div>
    </section>
  );
}
