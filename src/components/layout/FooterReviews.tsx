"use client";

import { useEffect, useState } from "react";
import type { SocialReviews } from "@/lib/providers";
import { motionAllowed } from "@/components/motion/runtime";
import styles from "./FooterReviews.module.css";

const ROTATE_MS = 6500;

/** "What people say": rating chips and one quote that changes every 6.5 s (paused under reduced motion). */
export function FooterReviews({ reviews }: { reviews: SocialReviews }) {
  const quotes = reviews.reviews.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || quotes.length < 2 || !motionAllowed()) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % quotes.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [held, quotes.length]);

  const q = quotes[index];
  if (!q) return null;

  return (
    <div className={styles.strip} onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
      <div className={styles.summary}>
        <span className={styles.heading}>
          <span className="label">What people say</span>
          {reviews.sample ? <span className="sample-tag">SAMPLE DATA</span> : null}
        </span>
        <div className={styles.chips}>
          {reviews.google ? (
            <span className={styles.chip}>
              <b>Google</b>
              <span aria-hidden="true">★★★★★</span>
              <span>
                {reviews.google.rating.toFixed(1)} · {reviews.google.count}
                <span className="visually-hidden"> reviews</span>
              </span>
            </span>
          ) : null}
          {reviews.facebook ? (
            <span className={styles.chip}>
              <b>Facebook</b>
              <span>
                {reviews.facebook.recommendPercent}% recommend · {reviews.facebook.count}
              </span>
            </span>
          ) : null}
        </div>
      </div>
      <figure className={styles.quote} aria-live="polite">
        <blockquote>“{q.text}”</blockquote>
        <figcaption className={styles.caption}>
          <span>
            {q.author} · {q.source === "google" ? "Google review" : "Facebook recommendation"}
          </span>
          <span className={styles.dots}>
            {quotes.map((r, i) => (
              <button key={r.id} type="button" aria-label={`Show review ${i + 1}`} aria-pressed={i === index} onClick={() => setIndex(i)}>
                <span />
              </button>
            ))}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
