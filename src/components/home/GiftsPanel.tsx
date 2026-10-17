"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { motionAllowed } from "@/components/motion/runtime";
import styles from "./GiftsPanel.module.css";

const SPARKLES: Array<[string, string, number]> = [
  ["50%", "-4px", 12], ["92%", "10%", 10], ["100%", "48%", 12], ["94%", "92%", 9], ["2%", "92%", 10], ["-6px", "48%", 12], ["6%", "10%", 9],
];

/**
 * Gift panel: the outer gold frame draws itself, SHOP GIFTS reveals from the left after 320 ms, and the art
 * tilts toward the pointer (up to 7° / 5°) with a soft sheen and brighter sparkles. Mouse and pen only.
 */
export function GiftsPanel({ cutoff }: { cutoff: string }) {
  const art = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLSpanElement>(null);
  const sparkles = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !motionAllowed()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform .12s";
    el.style.transform = `rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg)`;
    if (sheen.current) {
      sheen.current.style.opacity = "1";
      sheen.current.style.background = `radial-gradient(circle at ${((x + 0.5) * 100).toFixed(1)}% ${((y + 0.5) * 100).toFixed(1)}%, color-mix(in srgb, var(--brand-ivory) 75%, transparent), transparent 45%)`;
    }
  };
  const enter = (e: PointerEvent) => {
    if (e.pointerType === "touch" || !sparkles.current) return;
    sparkles.current.dataset.on = "";
  };
  const leave = () => {
    const el = art.current;
    if (el) {
      el.style.transition = "transform .5s cubic-bezier(.2,.7,.2,1)";
      el.style.transform = "none";
    }
    if (sheen.current) sheen.current.style.opacity = "0";
    if (sparkles.current) delete sparkles.current.dataset.on;
  };

  return (
    <section className={`container ${styles.wrap}`} data-cat-line="Ooh, is that for me?" aria-labelledby="wm-gifts-title">
      <div className={styles.panel}>
        <span data-reveal="line-l" aria-hidden="true" className={`${styles.edge} ${styles.top}`} />
        <span data-reveal="line-r" aria-hidden="true" className={`${styles.edge} ${styles.bottom}`} />
        <span data-reveal="rise" data-delay="700" aria-hidden="true" className={`${styles.edge} ${styles.left}`} />
        <span data-reveal="rise" data-delay="700" aria-hidden="true" className={`${styles.edge} ${styles.right}`} />
        <div className={styles.copy}>
          <span className="label" data-reveal="left">
            Gifts
          </span>
          <h2 id="wm-gifts-title" className="display-section" data-reveal="left" data-delay="80">
            A tin to give, <i className="serif-italic">a note in your words.</i>
          </h2>
          <p data-reveal="left" data-delay="160">
            Tick “This is a gift” in your cart. Up to 150 characters, and no prices on the packing slip.
          </p>
          <p className={`body-small ${styles.cutoff}`} data-reveal="left" data-delay="240">
            <Icon name="gift" size={22} />
            {cutoff}.
          </p>
          <Link href="/collections/gifts" className={`${styles.cta} on-primary`} data-reveal="left" data-delay="320">
            Shop gifts
          </Link>
        </div>
        <div className={styles.artWrap} data-reveal="right">
          <div ref={sparkles} className={styles.sparkles} aria-hidden="true">
            {SPARKLES.map(([l, t, s], i) => (
              <span key={i} data-twinkle="" className="twinkle" style={{ left: l, top: t, width: s, height: s }} />
            ))}
          </div>
          <div ref={art} className={styles.art} onPointerMove={move} onPointerEnter={enter} onPointerLeave={leave}>
            <Image
              src="/art/heroes-02-everyday-matcha-desktop.jpg"
              alt="The Professor and Charmer sit by matcha bowls, an iced latte and bamboo tools in morning window light."
              fill
              sizes="(max-width: 899px) 92vw, 45vw"
              className={styles.cover}
            />
            <span ref={sheen} className={styles.sheen} />
          </div>
        </div>
      </div>
    </section>
  );
}
