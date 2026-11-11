/**
 * Motion helpers shared by the client islands. Every effect checks `motionAllowed()` so
 * `prefers-reduced-motion` turns all of it off, and nothing is ever required to reach content:
 * elements are only hidden for a reveal once JavaScript has confirmed they are off-screen.
 */

export const EASE = "cubic-bezier(.2,.7,.2,1)";

export function motionAllowed(): boolean {
  return typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Loops that run on their own (marquees, the badge, ambient effects) also stop under the pause control (WCAG 2.2.2). */
export function loopsAllowed(): boolean {
  return motionAllowed() && !document.documentElement.hasAttribute("data-motion-paused");
}

export function hoverCapable(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** easeInOutCubic, as in the prototype's scroll scrub. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 0 → 1 progress of a tall sticky section through the viewport. */
export function sectionProgress(el: Element, offset = 0): number {
  const r = el.getBoundingClientRect();
  const H = window.innerHeight;
  return clamp01((offset - r.top) / Math.max(1, r.height - H + offset));
}

type Frame = (info: { now: number; y: number; velocity: number }) => void;
const subscribers = new Set<Frame>();
let raf = 0;
let lastY = 0;
let velocity = 0;

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  const y = window.scrollY;
  velocity = velocity * 0.85 + (y - lastY) * 0.15;
  lastY = y;
  for (const fn of subscribers) {
    try {
      fn({ now, y, velocity });
    } catch {
      // A failing effect must never stop the others.
    }
  }
}

/** One shared requestAnimationFrame loop for every scroll-linked effect on the page. */
export function onFrame(fn: Frame): () => void {
  subscribers.add(fn);
  if (!raf) {
    lastY = window.scrollY;
    raf = requestAnimationFrame(loop);
  }
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

const REVEALS: Record<string, Keyframe[]> = {
  // No blur, and a short travel: text is sharp and readable as it arrives (vendor list P2).
  up: [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }],
  left: [{ opacity: 0, transform: "translateX(-40px)" }, { opacity: 1, transform: "none" }],
  right: [{ opacity: 0, transform: "translateX(40px)" }, { opacity: 1, transform: "none" }],
  mask: [{ transform: "translateY(110%)" }, { transform: "none" }],
  "wipe-l": [{ clipPath: "inset(0 100% 0 0)", transform: "translateX(-60px)" }, { clipPath: "inset(0 0 0 0)", transform: "none" }],
  "arch-open": [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
  zoom: [{ opacity: 0, transform: "scale(1.12)" }, { opacity: 1, transform: "none" }],
  rise: [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
  fade: [{ opacity: 0 }, { opacity: 1 }],
  "line-l": [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
  "line-r": [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
  drop: [{ opacity: 0, transform: "translateY(-12px)" }, { opacity: 1, transform: "none" }],
};

function duration(kind: string): number {
  if (kind === "rise") return 1100;
  if (kind === "arch-open") return 1400;
  if (kind === "mask" || kind.startsWith("wipe")) return 1100;
  if (kind.startsWith("line")) return 900;
  return 820;
}

/**
 * Reveal state lives in Web Animations and a WeakSet, never in DOM attributes, so streamed server HTML that
 * has not hydrated yet is never mutated (no hydration mismatches).
 */
const seen = new WeakSet<Element>();
const holds = new WeakMap<Element, Animation>();

const ORIGIN: Record<string, string> = { rise: "bottom", "line-l": "left", "line-r": "right" };

export function markSeen(el: Element): boolean {
  if (seen.has(el)) return false;
  seen.add(el);
  return true;
}

/** Keeps an off-screen element invisible until it is revealed. */
export function holdHidden(el: HTMLElement) {
  holds.set(el, el.animate([{ opacity: 0 }], { duration: 1, fill: "forwards" }));
}

export function isHeld(el: Element): boolean {
  return holds.has(el);
}

export function release(el: Element) {
  holds.get(el)?.cancel();
  holds.delete(el);
}

export function playReveal(el: HTMLElement) {
  release(el);
  const kind = el.dataset.reveal ?? "fade";
  const delay = Number(el.dataset.delay ?? 0);
  const origin = ORIGIN[kind];
  const frames = (REVEALS[kind] ?? REVEALS.fade!).map((f) => (origin ? { ...f, transformOrigin: origin } : f));
  el.animate(frames, { duration: duration(kind), delay, easing: EASE, fill: "backwards" });
}

const loops = new Set<Animation>();
let pauseWatch: MutationObserver | null = null;

function track(a: Animation) {
  loops.add(a);
  if (!loopsAllowed()) a.pause();
  if (pauseWatch) return;
  pauseWatch = new MutationObserver(() => loops.forEach((l) => (loopsAllowed() ? l.play() : l.pause())));
  pauseWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion-paused"] });
}

/** Infinite ambient effects: the breathing arch outline and liquid waves. Floating dots and stars are retired. */
export function startAmbient(root: ParentNode) {
  root.querySelectorAll<HTMLElement>("[data-breathe]").forEach((el) => {
    if (!markSeen(el)) return;
    track(
      el.animate(
        [
          { outlineOffset: "10px", outlineColor: "color-mix(in srgb, var(--line-ornament) 35%, transparent)" },
          { outlineOffset: "18px", outlineColor: "var(--line-ornament)" },
        ],
        { duration: 2250, direction: "alternate", iterations: Infinity, easing: "ease-in-out" },
      ),
    );
  });
  root.querySelectorAll<HTMLElement>("[data-wave]").forEach((el) => {
    if (!markSeen(el)) return;
    track(el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-25%)" }], { duration: 3600, iterations: Infinity, easing: "linear" }));
  });
}
