"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { NEWSLETTER_EMAIL_ID } from "@/components/layout/NewsletterForm";
import { merchandiseFor } from "@/lib/cart/optimistic";
import { formatMoney } from "@/lib/data/money";
import { defaultVariant, isMultiVariant, productEyebrow } from "@/lib/data/product";
import type { Product } from "@/lib/data/types";
import { AcademyShelf } from "./AcademyShelf";
import styles from "./Home.module.css";

const STEP_DEG = 20;

/** Angular distance → visual falloff (prototype: 30° to fully dimmed). */
export function wheelFalloff(degreesFromTop: number) {
  const k = Math.min(1, Math.abs(degreesFromTop) / 30);
  return { opacity: 1 - k * 0.65, blur: k * 2, scale: 1.06 - k * 0.18 };
}

/** Which card sits under the pointer for a given scroll progress (0–1). */
export function wheelIndex(progress: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.round(progress * (count - 1))));
}

/**
 * "The Academy shelf · spin to choose" (Prototype V2 default): cards ride a large ring that turns as
 * the section scrolls (420vh). Keyboard focus scrolls the wheel to that card. Under reduced motion
 * it becomes the horizontal shelf instead.
 */
export function AcademyWheel({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const section = useRef<HTMLElement>(null);
  const rot = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);
  const [reduced, setReduced] = useState(false);
  const count = products.length + 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    const t = window.setTimeout(sync, 0);
    mq.addEventListener("change", sync);
    return () => {
      window.clearTimeout(t);
      mq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = section.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-wheel-card]"));
    let frame = 0;
    let last = -1;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const H = window.innerHeight;
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - H)));
      const ang = -p * (count - 1) * STEP_DEG;
      if (rot.current) rot.current.style.transform = `rotate(${ang.toFixed(2)}deg)`;
      cards.forEach((c, i) => {
        const f = wheelFalloff(i * STEP_DEG + ang);
        c.style.opacity = f.opacity.toFixed(3);
        c.style.filter = `blur(${f.blur.toFixed(1)}px)`;
        c.style.setProperty("--card-scale", f.scale.toFixed(3));
      });
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(3)})`;
      const idx = wheelIndex(p, count);
      if (idx !== last) {
        last = idx;
        setCurrent(idx);
      }
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
    };
  }, [reduced, count]);

  if (reduced) return <AcademyShelf products={products} />;

  /** Bring card i under the pointer when it receives keyboard focus. */
  function focusCard(i: number) {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (i / Math.max(1, count - 1)) * travel, behavior: "auto" });
  }

  function focusNewsletter() {
    const input = document.getElementById(NEWSLETTER_EMAIL_ID);
    if (!input) return;
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => input.focus({ preventScroll: true }), 600);
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section ref={section} className={styles.wheel} aria-labelledby="wheel-title">
      <div className={styles.wheelStage}>
        <div className={styles.wheelHead}>
          <div>
            <span className="label">The Academy shelf · spin to choose</span>
            <h2 id="wheel-title" className={styles.sectionDisplay}>
              Take one down.
            </h2>
          </div>
          <div className={styles.wheelProgress}>
            <span className={styles.wheelCount} aria-live="polite" aria-atomic="true">
              <span className="visually-hidden">Showing </span>
              {pad(current + 1)} / {pad(count)}
            </span>
            <span className={styles.wheelTrack} aria-hidden="true">
              <span ref={bar} className={styles.wheelBar} />
            </span>
          </div>
        </div>
        <span className={styles.wheelPointer} aria-hidden="true" />
        <div ref={rot} className={styles.wheelRot}>
          <span className={styles.wheelRing} aria-hidden="true" />
          <span className={styles.wheelRingDashed} aria-hidden="true" />
          <ul className={styles.wheelList}>
            {products.map((p, i) => {
              const v = defaultVariant(p);
              const multi = isMultiVariant(p);
              return (
                <li key={p.id} data-wheel-card="" className={styles.wheelCard} style={{ "--deg": `${i * STEP_DEG}deg` } as CSSProperties} onFocus={() => focusCard(i)}>
                  <div className={styles.wheelInner}>
                    <Link href={`/products/${p.handle}`} className={styles.wheelArch} data-tint={i % 2 ? "brand" : "soft"} tabIndex={-1} aria-hidden="true">
                      <span className={styles.shelfThumb}>Product · 4:5</span>
                    </Link>
                    <div className={styles.shelfMeta}>
                      <span className="label">{productEyebrow(p)}</span>
                      <span className={styles.shelfNo} aria-hidden="true">
                        {pad(i + 1)}
                      </span>
                    </div>
                    <Link href={`/products/${p.handle}`} className={styles.shelfName}>
                      {p.title}
                    </Link>
                    <div className={styles.shelfBuy}>
                      <span className={styles.shelfPrice}>{v ? `${multi ? "From " : ""}${formatMoney(multi ? p.priceRange.min : v.price)}` : null}</span>
                      {v && p.availableForSale && !multi ? (
                        <Button size="sm" onClick={() => void addItem(merchandiseFor(p, v), 1)} aria-label={`Add ${p.title} to cart`}>
                          Add to cart
                        </Button>
                      ) : (
                        <Button href={`/products/${p.handle}`} size="sm">
                          {p.availableForSale ? "Choose size" : "Notify me"}
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            <li data-wheel-card="" className={styles.wheelCard} style={{ "--deg": `${products.length * STEP_DEG}deg` } as CSSProperties} onFocus={() => focusCard(products.length)}>
              <div className={styles.wheelInner}>
                <span className={[styles.wheelArch, styles.wheelGhost].join(" ")} aria-hidden="true" />
                <div className={styles.shelfMeta}>
                  <span className="label">In preparation</span>
                  <span className={styles.shelfNo} aria-hidden="true">
                    {pad(count)}
                  </span>
                </div>
                <span className={styles.shelfName}>Coming to the Academy</span>
                <div className={styles.shelfBuy}>
                  <span />
                  <Button size="sm" onClick={focusNewsletter}>
                    Get the letter
                  </Button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
