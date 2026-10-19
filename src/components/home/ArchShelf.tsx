"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LinePreview } from "@/components/commerce/CartProvider";
import { addLabel, useAddFeedback } from "@/components/commerce/useAddFeedback";
import { hoverCapable } from "@/components/motion/runtime";
import type { Image as Img } from "@/lib/data/types";
import { focusNewsletter } from "./focus-newsletter";
import styles from "./ArchShelf.module.css";

export type ShelfItem = {
  id: string;
  handle: string | null;
  name: string;
  eyebrow: string;
  line: string;
  price: string;
  tin: Img | null;
  key: Img | null;
  preview: LinePreview | null;
};

function ShelfArch({ item, index, on, onEnter, onLeave }: { item: ShelfItem; index: number; on: boolean; onEnter: () => void; onLeave: () => void }) {
  const { state, run } = useAddFeedback();
  const router = useRouter();
  const action = item.preview ? "Add to cart" : item.handle ? "Notify me" : "Get the letter";

  return (
    // Touch screens get no sticky hover: tapping opens the tea instead (V4 mobile round).
    <div className={styles.item} data-on={on || undefined} onMouseEnter={() => hoverCapable() && onEnter()} onMouseLeave={onLeave}>
      <div className={styles.inner} data-reveal="up" data-delay={String(index * 90)}>
        <button
          type="button"
          className={styles.arch}
          data-tint={index % 2 ? "soft" : "page"}
          onFocus={onEnter}
          onBlur={onLeave}
          onClick={() => (item.handle ? router.push(`/products/${item.handle}`) : onEnter())}
        >
          {item.tin ? (
            <span className={styles.tin}>
              <Image src={item.tin.url} alt="" fill sizes="(max-width: 767px) 72vw, 22vw" className={styles.contain} />
            </span>
          ) : null}
          {item.key ? (
            <span className={styles.key}>
              <Image src={item.key.url} alt="" fill sizes="(max-width: 767px) 72vw, 30vw" className={styles.contain} />
            </span>
          ) : null}
          <span className="visually-hidden">{item.handle ? `View ${item.name}` : `${item.name}: meet the concept keeper`}</span>
          <span className={styles.number} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </button>
        <div className={styles.text}>
          <span className={`label ${styles.eyebrow}`}>{item.eyebrow}</span>
          {item.handle ? (
            <Link href={`/products/${item.handle}`} className={styles.name}>
              {item.name}
            </Link>
          ) : (
            <span className={styles.name}>{item.name}</span>
          )}
          <span className={`body-small ${styles.line}`}>{item.line}</span>
          <div className={styles.buy}>
            <span className={styles.price}>{item.price}</span>
            <button
              type="button"
              className={`${styles.add} on-primary`}
              onClick={() => {
                if (item.preview) void run(item.preview);
                else if (item.handle) router.push(`/products/${item.handle}`);
                else focusNewsletter();
              }}
            >
              {item.preview ? addLabel(state, action) : action}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Five arch windows on one shelf, about a screen tall (V4 "arches", the default shelf style). Hover or focus
 * swaps the tin for its keeper and widens the arch (desktop pointer only). Phones scroll it sideways.
 */
export function ArchShelf({ items, backdrop }: { items: ShelfItem[]; backdrop: boolean }) {
  const [hover, setHover] = useState(-1);
  return (
    <section className={styles.section} data-cat-line="Five keepers, one shelf." aria-labelledby="wm-shelf-title">
      {backdrop ? <div className={styles.backdrop} aria-hidden="true" /> : null}
      <div className={`container ${styles.content}`}>
        <div className={styles.head}>
          <div className={styles.titles}>
            <span className="label" data-reveal="left">
              The Academy shelf
            </span>
            <h2 id="wm-shelf-title" className="display-section" data-reveal="wipe-l">
              Take one down.
            </h2>
          </div>
          <div className={styles.intro} data-reveal="right">
            <p>Five keepers, one shelf. Hover or tab to a tin to meet the cat who looks after it.</p>
            <Link href="/collections/matcha" className="label-link">
              Shop all teas
            </Link>
          </div>
        </div>
        <div className={styles.row}>
          {items.map((item, i) => (
            <ShelfArch
              key={item.id}
              item={item}
              index={i}
              on={hover === i}
              onEnter={() => setHover(i)}
              onLeave={() => setHover((h) => (h === i ? -1 : h))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
