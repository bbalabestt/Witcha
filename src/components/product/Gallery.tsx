"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import type { GalleryItem } from "@/lib/data/types";
import styles from "./Gallery.module.css";

function Slide({ item, sizes, priority }: { item: GalleryItem; sizes: string; priority?: boolean }) {
  if (item.kind === "placeholder") {
    return (
      <span className={styles.placeholder} role="img" aria-label={`Image placeholder: ${item.label} · 4:5`}>
        {item.label} · 4:5
      </span>
    );
  }
  return (
    <Image
      src={item.image.url}
      alt={item.image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={item.fit === "contain" ? styles.contain : styles.cover}
    />
  );
}

/** 4:5 main image with arrows, counter and zoom; a six-up thumbnail rail; swipe on touch; lightbox. */
export function Gallery({ items, title }: { items: GalleryItem[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const start = useRef<number | null>(null);
  const count = items.length;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);
  const current = items[index] ?? items[0]!;

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") start.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (start.current === null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  return (
    <div className={styles.gallery} data-reveal="fade">
      <div className={styles.main} onPointerDown={onPointerDown} onPointerUp={onPointerUp} aria-roledescription="carousel" aria-label={`${title} images`}>
        <Slide item={current} sizes="(max-width: 899px) 100vw, 58vw" priority={index === 0} />
        {count > 1 ? (
          <>
            <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="Previous image" onClick={() => go(-1)}>
              <Icon name="chevron-left" size={22} />
            </button>
            <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next image" onClick={() => go(1)}>
              <Icon name="chevron-right" size={22} />
            </button>
            <span className={styles.counter} aria-live="polite">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
        {current.kind === "image" ? (
          <button type="button" className={styles.zoom} aria-label="Zoom image" onClick={() => setZoomOpen(true)}>
            <Icon name="zoom" size={22} />
          </button>
        ) : null}
      </div>
      {count > 1 ? (
        <div className={styles.thumbs}>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className={styles.thumb}
              aria-label={`Show image ${i + 1}: ${item.label.toLowerCase()}`}
              aria-current={i === index || undefined}
              onClick={() => setIndex(i)}
            >
              {item.kind === "image" ? (
                <Image src={item.image.url} alt="" fill sizes="96px" className={item.fit === "contain" ? styles.contain : styles.cover} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} placement="center" title={title} closeLabel="Close zoom" className={styles.lightbox}>
        <div className={styles.lightboxStage}>
          <Slide item={current} sizes="100vw" />
          {count > 1 ? (
            <>
              <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="Previous image" onClick={() => go(-1)}>
                <Icon name="chevron-left" size={22} />
              </button>
              <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next image" onClick={() => go(1)}>
                <Icon name="chevron-right" size={22} />
              </button>
              <span className={styles.counter}>
                {index + 1} / {count}
              </span>
            </>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
