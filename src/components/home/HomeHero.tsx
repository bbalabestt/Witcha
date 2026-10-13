"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./Home.module.css";

/** Floating gold and ivory motes (prototype positions; drift values fixed so SSR and client agree). */
const HERO_DOTS = [
  { x: 12, y: 70, size: 4, tone: "gold", dx: -22, dy: 180, dur: 7.2, delay: 0.4 },
  { x: 22, y: 80, size: 3, tone: "ivory", dx: 30, dy: 240, dur: 8.6, delay: 1.9 },
  { x: 34, y: 66, size: 5, tone: "gold", dx: 12, dy: 150, dur: 6.1, delay: 3.1 },
  { x: 46, y: 84, size: 3, tone: "ivory", dx: -35, dy: 280, dur: 9.4, delay: 0.9 },
  { x: 55, y: 72, size: 4, tone: "gold", dx: 18, dy: 200, dur: 7.8, delay: 2.6 },
  { x: 63, y: 88, size: 3, tone: "ivory", dx: -10, dy: 300, dur: 9.9, delay: 1.2 },
  { x: 72, y: 68, size: 5, tone: "gold", dx: 38, dy: 170, dur: 6.7, delay: 3.6 },
  { x: 81, y: 78, size: 3, tone: "ivory", dx: -26, dy: 220, dur: 8.1, delay: 0.2 },
  { x: 90, y: 62, size: 4, tone: "gold", dx: 8, dy: 130, dur: 5.6, delay: 2.2 },
  { x: 6, y: 90, size: 3, tone: "ivory", dx: 24, dy: 260, dur: 9.1, delay: 3.9 },
];

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scroll-scrubbed hero (prototype): the arch grows to fill the screen while the headline parts,
 * then "Which matcha today?" fades in. Progress is written to CSS variables; the CSS does the rest.
 * Under reduced motion the section is a normal, static hero.
 */
export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const arch = archRef.current;
    const stage = (el?.firstElementChild as HTMLElement | null) ?? null;
    const scrub = window.matchMedia("(prefers-reduced-motion: no-preference) and (min-width: 768px)");
    if (!el || !arch || !stage || !scrub.matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const H = window.innerHeight;
      // Stage fills the viewport below the (non-sticky) header, as in the prototype.
      const headerBottom = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
      stage.style.height = `${Math.max(420, H - headerBottom)}px`;
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - H)));
      const cover = Math.max(window.innerWidth / Math.max(1, arch.offsetWidth), H / Math.max(1, arch.offsetHeight)) * 1.25;
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--e", easeInOut(p).toFixed(4));
      el.style.setProperty("--cover", cover.toFixed(3));
      el.toggleAttribute("data-inside", p > 0.62);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      stage.style.height = "";
    };
  }, []);

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroStage}>
        <span className={styles.heroBgArch} aria-hidden="true" />
        <span className={styles.heroDots} aria-hidden="true">
          {HERO_DOTS.map((d, i) => (
            <span
              key={i}
              data-tone={d.tone}
              style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, "--dx": `${d.dx}px`, "--dy": `${-d.dy}px`, "--dur": `${d.dur}s`, "--delay": `${d.delay}s` } as CSSProperties}
            />
          ))}
        </span>
        <div ref={archRef} className={styles.heroArch} aria-hidden="true">
          <span className={styles.heroRing} />
          <div className={styles.heroArchFill}>
            <div className={styles.heroArtSlot}>Tin + character · pending artist</div>
          </div>
        </div>
        <div className={styles.heroBadge} aria-hidden="true">
          <svg viewBox="0 0 130 130">
            <defs>
              <path id="wm-hero-circle" d="M65 65 m-52 0 a52 52 0 1 1 104 0 a52 52 0 1 1 -104 0" />
            </defs>
            <circle cx="65" cy="65" r="64" />
            <text>
              <textPath href="#wm-hero-circle">MATCHA, WITH TASTE · WHICH MATCHA TODAY · </textPath>
            </text>
          </svg>
        </div>

        <h1 id="hero-title" className="visually-hidden">
          A Little Magic in every Matcha Moment.
        </h1>
        <div className={styles.heroL1} aria-hidden="true">
          <span className={styles.heroDisplay}>A Little Magic</span>
        </div>
        <div className={styles.heroL2} aria-hidden="true">
          <span className={styles.heroItalic}>in every</span>
          <span className={styles.heroDisplay}>Matcha Moment.</span>
        </div>

        <div className={styles.heroCopy} data-hero-copy="">
          <p>Japanese matcha, chosen for taste and brought to life by the cats of Witcha Academy.</p>
          <div className={styles.actions}>
            <Button href="/collections/matcha">Shop the matcha</Button>
            <Button href="/pages/academy" variant="secondary">
              Meet the Academy
            </Button>
          </div>
        </div>
        <span className={styles.heroScroll} aria-hidden="true">
          Scroll to step inside
        </span>
        <div className={styles.heroInside} aria-hidden="true">
          <span className="label">Welcome to Witcha Academy</span>
          <span className={styles.heroInsideTitle}>Which matcha today?</span>
          <span>Two teas on one scale, from bright to deep. Pick by taste, not jargon.</span>
        </div>
      </div>
    </section>
  );
}
