"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Marquee } from "@/components/motion/Marquee";
import { motionAllowed, onFrame } from "@/components/motion/runtime";
import styles from "./AcademyKeeper.module.css";

const STARS: Array<[string, string, number]> = [["-26px", "20%", 12], ["92%", "6%", 10], ["104%", "52%", 12], ["-22px", "74%", 9], ["46%", "-30px", 11]];

/**
 * "Every tea has a keeper.": the heading glides in from both sides with scroll (±4° tilt and blur settling to
 * zero), ghost b-roll lines run behind, and the copy wraps around the arch window.
 */
export function AcademyKeeper({ intro, ghost }: { intro: string; ghost: string }) {
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
      if (left) {
        left.style.transform = `translateX(${(-k * 30).toFixed(2)}vw) rotate(${(-k * 4).toFixed(2)}deg)`;
        left.style.filter = `blur(${(k * 8).toFixed(1)}px)`;
      }
      if (right) {
        right.style.transform = `translateX(${(k * 30).toFixed(2)}vw) rotate(${(k * 4).toFixed(2)}deg)`;
        right.style.filter = `blur(${(k * 8).toFixed(1)}px)`;
      }
    });
  }, []);

  return (
    <section className={styles.section} data-cat-line="Every keeper is a cat. Hello!" aria-labelledby="wm-keeper-title">
      <div className={styles.ghosts} aria-hidden="true">
        <Marquee direction={1} skew={false} speed={0.5} className={styles.ghostRow}>
          <span>{ghost}</span>
        </Marquee>
        <Marquee direction={-1} skew={false} speed={0.5} className={styles.ghostRow}>
          <span>{ghost}</span>
        </Marquee>
      </div>
      <div className={`container ${styles.inner}`}>
        <span className={`label ${styles.kicker}`} data-reveal="up">
          Witcha Academy
        </span>
        <div className={styles.arch} data-reveal="left" data-breathe="">
          {/* eslint-disable-next-line @next/next/no-img-element -- floated with shape-outside; sized by CSS */}
          <img
            src="/art/02-charmer-key-visual.webp"
            alt="The Charmer, a warm taupe cat with a teal satchel, beside an iced matcha latte in a conservatory."
            width={820}
            height={820}
            loading="lazy"
          />
          {STARS.map(([l, t, s], i) => (
            <span key={i} data-twinkle="" aria-hidden="true" className="twinkle" style={{ left: l, top: t, width: s, height: s }} />
          ))}
        </div>
        <h2 ref={heading} id="wm-keeper-title" className={`display-section ${styles.heading}`}>
          <span data-l="">Every tea</span>
          <span data-r="">
            has a <i className="serif-italic">keeper.</i>
          </span>
        </h2>
        <p className={styles.copy} data-reveal="up">
          {intro} <span className="pending-tag">Copy pending Brand Bible</span>
        </p>
        <Link href="/pages/academy" className={styles.cta} data-reveal="up">
          Meet the class
        </Link>
        <div className={styles.clear} />
      </div>
    </section>
  );
}
