"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motionAllowed, onFrame } from "@/components/motion/runtime";
import { TinPlaceholder } from "@/components/ui/TinPlaceholder";
import { ACADEMY } from "@/lib/content/home";
import styles from "./AcademyPreview.module.css";

/**
 * "Meet Witcha Academy." (copy v5.3 §1): the heading glides in from both sides with scroll (±4° tilt, no blur,
 * so it reads at every step) and the copy wraps around the arch window. The arch holds the four tins, one per
 * Academy title; the cat image waits for the approved character (vendor list).
 */
export function AcademyPreview() {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h = heading.current;
    if (!h) return;
    const left = h.querySelector<HTMLElement>("[data-l]");
    const right = h.querySelector<HTMLElement>("[data-r]");
    return onFrame(() => {
      const r = h.getBoundingClientRect();
      const H = window.innerHeight;
      // Settles when the heading is about 45% up the viewport.
      const t = motionAllowed() ? Math.max(0, Math.min(1, (H - r.top) / (H * 0.55))) : 1;
      const k = 1 - t;
      if (left) left.style.transform = `translateX(${(-k * 30).toFixed(2)}vw) rotate(${(-k * 4).toFixed(2)}deg)`;
      if (right) right.style.transform = `translateX(${(k * 30).toFixed(2)}vw) rotate(${(k * 4).toFixed(2)}deg)`;
    });
  }, []);

  return (
    <section className={styles.section} aria-labelledby="wm-academy-title">
      <div className={`container ${styles.inner}`}>
        <span className={`label ${styles.kicker}`} data-reveal="up">
          {ACADEMY.label}
        </span>
        <div className={styles.arch} data-reveal="left" data-breathe="" aria-hidden="true">
          <span className={styles.tins}>
            <TinPlaceholder teaType="matcha" />
            <TinPlaceholder teaType="matcha" />
            <TinPlaceholder teaType="matcha" />
            <TinPlaceholder teaType="hojicha" />
          </span>
        </div>
        <h2 ref={heading} id="wm-academy-title" className={`display-section ${styles.heading}`}>
          <span data-l="">{ACADEMY.headingLeft}</span>
          <span data-r="">
            <i className="serif-italic">{ACADEMY.headingRight}</i>
          </span>
        </h2>
        <p className={styles.copy} data-reveal="up">
          {ACADEMY.body}
        </p>
        <Link href="/pages/academy" className={styles.cta} data-reveal="up">
          {ACADEMY.cta}
        </Link>
        <div className={styles.clear} />
      </div>
    </section>
  );
}
