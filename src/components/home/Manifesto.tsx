"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { clamp01, loopsAllowed, motionAllowed, onFrame, sectionProgress } from "@/components/motion/runtime";
import { TASTE_FIRST } from "@/lib/content/home";
import { TEAS_HREF } from "@/lib/config/site";
import styles from "./Manifesto.module.css";

/**
 * Resolves a colour token to 0–255 RGB so the scroll can blend between two of them. Painted through a canvas,
 * because `color-mix()` tokens compute to `color(srgb 0–1 …)`, not `rgb()`.
 */
function readColour(token: string, fallback: [number, number, number]): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const css = getComputedStyle(probe).color;
  probe.remove();
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r ?? fallback[0], g ?? fallback[1], b ?? fallback[2]];
}

/**
 * "Taste comes first." (copy v5.3 §1): the paragraph types itself in as you scroll, letter by letter, from the
 * unlit colour (still readable, 3.6:1 at this size) to charcoal. Key words get a gold underline on cream that
 * draws as they are typed, and the bowl fills with matcha.
 */
export function Manifesto({ words }: { words: Array<{ w: string; key: boolean }> }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const chars = Array.from(section.querySelectorAll<HTMLElement>("[data-c]"));
    const keys = Array.from(section.querySelectorAll<HTMLElement>("[data-w]")).flatMap((w) => {
      const line = w.querySelector<HTMLElement>("[data-u]");
      const own = Array.from(w.querySelectorAll<HTMLElement>("[data-c]"));
      return line && own.length ? [{ line, from: chars.indexOf(own[0]!), len: own.length }] : [];
    });
    const fill = section.querySelector<HTMLElement>("[data-fill]");
    const foam = section.querySelector<HTMLElement>("[data-foam-ring]");
    const lit = readColour("--text-primary", [56, 56, 50]);
    const unlit = readColour("--text-unlit", [138, 136, 128]);
    const shown = new Array<number>(chars.length).fill(-1);
    return onFrame(({ now }) => {
      const motion = motionAllowed();
      const p = motion ? sectionProgress(section) : 1;
      // Finishes typing a little before the section ends, so the last line sits lit for a moment.
      const count = p * chars.length * 1.2;
      chars.forEach((c, i) => {
        // Each letter flips over about two letters' worth of scroll: quick enough to read as typing.
        const t = Math.round(clamp01((count - i) / 2) * 20) / 20;
        if (shown[i] === t) return;
        shown[i] = t;
        const rgb = unlit.map((u, k) => Math.round(u + (lit[k]! - u) * t));
        c.style.color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      });
      keys.forEach(({ line, from, len }) => {
        line.style.transform = `rotate(-1.2deg) scaleX(${clamp01((count - from) / len).toFixed(3)})`;
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
                  {w.key ? <span data-u="" className={styles.underline} aria-hidden="true" /> : null}
                  {Array.from(w.w).map((ch, j) => (
                    <span key={j} data-c="" className={styles.char}>
                      {ch}
                    </span>
                  ))}
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
