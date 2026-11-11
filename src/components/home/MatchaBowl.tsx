"use client";

import { useEffect, useRef } from "react";
import { loopsAllowed, motionAllowed, onFrame, tokenRGB, type RGB } from "@/components/motion/runtime";
import styles from "./MatchaBowl.module.css";

/** Fired each frame with where the cat should look: the whisk while it works, otherwise the bowl. */
export const WHISK_EVENT = "wm:whisk";
/** Fired as the cat's paw touches the foam. */
export const PAW_EVENT = "wm:paw";
/** Fired when the bowl moves to another step of the usucha recipe: 0 sift, 1 pour, 2 whisk, 3 made. */
export const RITUAL_EVENT = "wm:ritual";
export type RitualStep = 0 | 1 | 2 | 3;

type Bubble = { x: number; y: number; vx: number; vy: number; s: number; life: number; max: number };
type Grain = { x: number; y: number; vy: number };

const rgba = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);

/**
 * The hero's live bowl of matcha, seen from above. On arrival it is made in front of you: powder sifts in,
 * water pours, a chasen whisks it to foam (about 3.5 s). After that, pointer or finger movement over the bowl
 * whisks it (horizontal drags only on touch, so vertical swipes still scroll). Now and then the Academy cat's
 * paw dabs the foam and leaves a print that dissolves. Decorative: hidden from assistive technology.
 *
 * Runs on the shared frame loop only while on screen; freezes under the pause control; reduced motion gets a
 * still, finished bowl.
 */
export function MatchaBowl() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const canvas: HTMLCanvasElement = el;

    const C = {
      cream: tokenRGB("--brand-cream", [250, 246, 238]),
      ink: tokenRGB("--brand-charcoal", [56, 56, 50]),
      hair: tokenRGB("--line-hairline", [221, 214, 198]),
      powder: tokenRGB("--tea-matcha", [100, 134, 18]),
      dark: tokenRGB("--matcha-dark", [118, 147, 46]),
      mid: tokenRGB("--matcha-mid", [148, 170, 88]),
      light: tokenRGB("--matcha-light", [175, 190, 128]),
      bubble: tokenRGB("--matcha-bubble", [208, 214, 179]),
      bubbleLine: tokenRGB("--matcha-bubble-line", [145, 168, 84]),
    };

    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;
    let dirty = true;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W * 0.42, H * 0.32);
      cx = W / 2;
      cy = H * 0.6;
      dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
    });
    io.observe(canvas);

    const still = !motionAllowed();
    // The ritual starts the first time the bowl is seen, not when the page mounts.
    let born: number | null = null;
    let last = performance.now();
    let foam = still ? 1 : 0;
    let fill = still ? 1 : 0;
    let mound = 0;
    let swirl = 0;
    const bubbles: Bubble[] = [];
    const grains: Grain[] = [];
    const prints: Array<{ x: number; y: number; age: number }> = [];
    const REST = { x: 0.78, y: -0.62 };
    const whisk = { x: REST.x, y: REST.y, px: REST.x, py: REST.y, on: 0, speed: 0 };
    let pointer: { x: number; y: number; at: number } | null = null;
    let paw: { t: number; x: number; y: number; stamped: boolean } | null = null;
    let nextPaw = 8;
    let step: RitualStep | -1 = -1;
    const announce = (next: RitualStep) => {
      if (next === step) return;
      step = next;
      window.dispatchEvent(new CustomEvent(RITUAL_EVENT, { detail: next }));
    };

    function spawn(x: number, y: number, settled = false) {
      if (bubbles.length > 260 || x * x + y * y > 0.9) return;
      const max = settled ? Infinity : 3 + Math.random() * 6;
      bubbles.push({ x, y, vx: 0, vy: 0, s: 0.008 + Math.random() * Math.random() * 0.05, life: settled ? 1 : 0, max });
    }

    // A finished bowl for reduced motion.
    if (still) for (let i = 0; i < 160; i++) spawn(Math.random() * 1.6 - 0.8, Math.random() * 1.6 - 0.8, true);

    // Pointer in bowl units: (0, 0) is the centre, 1 is the liquid's edge.
    const toBowl = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const lr = R * 0.86;
      return { x: (e.clientX - r.left - cx) / lr, y: (e.clientY - r.top - cy) / lr };
    };
    const onMove = (e: PointerEvent) => {
      if (still) return;
      const p = toBowl(e);
      if (p.x * p.x + p.y * p.y < 1.8) pointer = { ...p, at: performance.now() };
    };
    const onDown = (e: PointerEvent) => {
      if (still) return;
      const p = toBowl(e);
      if (p.x * p.x + p.y * p.y > 1.2) return;
      pointer = { ...p, at: performance.now() };
      // A tap stirs a ring of foam outwards.
      for (const b of bubbles) {
        const dx = b.x - p.x;
        const dy = b.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 0.5) {
          b.vx += (dx / d) * 0.9 * (0.5 - d);
          b.vy += (dy / d) * 0.9 * (0.5 - d);
        }
      }
      for (let i = 0; i < 10; i++) spawn(p.x + (Math.random() - 0.5) * 0.2, p.y + (Math.random() - 0.5) * 0.2);
    };
    const onLeave = () => {
      pointer = null;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    function update(dt: number, t: number) {
      // 0–1.0 s: powder sifts in. 1.0–1.7 s: water. 1.6–3.6 s: whisked to foam.
      if (t < 1.0) {
        for (let i = 0; i < 3; i++) grains.push({ x: (Math.random() - 0.5) * 0.36, y: -2.4 - Math.random() * 0.4, vy: 2.2 + Math.random() });
      }
      for (let i = grains.length - 1; i >= 0; i--) {
        const g = grains[i]!;
        g.y += g.vy * dt;
        g.vy += 3 * dt;
        if (g.y > 0) {
          grains.splice(i, 1);
          mound = Math.min(1, mound + 0.012);
        }
      }
      fill = ease((t - 1.0) / 0.7);

      const recent = pointer !== null && performance.now() - pointer.at < 1400;
      let tx = REST.x;
      let ty = REST.y;
      let on = 0.35;
      if (t > 1.6 && t < 3.6) {
        // The "M" motion: quick side to side, slowly travelling across the bowl.
        tx = Math.sin(t * 9) * 0.5;
        ty = Math.sin(t * 1.4) * 0.35;
        on = 1;
      } else if (recent && pointer && t >= 1.6) {
        const d = Math.hypot(pointer.x, pointer.y);
        const k = d > 0.82 ? 0.82 / d : 1;
        tx = pointer.x * k;
        ty = pointer.y * k;
        on = 1;
      }
      whisk.px = whisk.x;
      whisk.py = whisk.y;
      const follow = 1 - Math.pow(0.0005, dt);
      whisk.x += (tx - whisk.x) * follow;
      whisk.y += (ty - whisk.y) * follow;
      whisk.on += (on - whisk.on) * (1 - Math.pow(0.02, dt));
      const wvx = (whisk.x - whisk.px) / Math.max(dt, 1e-3);
      const wvy = (whisk.y - whisk.py) / Math.max(dt, 1e-3);
      whisk.speed = Math.hypot(wvx, wvy);

      const whisking = whisk.on > 0.6 && fill > 0.95 && Math.hypot(whisk.x, whisk.y) < 0.9;
      announce(t < 1.0 ? 0 : t < 1.6 ? 1 : t < 3.6 || (recent && whisking) ? 2 : 3);
      if (whisking) {
        foam = Math.min(1, foam + dt * (0.12 + whisk.speed * 0.08));
        const n = Math.min(6, whisk.speed * 1.4);
        for (let i = 0; i < n; i++) spawn(whisk.x + (Math.random() - 0.5) * 0.3, whisk.y + (Math.random() - 0.5) * 0.3);
      } else if (foam > 0.82) {
        foam = Math.max(0.82, foam - dt * 0.01);
      }
      swirl += dt * (0.25 + (whisking ? whisk.speed * 0.15 : 0));

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]!;
        const r = Math.hypot(b.x, b.y) || 1;
        // Slow swirl, plus a push from the whisk where it passes.
        b.vx += (-b.y / r) * 0.06 * dt;
        b.vy += (b.x / r) * 0.06 * dt;
        if (whisking) {
          const d = Math.hypot(b.x - whisk.x, b.y - whisk.y);
          if (d < 0.28) {
            b.vx += wvx * 0.35 * dt * (1 - d / 0.28);
            b.vy += wvy * 0.35 * dt * (1 - d / 0.28);
          }
        }
        b.vx *= Math.pow(0.2, dt);
        b.vy *= Math.pow(0.2, dt);
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const rr = Math.hypot(b.x, b.y);
        if (rr > 0.94) {
          b.x *= 0.94 / rr;
          b.y *= 0.94 / rr;
        }
        b.life += dt;
        if (b.life > b.max) bubbles.splice(i, 1);
      }
      // Keep a settled crema once the bowl is made.
      if (foam > 0.6 && bubbles.length < 120 * foam) spawn(Math.random() * 1.7 - 0.85, Math.random() * 1.7 - 0.85, true);

      // The paw: only while nobody is whisking, every 9–13 s.
      if (!paw && !recent && t > nextPaw && foam > 0.7) {
        paw = { t: 0, x: (Math.random() - 0.5) * 0.7, y: (Math.random() - 0.5) * 0.5, stamped: false };
        nextPaw = t + 9 + Math.random() * 4;
      }
      if (paw) {
        paw.t += dt;
        if (!paw.stamped && paw.t > 0.75) {
          paw.stamped = true;
          prints.push({ x: paw.x, y: paw.y, age: 0 });
          for (const b of bubbles) {
            const dx = b.x - paw.x;
            const dy = b.y - paw.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < 0.32) {
              b.vx += (dx / d) * 0.5;
              b.vy += (dy / d) * 0.5;
            }
          }
          window.dispatchEvent(new CustomEvent(PAW_EVENT));
        }
        if (paw.t > 1.7) paw = null;
      }
      for (let i = prints.length - 1; i >= 0; i--) {
        prints[i]!.age += dt;
        if (prints[i]!.age > 5) prints.splice(i, 1);
      }

      // The cat follows the whisk while it works, and otherwise keeps its eyes on the bowl.
      const r = canvas.getBoundingClientRect();
      const lr = R * 0.86;
      const busy = whisk.on > 0.5 && fill > 0.9;
      const detail = busy ? { x: r.left + cx + whisk.x * lr, y: r.top + cy + whisk.y * lr } : { x: r.left + cx, y: r.top + cy };
      window.dispatchEvent(new CustomEvent(WHISK_EVENT, { detail }));
    }

    function drawPrint(c: CanvasRenderingContext2D, x: number, y: number, s: number, colour: string) {
      c.fillStyle = colour;
      c.beginPath();
      c.ellipse(x, y + s * 0.25, s * 0.42, s * 0.34, 0, 0, Math.PI * 2);
      c.fill();
      for (const [dx, dy] of [[-0.42, -0.22], [-0.15, -0.46], [0.15, -0.46], [0.42, -0.22]] as const) {
        c.beginPath();
        c.ellipse(x + dx * s, y + dy * s, s * 0.14, s * 0.18, 0, 0, Math.PI * 2);
        c.fill();
      }
    }

    function draw(c: CanvasRenderingContext2D, t: number) {
      c.clearRect(0, 0, W, H);
      const lr = R * 0.86;

      // Shadow and the cream bowl, in the site's line-drawing style.
      c.fillStyle = rgba(C.ink, 0.07);
      c.beginPath();
      c.ellipse(cx + R * 0.06, cy + R * 0.1, R * 1.02, R * 1.02, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = rgba(C.cream);
      c.strokeStyle = rgba(C.ink);
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(cx, cy, R, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = rgba(mix(C.cream, C.hair, 0.6));
      c.beginPath();
      c.arc(cx, cy, lr, 0, Math.PI * 2);
      c.fill();

      // Powder mound, then the water spreading from the middle.
      if (mound > 0 && fill < 1) {
        c.fillStyle = rgba(C.powder, 0.9);
        c.beginPath();
        c.arc(cx, cy, lr * 0.32 * mound, 0, Math.PI * 2);
        c.fill();
      }
      if (fill > 0) {
        const g = c.createRadialGradient(cx - lr * 0.2, cy - lr * 0.25, lr * 0.05, cx, cy, lr * fill);
        g.addColorStop(0, rgba(mix(C.dark, C.bubble, foam * 0.75)));
        g.addColorStop(0.6, rgba(mix(C.dark, C.light, foam * 0.8)));
        g.addColorStop(1, rgba(mix(C.powder, C.mid, foam * 0.6)));
        c.fillStyle = g;
        c.beginPath();
        c.arc(cx, cy, lr * fill, 0, Math.PI * 2);
        c.fill();
      }

      c.save();
      c.beginPath();
      c.arc(cx, cy, lr, 0, Math.PI * 2);
      c.clip();

      // Swirl lines in the crema.
      if (foam > 0.1) {
        c.strokeStyle = rgba(C.bubble, 0.5 * foam);
        c.lineWidth = Math.max(1, R * 0.012);
        for (let i = 0; i < 3; i++) {
          const rr = lr * (0.25 + i * 0.22);
          const a = swirl * (i % 2 ? -1 : 1) + i;
          c.beginPath();
          c.arc(cx, cy, rr, a, a + 1.6);
          c.stroke();
        }
      }

      // Paw prints dissolving into the foam.
      for (const p of prints) {
        drawPrint(c, cx + p.x * lr, cy + p.y * lr, lr * 0.3, rgba(C.cream, Math.max(0, 1 - p.age / 5) * 0.6));
      }

      for (const b of bubbles) {
        // Grows in over 0.25 s and, for whisked bubbles, pops over its last 0.6 s.
        const grow = Math.min(1, b.life * 4) * (b.max === Infinity ? 1 : Math.min(1, Math.max(0, (b.max - b.life) / 0.6)));
        const s = b.s * lr * grow;
        if (s < 0.4) continue;
        c.beginPath();
        c.arc(cx + b.x * lr, cy + b.y * lr, s, 0, Math.PI * 2);
        c.fillStyle = rgba(C.bubble, 0.85);
        c.fill();
        c.lineWidth = 0.6;
        c.strokeStyle = rgba(C.bubbleLine, 0.6);
        c.stroke();
      }
      c.restore();

      // Falling powder.
      c.fillStyle = rgba(C.powder);
      for (const g of grains) {
        c.beginPath();
        c.arc(cx + g.x * lr, cy + g.y * lr, Math.max(1, R * 0.012), 0, Math.PI * 2);
        c.fill();
      }

      // Steam once there is foam.
      if (foam > 0.4 && !still) {
        c.strokeStyle = rgba(C.ink, 0.12 * foam);
        c.lineWidth = 1.2;
        // Two wisps off to the sides, clear of the cat above the middle.
        for (let i = 0; i < 2; i++) {
          const x = cx + (i ? 0.62 : -0.62) * R;
          const phase = (t * 0.35 + i * 0.5) % 1;
          const y0 = cy - R * 0.98 - phase * R * 0.32;
          c.globalAlpha = Math.sin(phase * Math.PI);
          c.beginPath();
          c.moveTo(x, y0);
          c.bezierCurveTo(x - R * 0.08, y0 - R * 0.08, x + R * 0.08, y0 - R * 0.16, x, y0 - R * 0.24);
          c.stroke();
        }
        c.globalAlpha = 1;
      }

      // The chasen, seen from above: a ring of tines around the handle.
      if (fill > 0.9) {
        const wx = cx + whisk.x * lr;
        const wy = cy + whisk.y * lr;
        const s = R * (0.15 + 0.03 * whisk.on);
        c.strokeStyle = rgba(C.ink, 0.75);
        c.lineWidth = 1;
        for (let i = 0; i < 22; i++) {
          const a = (i / 22) * Math.PI * 2 + swirl * 2;
          c.beginPath();
          c.moveTo(wx + Math.cos(a) * s * 0.35, wy + Math.sin(a) * s * 0.35);
          c.lineTo(wx + Math.cos(a) * s, wy + Math.sin(a) * s);
          c.stroke();
        }
        c.beginPath();
        c.arc(wx, wy, s, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = rgba(C.cream);
        c.beginPath();
        c.arc(wx, wy, s * 0.36, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = 1.5;
        c.stroke();
      }

      // The paw reaches down from over the arch, presses, and lifts away.
      if (paw) {
        const k = paw.t < 0.75 ? ease(paw.t / 0.75) : paw.t < 1.0 ? 1 : 1 - ease((paw.t - 1.0) / 0.7);
        const px = cx + paw.x * lr;
        const py = -R * 0.4 + (cy + paw.y * lr + R * 0.4) * k;
        const pw = R * 0.26;
        c.fillStyle = rgba(C.cream);
        c.strokeStyle = rgba(C.ink);
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(px - pw * 0.45, -10);
        c.lineTo(px - pw * 0.45, py);
        c.arc(px, py, pw * 0.45, Math.PI, 0, true);
        c.lineTo(px + pw * 0.45, -10);
        c.fill();
        c.stroke();
        for (const dx of [-0.24, 0, 0.24]) {
          c.beginPath();
          c.moveTo(px + dx * pw, py + pw * 0.28);
          c.lineTo(px + dx * pw, py + pw * 0.4);
          c.stroke();
        }
      }
    }

    const stop = onFrame(({ now }) => {
      if (!visible) {
        last = now;
        return;
      }
      const live = !still && loopsAllowed();
      if (!live && !dirty) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      born ??= now;
      const t = (now - born) / 1000;
      if (live) update(dt, t);
      else announce(3);
      draw(ctx, t);
      dirty = false;
    });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
