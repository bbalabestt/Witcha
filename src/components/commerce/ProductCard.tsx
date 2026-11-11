import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { TinPlaceholder } from "@/components/ui/TinPlaceholder";
import type { CardData } from "./card-data";
import styles from "./ProductCard.module.css";

/** Short enough to scan four on a phone. Each block hides when it has no confirmed content. */
export function ProductCard({ card, priority = false, index = 0 }: { card: CardData; priority?: boolean; index?: number }) {
  const body = (
    <>
      <span className={styles.image}>
        {card.tin ? (
          <Image src={card.tin.url} alt={card.tin.alt} fill sizes="(max-width: 767px) 92vw, 310px" className={styles.tin} priority={priority} />
        ) : (
          <TinPlaceholder teaType={card.teaType} className={styles.drawing} />
        )}
      </span>
      <span className={styles.text}>
        {card.typeLabel ? <span className="label">{card.typeLabel}</span> : null}
        <span className={styles.name}>{card.title}</span>
        {card.notes.length ? <span className={styles.notes}>{card.notes.join(" · ")}</span> : null}
        {card.bestForShort ? <span className={styles.bestFor}>Best for: {card.bestForShort}</span> : null}
      </span>
      <span className={styles.priceRow}>
        <span>
          {card.soldOut ? "Sold out" : [card.price, card.size].filter(Boolean).join(" · ")}
        </span>
        {card.href ? <span className={styles.view}>View</span> : null}
      </span>
    </>
  );

  return (
    <article className={styles.card} data-tea={card.teaType ?? undefined} data-rise="" style={{ "--i": index } as CSSProperties}>
      {card.href ? (
        <Link href={card.href} className={styles.link}>
          {body}
        </Link>
      ) : (
        <div className={styles.link}>{body}</div>
      )}
    </article>
  );
}
