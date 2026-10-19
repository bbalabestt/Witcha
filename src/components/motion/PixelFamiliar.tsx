"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShopUI } from "@/components/layout/ShopUI";
import { onFamiliar } from "./familiar-events";
import { motionAllowed, onFrame } from "./runtime";
import styles from "./PixelFamiliar.module.css";

/* 16 × 12 sprite frames from Prototype V4: b = body, e = eye, p = nose. */
const FRAMES = {
  walkA: ["..........b...b.", "..........bb.bb.", "..........bbbbb.", ".b........bebeb.", "b.........bbpbb.", "b...bbbbbbbbbb..", ".b.bbbbbbbbbbb..", "..bbbbbbbbbbbb..", "..bbbbbbbbbbb...", "..bb.b....b.bb..", "..b..b....b..b..", ".bb.bb...bb.bb.."],
  walkB: ["..........b...b.", "..........bb.bb.", "..........bbbbb.", "b.........bebeb.", "b.........bbpbb.", ".b..bbbbbbbbbb..", "..bbbbbbbbbbbb..", "..bbbbbbbbbbbb..", "..bbbbbbbbbbb...", "...bb.b..bb.b...", "...b..b..b..b...", "..bb.bb.bb.bb..."],
  sit: ["..........b...b.", "..........bb.bb.", "..........bbbbb.", "..........bebeb.", "..........bbpbb.", ".........bbbbbb.", "........bbbbbbb.", "..b.....bbbbbbb.", ".b.....bbbbbbbb.", ".b....bbbbbbbbb.", "..bbbbbbbbbbbbb.", "....bbbb.bb.bb.."],
  blink: ["..........b...b.", "..........bb.bb.", "..........bbbbb.", "..........bbbbb.", "..........bbpbb.", ".........bbbbbb.", "........bbbbbbb.", "..b.....bbbbbbb.", ".b.....bbbbbbbb.", ".b....bbbbbbbbb.", "..bbbbbbbbbbbbb.", "....bbbb.bb.bb.."],
} as const;
type FrameName = keyof typeof FRAMES;

const CLICK_LINES = ["Which matcha today?", "Matcha, with taste.", "Mrrp. Try the deep one.", "Two grams. Whisk. Bliss."];

/**
 * The pixel familiar (approved exception to the no-cat-imagery rule, V2.1 brief 1.7). It walks with scroll,
 * wanders when idle, keeps clear of the floating controls and the buy bar, says one line per home section,
 * and sits still under reduced motion. Decorative: hidden from assistive technology.
 */
export function PixelFamiliar() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { stickyBarVisible } = useShopUI();
  const sticky = useRef(stickyBarVisible);
  const [bubble, setBubble] = useState("");
  const bubbleTimer = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    sticky.current = stickyBarVisible;
  }, [stickyBarVisible]);

  const say = useCallback((text: string, ms = 2400) => {
    setBubble(text);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(""), ms);
  }, []);

  // One line per section, once per page view.
  useEffect(() => {
    const said = new Set<string>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const line = (en.target as HTMLElement).dataset.catLine;
          if (line && !said.has(line)) {
            said.add(line);
            say(line, 2600);
          }
          io.unobserve(en.target);
        }),
      { threshold: 0.2 },
    );
    const t = window.setTimeout(() => document.querySelectorAll("[data-cat-line]").forEach((el) => io.observe(el)), 300);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [pathname, say]);

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const colour = {
      b: css.getPropertyValue("--wm-primary").trim() || "#23395b",
      e: css.getPropertyValue("--brand-ivory").trim() || "#faf6ee",
      p: css.getPropertyValue("--brand-blush").trim() || "#e9c2b8",
    };

    let last: FrameName | null = null;
    const draw = (frame: FrameName) => {
      if (last === frame) return;
      last = frame;
      ctx.clearRect(0, 0, 16, 12);
      FRAMES[frame].forEach((row, y) => {
        for (let x = 0; x < 16; x++) {
          const c = row[x] as "." | "b" | "e" | "p";
          if (c === ".") continue;
          ctx.fillStyle = colour[c];
          ctx.fillRect(x, y, 1, 1);
        }
      });
    };

    const H = () => window.innerHeight;
    const cat = { x: 40, y: H() - 60, tx: 40, dir: 1, t: 0, run: false, lastScroll: 0, lastWander: performance.now(), blinkAt: 0, blinkUntil: 0 };
    let lastY = window.scrollY;

    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      cat.tx = Math.max(16, Math.min(window.innerWidth - 80, cat.tx + dy * 0.9));
      cat.lastScroll = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const offEvents = onFamiliar((ev) => {
      if (ev.type === "added") {
        cat.run = true;
        cat.tx = window.innerWidth - (window.innerWidth > 700 ? 560 : 120);
        cat.lastScroll = performance.now();
        say("Into the cart it goes.", 2200);
      } else {
        say(ev.text, ev.ms);
      }
    });

    const stop = onFrame(({ now }) => {
      const W = window.innerWidth;
      const floor = H() - 54 - (sticky.current ? 76 : 0);
      if (!motionAllowed()) {
        cat.y = floor;
        draw("sit");
        el.style.transform = `translate(${cat.x.toFixed(1)}px,${floor.toFixed(1)}px)`;
        return;
      }
      if (!cat.run && now - cat.lastScroll > 7000 && now - cat.lastWander > 7000) {
        cat.tx = 40 + Math.random() * (W - 160);
        cat.lastWander = now;
      }
      let tx = cat.tx;
      // Stay right of the hero buttons while they are on screen.
      const copy = document.querySelector("[data-hero-copy]");
      if (copy) {
        const r = copy.getBoundingClientRect();
        if (r.bottom > H() - 70 && r.top < H() && tx < r.right + 16) tx = cat.tx = r.right + 16;
      }
      // Keep clear of the floating MENU / TOP controls.
      if (window.scrollY > 160) tx = W < 768 ? Math.max(8, Math.min(W - 210, tx)) : Math.max(84, Math.min(W - 150, tx));
      tx = Math.max(8, Math.min(W - 72, tx));
      const dx = tx - cat.x;
      const dy = floor - cat.y;
      const moving = Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5;
      if (moving) {
        cat.x += Math.sign(dx) * Math.min(Math.abs(dx), cat.run ? 7 : 2.6);
        cat.y += dy * 0.12;
        if (Math.abs(dx) > 1.5) cat.dir = Math.sign(dx);
        cat.t += 1;
        draw(Math.floor(cat.t / (cat.run ? 4 : 8)) % 2 ? "walkA" : "walkB");
      } else {
        cat.run = false;
        if (now > cat.blinkAt) {
          cat.blinkAt = now + 2600 + Math.random() * 2000;
          cat.blinkUntil = now + 140;
        }
        draw(now < cat.blinkUntil ? "blink" : "sit");
      }
      const hop = moving && Math.abs(dx) > 1.5 ? -Math.abs(Math.sin(((cat.t / (cat.run ? 4 : 8)) * Math.PI))) * (cat.run ? 5 : 2) : 0;
      el.style.transform = `translate(${cat.x.toFixed(1)}px,${(cat.y + hop).toFixed(1)}px)`;
      cv.style.transform = `scaleX(${cat.dir < 0 ? -1 : 1})`;
    });

    return () => {
      stop();
      offEvents();
      window.removeEventListener("scroll", onScroll);
    };
  }, [say]);

  return (
    <div ref={box} className={styles.cat} aria-hidden="true">
      {bubble ? <div className={styles.bubble}>{bubble}</div> : null}
      <canvas ref={canvas} width={16} height={12} className={styles.canvas} onClick={() => say(CLICK_LINES[Math.floor(Math.random() * CLICK_LINES.length)]!)} />
    </div>
  );
}
