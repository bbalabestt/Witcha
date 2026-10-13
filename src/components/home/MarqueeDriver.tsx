"use client";

import { useEffect } from "react";

/**
 * Drives every `[data-marquee]` track: a steady drift that speeds up and skews with scroll velocity
 * (Prototype V2). Replaces the CSS fallback loop once running; does nothing under reduced motion.
 */
export function MarqueeDriver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tracks = Array.from(document.querySelectorAll<HTMLElement>("[data-marquee]"));
    if (!tracks.length) return;
    tracks.forEach((t) => t.setAttribute("data-driven", ""));
    let offset = 0;
    let vel = 0;
    let lastY = window.scrollY;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const y = window.scrollY;
      vel = vel * 0.85 + (y - lastY) * 0.15;
      lastY = y;
      offset += 0.7 + Math.min(14, Math.abs(vel) * 0.35);
      const skew = Math.max(-10, Math.min(10, vel * 0.4));
      for (const t of tracks) {
        const dir = Number(t.dataset.marquee) || 1;
        const half = t.scrollWidth / 2 || 1;
        const o = (((offset * dir) % half) + half) % half;
        t.style.transform = `translateX(${(-o).toFixed(1)}px) skewX(${(-skew * dir).toFixed(2)}deg)`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      tracks.forEach((t) => {
        t.removeAttribute("data-driven");
        t.style.transform = "";
      });
    };
  }, []);
  return null;
}
