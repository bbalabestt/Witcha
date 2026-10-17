"use client";

import { useState } from "react";
import { Marquee } from "@/components/motion/Marquee";
import type { SocialReview, SocialReviews } from "@/lib/providers";
import styles from "./HomeReviews.module.css";

const AVATAR = ["var(--surface-brand)", "var(--surface-blush)", "var(--surface-soft)", "var(--surface-blush)"];

function Card({ r, i }: { r: SocialReview; i: number }) {
  return (
    <article className={styles.card}>
      {r.photo ? <div className={styles.photo} role="img" aria-label={r.photo.alt} style={{ backgroundImage: `url('${r.photo.url}')` }} /> : null}
      <div className={styles.who}>
        <span className={styles.avatar} style={{ background: AVATAR[i % AVATAR.length] }} aria-hidden="true">
          {r.author[0]}
        </span>
        <span className={styles.name}>
          <span>{r.author}</span>
          <span className="body-small">{r.date}</span>
        </span>
        <span className={styles.source}>{r.source}</span>
      </div>
      {r.rating !== null ? (
        <span className={styles.rate} role="img" aria-label={`${r.rating} out of 5 stars`}>
          {"★★★★★".slice(0, r.rating)}
          {"☆☆☆☆☆".slice(0, 5 - r.rating)}
        </span>
      ) : (
        <span className={styles.rate}>✓ Recommends Witcha Matcha</span>
      )}
      <p className={styles.text}>{r.text}</p>
      <span className={styles.tea}>Tea · {r.tea}</span>
    </article>
  );
}

/**
 * Google Business Profile and Facebook reviews, shown as posted. Renders only when a provider returns real
 * reviews (or the SAMPLE DATA demo set, which is always tagged). Rows roll in opposite directions and pause on
 * hover or focus.
 */
export function HomeReviews({ reviews }: { reviews: SocialReviews }) {
  const [paused, setPaused] = useState(false);
  const all = reviews.reviews;
  const rowA = all.slice(0, Math.ceil(all.length / 2) + 1);
  const rowB = all.slice(Math.ceil(all.length / 2) - 1);

  return (
    <section className={styles.section} data-cat-line="People are whisking!" aria-labelledby="wm-rv-title">
      <div className={`container ${styles.head}`}>
        <div className={styles.titles}>
          <span className={`label ${styles.kicker}`} data-reveal="left">
            From our Google and Facebook pages
            {reviews.sample ? <span className="sample-tag">SAMPLE DATA</span> : null}
          </span>
          <h2 id="wm-rv-title" className="display-section" data-reveal="wipe-l">
            Made at home, <i className="serif-italic">told by you.</i>
          </h2>
        </div>
        <div className={styles.summaries} data-reveal="right">
          {reviews.google ? (
            <div className={styles.summary}>
              <span className="label">Google reviews</span>
              <span className={styles.big}>
                <span className={styles.score}>{reviews.google.rating.toFixed(1)}</span>
                <span aria-hidden="true">★★★★★</span>
              </span>
              <span className="body-small">from {reviews.google.count} reviews</span>
            </div>
          ) : null}
          {reviews.facebook ? (
            <div className={styles.summary}>
              <span className="label">Facebook</span>
              <span className={styles.big}>
                <span className={styles.score}>{reviews.facebook.recommendPercent}%</span>
                <span className="body-small">recommend</span>
              </span>
              <span className="body-small">from {reviews.facebook.count} recommendations</span>
            </div>
          ) : null}
        </div>
      </div>
      <div
        className={styles.rows}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <Marquee direction={1} skew={false} speed={0.45} paused={paused}>
          {rowA.map((r, i) => (
            <Card key={r.id} r={r} i={i} />
          ))}
        </Marquee>
        <Marquee direction={-1} skew={false} speed={0.45} paused={paused}>
          {rowB.map((r, i) => (
            <Card key={r.id} r={r} i={i + 1} />
          ))}
        </Marquee>
      </div>
      <div className={`container ${styles.foot}`}>
        <p className="body-small">
          Shown as posted on our Google Business Profile and Facebook page. We never edit or pick only the glowing ones.
        </p>
        <div className={styles.links}>
          <a href="https://www.google.com/maps" className={styles.out} rel="noopener" target="_blank">
            Review us on Google ↗
          </a>
          <a href="https://www.facebook.com/" className={styles.out} rel="noopener" target="_blank">
            Recommend us on Facebook ↗
          </a>
        </div>
      </div>
    </section>
  );
}
