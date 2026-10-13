"use client";

import Link from "next/link";
import { useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button, IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { merchandiseFor } from "@/lib/cart/optimistic";
import { formatMoney } from "@/lib/data/money";
import { defaultVariant, isMultiVariant, productEyebrow } from "@/lib/data/product";
import type { Product } from "@/lib/data/types";
import { NEWSLETTER_EMAIL_ID } from "@/components/layout/NewsletterForm";
import styles from "./Home.module.css";

/**
 * "The Academy shelf": the prototype's horizontal shelf variant as a swipeable, keyboard-friendly
 * scroll-snap row (no scroll hijacking). Ends with a ghost "Coming to the Academy" card.
 */
export function AcademyShelf({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const track = useRef<HTMLUListElement>(null);

  function nudge(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 40 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function focusNewsletter() {
    const input = document.getElementById(NEWSLETTER_EMAIL_ID);
    if (!input) return;
    input.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => input.focus({ preventScroll: true }), 500);
  }

  return (
    <section className={styles.shelf} aria-labelledby="shelf-title">
      <div className={styles.shelfHead}>
        <div>
          <span className="label">The Academy shelf</span>
          <h2 id="shelf-title" className={styles.sectionDisplay}>
            Take one down.
          </h2>
        </div>
        <div className={styles.shelfNav}>
          <IconButton label="Previous on the shelf" onClick={() => nudge(-1)}>
            <Icon name="chevron-left" />
          </IconButton>
          <IconButton label="Next on the shelf" onClick={() => nudge(1)}>
            <Icon name="chevron-right" />
          </IconButton>
        </div>
      </div>
      <ul ref={track} className={styles.shelfTrack}>
        {products.map((p, i) => {
          const v = defaultVariant(p);
          const multi = isMultiVariant(p);
          return (
            <li key={p.id} className={styles.shelfCard} data-tint={i % 2 ? "brand" : "soft"}>
              <Link href={`/products/${p.handle}`} className={styles.shelfArch} aria-label={p.title} tabIndex={-1}>
                <span className={styles.shelfThumb}>Product · 4:5</span>
              </Link>
              <div className={styles.shelfMeta}>
                <span className="label">{productEyebrow(p)}</span>
                <span className={styles.shelfNo} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <Link href={`/products/${p.handle}`} className={styles.shelfName}>
                {p.title}
              </Link>
              {p.cardNote ? <span className={styles.small}>{p.cardNote}</span> : null}
              <div className={styles.shelfBuy}>
                <span className={styles.shelfPrice}>{v ? `${multi ? "From " : ""}${formatMoney(multi ? p.priceRange.min : v.price)}` : null}</span>
                {v && p.availableForSale && !multi ? (
                  <Button variant="secondary" size="md" onClick={() => void addItem(merchandiseFor(p, v), 1)} aria-label={`Add ${p.title} to cart`}>
                    Add to cart
                  </Button>
                ) : (
                  <Button href={`/products/${p.handle}`} variant="secondary" size="md">
                    {p.availableForSale ? "Choose size" : "Notify me"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
        <li className={[styles.shelfCard, styles.shelfGhost].join(" ")}>
          <span className={styles.shelfArch} aria-hidden="true" />
          <div className={styles.shelfMeta}>
            <span className="label">In preparation</span>
            <span className={styles.shelfNo} aria-hidden="true">
              {String(products.length + 1).padStart(2, "0")}
            </span>
          </div>
          <span className={styles.shelfName}>Coming to the Academy</span>
          <span className={styles.small}>A new tea is being tasted. Letters hear first.</span>
          <div className={styles.shelfBuy}>
            <span />
            <Button variant="secondary" size="md" onClick={focusNewsletter}>
              Get the letter
            </Button>
          </div>
        </li>
      </ul>
    </section>
  );
}
