"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CardData } from "./card-data";
import { TasteMini } from "./TasteScale";
import { addLabel, useAddFeedback } from "./useAddFeedback";
import styles from "./ProductCard.module.css";

const ACTION_LABEL = { add: "Add to cart", choose: "Choose size", notify: "Notify me" } as const;

/**
 * 4:5 image, badge slot, eyebrow, name, mini taste scale, two note chips, price + size on one row, and one
 * action: quick add for single-size teas, "Choose size" otherwise, "Notify me" when sold out (never greyed out).
 */
export function ProductCard({ card, priority = false }: { card: CardData; priority?: boolean }) {
  const { state, run } = useAddFeedback();
  const router = useRouter();
  const href = card.kind === "tool" ? null : `/products/${card.handle}`;
  const soldOut = card.action === "notify";

  const body = (
    <>
      <span className={styles.image}>
        {card.tin ? (
          <Image src={card.tin.url} alt={card.tin.alt} fill sizes="(max-width: 767px) 92vw, 310px" className={styles.tin} priority={priority} />
        ) : (
          <span className={styles.placeholder}>{card.placeholderLabel}</span>
        )}
        {soldOut ? <span className={styles.restocking}>Restocking · tap to be notified</span> : null}
        {card.badge ? (
          <span className={styles.badge} data-kind={card.badge}>
            {card.badge}
          </span>
        ) : null}
        {card.pending ? <span className={`pending-tag ${styles.pending}`}>Pending</span> : null}
      </span>
      <span className={styles.text}>
        {card.eyebrow ? <span className="label">{card.eyebrow}</span> : null}
        <span className={styles.name}>{card.title}</span>
        {card.taste ? <TasteMini position={card.taste.position} label={card.taste.label} /> : null}
        {card.notes.length ? (
          <span className={styles.notes}>
            {card.notes.map((n) => (
              <span key={n} className={styles.note}>
                {n}
              </span>
            ))}
          </span>
        ) : null}
        <span className={styles.priceRow}>
          <span className={styles.prices}>
            <span className={styles.price}>{card.price}</span>
            {card.compareAt ? (
              <s className="body-small">
                <span className="visually-hidden">Was </span>
                {card.compareAt}
              </s>
            ) : null}
          </span>
          <span className="body-small">{card.size}</span>
        </span>
      </span>
    </>
  );

  return (
    <article className={styles.card}>
      {href ? (
        <Link href={href} className={styles.link}>
          {body}
        </Link>
      ) : (
        <div className={styles.link}>{body}</div>
      )}
      <button
        type="button"
        className={styles.action}
        data-state={state}
        aria-live="polite"
        aria-label={state === "idle" ? `${ACTION_LABEL[card.action]}: ${card.title}` : undefined}
        onClick={() => {
          if (card.action === "add" && card.preview) void run(card.preview);
          else if (href) router.push(href);
        }}
      >
        {state === "loading" ? <span className={styles.spinner} aria-hidden="true" /> : null}
        {addLabel(state, ACTION_LABEL[card.action])}
      </button>
    </article>
  );
}

/** Ghost card for the matcha collection while fewer than three teas exist. Not a link. */
export function ComingSoonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.ghost}>
        {/* eslint-disable-next-line @next/next/no-img-element -- concept art inside a fixed ghost frame */}
        <img src="/art/05-fifth-sku-concept-tin-mockup.webp" alt="The Dreamer tin, a fifth tea concept." width={720} height={720} loading="lazy" />
        <span className="label">Tea in preparation · concept</span>
      </div>
      <span className={styles.name}>Coming to the Academy</span>
      <span className="body-small">A new tea is being tasted. Letters from the Academy will hear first.</span>
    </div>
  );
}
