"use client";

import { useEffect, useRef } from "react";
import { motionAllowed, onFrame } from "@/components/motion/runtime";
import { PAW_EVENT, WHISK_EVENT } from "./MatchaBowl";
import styles from "./CatPeek.module.css";

/**
 * The Academy cat, as a gesture rather than a character: a line-drawn head peeking over the top of the hero
 * arch. Its eyes follow the pointer (or, on touch screens, the whisk), it blinks now and then, and it leans in
 * when its paw dabs the foam. Same cream-and-charcoal line style as the tins; no name, no character art, so it
 * waits on nothing the founders have not approved. Decorative only.
 */
export function CatPeek() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || !motionAllowed()) return;
    const eyes = svg.querySelectorAll<SVGGElement>("[data-eye]");
    const head = svg.querySelector<SVGGElement>("[data-head]");
    let target: { x: number; y: number } | null = null;
    let pointerAt = 0;
    let look = { x: 0, y: 0 };
    let lean = 0;

    const onPointer = (e: PointerEvent) => {
      target = { x: e.clientX, y: e.clientY };
      pointerAt = performance.now();
    };
    const onWhisk = (e: Event) => {
      // The pointer wins while it is moving; otherwise the cat watches the whisk.
      if (performance.now() - pointerAt < 1500) return;
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      target = { x: d.x, y: d.y };
    };
    const onPaw = () => {
      lean = 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener(WHISK_EVENT, onWhisk);
    window.addEventListener(PAW_EVENT, onPaw);

    const stop = onFrame(() => {
      const r = svg.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      let gx = 0;
      let gy = 0.6;
      if (target) {
        const dx = target.x - (r.left + r.width / 2);
        const dy = target.y - (r.top + r.height * 0.66);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 240);
        gx = (dx / d) * k;
        gy = (dy / d) * k;
      }
      look = { x: look.x + (gx - look.x) * 0.15, y: look.y + (gy - look.y) * 0.15 };
      eyes.forEach((eye) => eye.setAttribute("transform", `translate(${(look.x * 3).toFixed(2)} ${(look.y * 3).toFixed(2)})`));
      lean *= 0.94;
      head?.setAttribute("transform", `translate(0 ${(lean * 6).toFixed(2)}) rotate(${(look.x * 4).toFixed(2)} 60 80)`);
    });

    return () => {
      stop();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener(WHISK_EVENT, onWhisk);
      window.removeEventListener(PAW_EVENT, onPaw);
    };
  }, []);

  return (
    <svg ref={ref} viewBox="0 0 120 90" className={styles.cat} aria-hidden="true">
      <g data-head="">
        <path
          className={styles.head}
          d="M8 92 C8 64 11 50 18 41 L15 6 L41 25 C52 21 68 21 79 25 L105 6 L102 41 C109 50 112 64 112 92 Z"
        />
        <path className={styles.line} d="M22 33 L20.5 15 L35 26 M98 33 L99.5 15 L85 26" />
        <g className={styles.blink} data-loop="">
          <g data-eye="">
            <ellipse cx="43" cy="55" rx="5" ry="6.5" className={styles.eye} />
            <circle cx="44.6" cy="52.6" r="1.4" className={styles.glint} />
          </g>
          <g data-eye="">
            <ellipse cx="77" cy="55" rx="5" ry="6.5" className={styles.eye} />
            <circle cx="78.6" cy="52.6" r="1.4" className={styles.glint} />
          </g>
        </g>
        <path className={styles.nose} d="M56.5 66 H63.5 L60 70 Z" />
        <path className={styles.whiskers} d="M38 68 L14 64 M38 72 L15 74 M82 68 L106 64 M82 72 L105 74" />
      </g>
    </svg>
  );
}
