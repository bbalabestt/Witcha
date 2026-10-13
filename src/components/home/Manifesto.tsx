"use client";

import { useEffect, useRef } from "react";
import styles from "./Home.module.css";

/** "Why it tastes good": words light up as the section scrolls past. Fully lit under reduced motion. */
export function Manifesto({ text, chips }: { text: string; chips: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const H = window.innerHeight;
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - H)));
      const lit = p * spans.length * 1.15;
      spans.forEach((s, i) => (s.style.opacity = String(Math.max(0.14, Math.min(1, lit - i)))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      spans.forEach((s) => (s.style.opacity = ""));
    };
  }, []);

  return (
    <section ref={ref} className={styles.manifesto} aria-labelledby="manifesto-title">
      <div className={styles.manifestoStage}>
        <div className={styles.manifestoInner}>
          <h2 id="manifesto-title" className="label">
            Why it tastes good
          </h2>
          <p className={styles.manifestoText}>
            {words.map((w, i) => (
              <span key={i} data-w="">
                {w}{" "}
              </span>
            ))}
          </p>
          {chips.length ? (
            <ul className={styles.chips}>
              {chips.map((c) => (
                <li key={c} data-reveal="right">
                  {c}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
