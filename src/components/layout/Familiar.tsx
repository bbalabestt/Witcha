"use client";

import { useEffect, useRef, useState } from "react";
import { FAMILIAR_HIDDEN_KEY, FAMILIAR_LINES, FAMILIAR_SPRITES, onFamiliarCue, type SpriteName } from "@/lib/familiar";
import styles from "./Familiar.module.css";

const W_PX = 64;
const FLOOR_GAP = 54;
const STICKY_BAR = 76;
/** Keep clear of the floating MENU (left) and TOP (right) arches. */
const EDGE_LEFT = 88;
const EDGE_RIGHT = 152;

type CatState = {
  x: number;
  y: number;
  tx: number;
  dir: 1 | -1;
  t: number;
  run: boolean;
  lastScroll: number;
  lastWander: number;
  blinkAt: number;
  blinkUntil: number;
};

function readColours() {
  const css = getComputedStyle(document.documentElement);
  return {
    b: css.getPropertyValue("--brand-deep-blue").trim(),
    e: css.getPropertyValue("--brand-ivory").trim(),
    p: css.getPropertyValue("--brand-blush").trim(),
  };
}

/**
 * The pixel familiar from Prototype V2: an Academy cat that walks along the bottom of the page as you
 * scroll, wanders when idle, runs toward the cart when something is added, and talks when tapped.
 * Under reduced motion it sits still. It can be hidden from the footer (WCAG 2.2.2).
 */
export function Familiar() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cat = useRef<CatState | null>(null);
  const [bubble, setBubble] = useState("");
  const [hidden, setHidden] = useState(true);
  const bubbleTimer = useRef<number | undefined>(undefined);

  // Visibility preference (default visible); read after mount so SSR and hydration agree.
  useEffect(() => {
    const read = () => {
      let off = false;
      try {
        off = window.localStorage.getItem(FAMILIAR_HIDDEN_KEY) === "1";
      } catch {
        off = false;
      }
      setHidden(off);
    };
    const t = window.setTimeout(read, 0);
    window.addEventListener("wm:familiar-visibility", read);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("wm:familiar-visibility", read);
    };
  }, []);

  function say(text: string, ms = 2400) {
    setBubble(text);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(""), ms);
  }

  useEffect(() => {
    if (hidden) return;
    const el = box.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    const colours = readColours();
    let lastFrame: SpriteName | null = null;
    const draw = (frame: SpriteName) => {
      if (frame === lastFrame) return;
      lastFrame = frame;
      ctx.clearRect(0, 0, 16, 12);
      FAMILIAR_SPRITES[frame].forEach((row, y) => {
        for (let x = 0; x < 16; x++) {
          const c = row[x];
          if (c === "." || c === undefined) continue;
          ctx.fillStyle = c === "e" ? colours.e : c === "p" ? colours.p : colours.b;
          ctx.fillRect(x, y, 1, 1);
        }
      });
    };

    const H0 = window.innerHeight;
    const now0 = performance.now();
    cat.current ??= { x: EDGE_LEFT, y: H0 - FLOOR_GAP, tx: EDGE_LEFT, dir: 1, t: 0, run: false, lastScroll: now0, lastWander: now0, blinkAt: now0 + 2600, blinkUntil: 0 };
    const c = cat.current;
    const clampX = (x: number) => Math.max(EDGE_LEFT, Math.min(window.innerWidth - EDGE_RIGHT, x));
    const floor = () => window.innerHeight - FLOOR_GAP - (document.documentElement.style.getPropertyValue("--float-bottom") ? STICKY_BAR : 0);

    const place = (hop = 0) => {
      el.style.transform = `translate(${c.x.toFixed(1)}px, ${(c.y + hop).toFixed(1)}px)`;
      cv.style.transform = `scaleX(${c.dir})`;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      c.x = clampX(c.x);
      c.y = floor();
      draw("sit");
      place();
      const unsub = onFamiliarCue((cue) => cue.say && say(cue.say, cue.ms));
      return unsub;
    }

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy !== 0) {
        c.tx = clampX(c.tx + dy * 0.9);
        c.lastScroll = performance.now();
      }
    };

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const W = window.innerWidth;
      if (!c.run && now - c.lastScroll > 7000 && now - c.lastWander > 7000) {
        c.tx = clampX(40 + Math.random() * (W - 160));
        c.lastWander = now;
      }
      // Step aside for the home hero copy when it sits at the bottom of the screen.
      const copy = document.querySelector("[data-hero-copy]");
      if (copy) {
        const r = copy.getBoundingClientRect();
        if (r.bottom > window.innerHeight - 70 && r.top < window.innerHeight && c.tx < r.right + 16) c.tx = clampX(r.right + 16);
      }
      const tx = clampX(c.tx);
      const ty = floor();
      const dx = tx - c.x;
      const dyy = ty - c.y;
      const speed = c.run ? 7 : 2.6;
      const moving = Math.abs(dx) > 1.5 || Math.abs(dyy) > 1.5;
      let hop = 0;
      if (moving) {
        c.x += Math.sign(dx) * Math.min(Math.abs(dx), speed);
        c.y += dyy * 0.12;
        if (Math.abs(dx) > 1.5) c.dir = dx > 0 ? 1 : -1;
        c.t += 1;
        const beat = c.run ? 4 : 8;
        draw(Math.floor(c.t / beat) % 2 ? "walkA" : "walkB");
        if (Math.abs(dx) > 1.5) hop = -Math.abs(Math.sin((c.t / beat) * Math.PI)) * (c.run ? 5 : 2);
      } else {
        c.run = false;
        if (now > c.blinkAt) {
          c.blinkAt = now + 2600 + Math.random() * 2000;
          c.blinkUntil = now + 140;
        }
        draw(now < c.blinkUntil ? "blink" : "sit");
      }
      place(hop);
    };

    const unsub = onFamiliarCue((cue) => {
      if (cue.say) say(cue.say, cue.ms);
      if (cue.run === "cart") {
        c.run = true;
        // Toward the cart drawer, which opens on the right.
        c.tx = clampX(window.innerWidth - (window.innerWidth > 700 ? 560 : 120));
        c.lastScroll = performance.now();
      }
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      unsub();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [hidden]);

  useEffect(() => () => window.clearTimeout(bubbleTimer.current), []);

  if (hidden) return null;
  return (
    <div ref={box} className={styles.familiar}>
      {bubble ? (
        <div className={styles.bubble} aria-hidden="true">
          {bubble}
        </div>
      ) : null}
      <button
        type="button"
        className={styles.hit}
        aria-label="The Academy cat"
        title="A pixel familiar from the Academy"
        onClick={() => say(FAMILIAR_LINES[Math.floor(Math.random() * FAMILIAR_LINES.length)] ?? FAMILIAR_LINES[0])}
      >
        <canvas ref={canvas} width={16} height={12} className={styles.canvas} style={{ width: W_PX }} />
      </button>
    </div>
  );
}

/** Footer switch to hide or show the cat (remembered on this device). */
export function FamiliarToggle({ className }: { className?: string }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        setHidden(window.localStorage.getItem(FAMILIAR_HIDDEN_KEY) === "1");
      } catch {
        setHidden(false);
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <button
      type="button"
      className={className}
      aria-pressed={!hidden}
      onClick={() => {
        const next = !hidden;
        setHidden(next);
        try {
          window.localStorage.setItem(FAMILIAR_HIDDEN_KEY, next ? "1" : "0");
        } catch {
          // Storage blocked: the choice lasts for this page only.
        }
        window.dispatchEvent(new Event("wm:familiar-visibility"));
      }}
    >
      {hidden ? "Show the Academy cat" : "Hide the Academy cat"}
    </button>
  );
}
