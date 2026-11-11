"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BRAND_LINE, DRINK_WAYS, HERO, SELECTION_ID } from "@/lib/content/home";
import { TEAS_HREF } from "@/lib/config/site";
import { clamp01, easeInOut, hoverCapable, loopsAllowed, motionAllowed, onFrame, sectionProgress } from "@/components/motion/runtime";
import { CatPeek } from "./CatPeek";
import { MatchaBowl } from "./MatchaBowl";
import styles from "./Hero.module.css";

/** Seeded foam bubbles (the same 54 as the prototype, so server and client markup match). */
const BUBBLES = (() => {
  const out: Array<{ l: string; t: string; size: number }> = [];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 54; i++) {
    const r = Math.sqrt(rnd()) * 44;
    const a = rnd() * Math.PI * 2;
    const size = 4 + Math.round(rnd() * rnd() * 16);
    out.push({ l: `${(50 + Math.cos(a) * r).toFixed(1)}%`, t: `${(50 + Math.sin(a) * r).toFixed(1)}%`, size });
  }
  return out;
})();

/** The chasen from above, as drawn in the live bowl: a ring of tines around the handle. */
function ChasenTop() {
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.6" fill="none">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          // Rounded, so server and browser render identical attributes.
          const at = (r: number, f: (x: number) => number) => Number((f(a) * r).toFixed(2));
          return <line key={i} x1={at(16, Math.cos)} y1={at(16, Math.sin)} x2={at(46, Math.cos)} y2={at(46, Math.sin)} />;
        })}
        <circle r="46" />
        <circle r="16" fill="var(--brand-cream)" strokeWidth="2.4" />
      </g>
    </svg>
  );
}

function Buttons({ pair = false }: { pair?: boolean }) {
  return (
    <div className={pair ? styles.buttonsPair : styles.buttons}>
      <Link href={TEAS_HREF} className={`${styles.primary} on-primary`}>
        {HERO.primary}
      </Link>
      <a href={`#${SELECTION_ID}`} className={styles.secondary}>
        {HERO.secondary}
      </a>
    </div>
  );
}

/**
 * The arch holds a live bowl of matcha that is made on arrival and whisks under the pointer or finger, with
 * the Academy cat peeking over the top (a line-drawn gesture, not character art). Desktop: the arch grows to
 * fill the screen as you scroll, dives into the foam and gives way to the next heading on cream; the headline
 * halves and badge drift with the pointer. Phones: a short stack with both actions in the first screen.
 * Reduced motion: no scrub, a still finished bowl. Words: copy v5.3 §1.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = section.current;
    if (!hero) return;
    const q = <T extends HTMLElement>(sel: string) => hero.querySelector<T>(sel);
    const all = (sel: string) => hero.querySelectorAll<HTMLElement>(sel);
    const stage = q("[data-stage]");
    const arch = q("[data-arch]");
    const ring = q("[data-ring]");
    const l1 = q("[data-l1]");
    const l2 = q("[data-l2]");
    const foam = q("[data-foam]");
    const bowl = q("[data-bowl]");
    const whisk = q("[data-whisk]");
    const cap = q("[data-cap]");
    const wash = q("[data-wash]");
    const inside = q("[data-inside]");
    const badge = q("[data-spin]");
    const badgeWrap = q("[data-badge]");
    const bar = q("[data-bar]");
    const live = q("[data-live]");
    const fades = all("[data-fade]");
    const bubbles = all("[data-bub]");
    const swirls = all("[data-swirl]");

    // Depth on desktop: the headline halves and the badge drift a little against the pointer.
    const aim = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    const onPointer = (ev: PointerEvent) => {
      aim.x = (ev.clientX / window.innerWidth) * 2 - 1;
      aim.y = (ev.clientY / window.innerHeight) * 2 - 1;
    };
    if (hoverCapable()) window.addEventListener("pointermove", onPointer, { passive: true });

    const stop = onFrame(({ now, y }) => {
      if (getComputedStyle(hero).display === "none") return;
      const H = window.innerHeight;
      const W = window.innerWidth;
      const header = document.querySelector("header");
      if (stage) stage.style.height = `${Math.max(420, H - (header ? Math.max(0, header.getBoundingClientRect().bottom) : 0))}px`;
      const motion = motionAllowed();
      const p = motion ? sectionProgress(hero) : 0;
      const e = easeInOut(p);
      if (arch) {
        const cover = Math.max(W / arch.offsetWidth, H / arch.offsetHeight) * 1.25;
        arch.style.transform = `translateY(${e * 6}vh) scale(${(1 + e * (cover - 1)).toFixed(3)})`;
      }
      if (ring) ring.style.opacity = String(Math.max(0, 1 - p * 3));
      fades.forEach((el) => (el.style.opacity = String(Math.max(0, 1 - p * 3.2))));
      const still = !motion || !loopsAllowed();
      drift.x += ((still ? 0 : aim.x) - drift.x) * 0.06;
      drift.y += ((still ? 0 : aim.y) - drift.y) * 0.06;
      if (l1) l1.style.transform = `translateX(${-e * 60}vw) translate(${(-drift.x * 14).toFixed(1)}px, ${(-drift.y * 8).toFixed(1)}px)`;
      if (l2) l2.style.transform = `translateX(${e * 60}vw) translate(${(drift.x * 14).toFixed(1)}px, ${(drift.y * 8).toFixed(1)}px)`;
      if (badgeWrap) badgeWrap.style.transform = `translate(${(drift.x * 22).toFixed(1)}px, ${(drift.y * 16).toFixed(1)}px)`;
      if (bar) bar.style.transform = `translateY(${e * 70}vh)`;
      if (badge && loopsAllowed()) badge.style.transform = `rotate(${((now * 0.012 + y * 0.2) % 360).toFixed(1)}deg)`;

      if (foam) {
        // A quick cut from the live bowl to the full-screen foam, where the two bowls are about the same size.
        foam.style.opacity = String(clamp01((p - 0.4) / 0.05));
        const g = clamp01((p - 0.42) / 0.24);
        const c = easeInOut(clamp01((p - 0.6) / 0.16));
        if (bowl && stage) {
          // Start exactly over the live bowl (same size and centre), then glide to the middle as it is whisked.
          let base = 1;
          let dx = 0;
          let dy = 0;
          if (live && live.offsetWidth) {
            const r = live.getBoundingClientRect();
            const sr = stage.getBoundingClientRect();
            base = Math.min(1, (2 * Math.min(r.width * 0.42, r.height * 0.32)) / Math.max(1, bowl.offsetWidth));
            const k = 1 - easeInOut(g);
            dx = (r.left + r.width / 2 - (sr.left + sr.width / 2)) * k;
            dy = (r.top + r.height * 0.6 - (sr.top + sr.height / 2)) * k;
          }
          const cs = (Math.hypot(W, H) / Math.max(1, bowl.offsetWidth)) * 1.08;
          bowl.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${(base * (1 + c * (cs - 1))).toFixed(3)}) rotate(${(p * 40).toFixed(1)}deg)`;
        }
        const n = bubbles.length || 1;
        bubbles.forEach((b, k) => {
          b.style.transform = `scale(${clamp01(g * 1.7 - (k / n) * 0.8).toFixed(3)})`;
          b.style.opacity = String(1 - c * 0.7);
        });
        swirls.forEach((sw, k) => {
          sw.style.transform = `rotate(${(p * (k % 2 ? -540 : 720)).toFixed(1)}deg)`;
          sw.style.opacity = String(clamp01(g * 2) * (1 - c));
        });
        if (whisk) {
          const zx = Math.sin(p * 62) * 70;
          const zy = Math.sin(p * 31) * 22;
          whisk.style.transform = `translate(-50%,-50%) translate(${zx.toFixed(1)}%,${zy.toFixed(1)}%) rotate(${(Math.cos(p * 62) * 16).toFixed(1)}deg)`;
          whisk.style.opacity = String(clamp01(g * 3) * clamp01(1 - c * 2));
        }
        if (cap) cap.style.opacity = String(clamp01(g * 3) * clamp01(1 - c * 2));
        // Cream wash over the dark foam so the heading reads on cream (V4 last round).
        if (wash) wash.style.opacity = String(clamp01((p - 0.68) / 0.12));
      }
      if (inside) {
        const o = clamp01((p - 0.74) / 0.16);
        inside.style.opacity = String(o);
        inside.style.transform = `translateY(${(1 - o) * 40}px) scale(${0.96 + o * 0.04})`;
        inside.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
    });
    return () => {
      stop();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <>
      <section ref={section} className={styles.desktop} aria-label="Welcome">
        <div className={styles.stage} data-stage="">
          <div className={styles.bar} data-bar="" aria-hidden="true" />

          <div className={styles.arch} data-arch="">
            <div className={styles.ring} data-ring="" data-reveal="arch-open" data-delay="200" aria-hidden="true">
              <svg viewBox="0 0 100 133" preserveAspectRatio="none">
                <path d="M0 133 V50 A50 50 0 0 1 100 50 V133" fill="none" stroke="var(--line-on-mint)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <span className={styles.catWrap} data-fade="">
              <CatPeek />
            </span>
            <div className={styles.window} data-reveal="arch-open" aria-hidden="true">
              {/* Stays solid through the zoom, so the scroll dives straight into the foam. */}
              <div className={styles.live} data-live="">
                <MatchaBowl />
              </div>
            </div>
          </div>

          <div className={styles.badge} data-fade="" data-badge="" aria-hidden="true">
            <svg viewBox="0 0 130 130" data-spin="">
              <defs>
                <path id="wm-badge-circle" d="M65 65 m-52 0 a52 52 0 1 1 104 0 a52 52 0 1 1 -104 0" />
              </defs>
              <circle cx="65" cy="65" r="64" fill="var(--action-primary)" />
              <text className={styles.badgeText}>
                <textPath href="#wm-badge-circle" textLength="326" lengthAdjust="spacing">
                  MATCHA, WITH TASTE · WHICH MATCHA TODAY ·{" "}
                </textPath>
              </text>
            </svg>
          </div>

          <div className={styles.l1} data-l1="">
            <div className={styles.mask}>
              <h1 className={styles.headline} data-reveal="mask">
                Matcha, <span className="visually-hidden">With Taste.</span>
              </h1>
            </div>
          </div>
          <div className={styles.l2} data-l2="" aria-hidden="true">
            <div className={styles.mask}>
              <span className={styles.inEvery} data-reveal="mask" data-delay="160">
                With
              </span>
            </div>
            <div className={styles.mask}>
              <span className={styles.headline} data-reveal="mask" data-delay="300">
                Taste.
              </span>
            </div>
          </div>
          <div className={styles.copy} data-fade="" data-hero-copy="">
            <span className="label" data-reveal="left" data-delay="420">
              {HERO.eyebrow}
            </span>
            <p data-reveal="left" data-delay="500">
              {HERO.supporting}
            </p>
            <div data-reveal="left" data-delay="650">
              <Buttons />
            </div>
          </div>
          <div className={styles.scrollHint} data-fade="" aria-hidden="true">
            <span />
          </div>

          <div className={styles.foam} data-foam="" aria-hidden="true">
            <div className={styles.bowl} data-bowl="">
              <div className={styles.swirl} data-swirl="" style={{ inset: "10%", borderColor: "var(--matcha-swirl-1)" }} />
              <div className={styles.swirl} data-swirl="" style={{ inset: "24%", borderColor: "var(--matcha-swirl-2)" }} />
              <div className={styles.swirl} data-swirl="" style={{ inset: "38%", borderColor: "var(--matcha-swirl-3)" }} />
              {BUBBLES.map((b, i) => (
                <span key={i} data-bub="" className={styles.bubble} style={{ left: b.l, top: b.t, width: b.size, height: b.size, margin: `${-b.size / 2}px 0 0 ${-b.size / 2}px` }} />
              ))}
              <span data-whisk="" className={styles.whisk}>
                <ChasenTop />
              </span>
            </div>
            <span className={styles.caption} data-cap="">
              {DRINK_WAYS.straight.needs}
            </span>
            <div className={styles.wash} data-wash="" />
          </div>

          <div className={styles.inside} data-inside="">
            <span className="label">{HERO.eyebrow}</span>
            <span className={styles.insideTitle}>{BRAND_LINE}</span>
            <span>{HERO.supporting.split(". ")[0]}.</span>
          </div>
        </div>
      </section>

      <section className={styles.mobile} aria-label="Welcome">
        <div className={styles.mask}>
          <h1 className={styles.mHeadline} data-reveal="mask">
            Matcha, <span className="visually-hidden">With Taste.</span>
          </h1>
        </div>
        <div className={styles.mArch}>
          <div className={styles.mRing} data-reveal="arch-open" data-delay="200" aria-hidden="true" />
          <span className={styles.catWrap}>
            <CatPeek />
          </span>
          <div className={styles.mWindow} data-reveal="arch-open" aria-hidden="true">
            <div className={styles.live}>
              <MatchaBowl />
            </div>
          </div>
        </div>
        <div className={styles.mLine2} aria-hidden="true">
          <span className={styles.mInEvery} data-reveal="right">
            With
          </span>
          <span className={styles.mHeadline} data-reveal="right" data-delay="120">
            Taste.
          </span>
        </div>
        {/* Shop first: on a phone the two actions sit right under the headline, inside the first screen. */}
        <div data-reveal="up">
          <Buttons pair />
        </div>
        <span className="label" data-reveal="up">
          {HERO.eyebrow}
        </span>
        <p data-reveal="up">{HERO.supporting}</p>
      </section>
    </>
  );
}
