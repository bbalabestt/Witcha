"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ImagePlaceholder } from "@/components/ui/Frame";
import { Icon } from "@/components/ui/Icon";
import type { Media } from "@/lib/data/types";
import { usePdp } from "./PdpContext";
import styles from "./Pdp.module.css";

function Slide({ media, priority, sizes }: { media: Media; priority: boolean; sizes: string }) {
  if (media.kind === "placeholder") return <ImagePlaceholder label={media.label} ratio="4:5" />;
  return (
    <div className={styles.slideImage}>
      <Image src={media.url} alt={media.alt} fill sizes={sizes} priority={priority} className={styles.cover} />
    </div>
  );
}

function mediaKey(m: Media, i: number) {
  return m.kind === "image" ? m.url : `${m.label}-${i}`;
}

/**
 * Main 4:5 image with prev/next and counter, thumbnail rail, swipe on touch (scroll snap),
 * and a zoomable lightbox. Jumps to the selected size's image when it has one.
 */
export function Gallery() {
  const { product, variant } = usePdp();
  const media = product.media;
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  // True while we drive the scroll ourselves, so intermediate positions don't change the index.
  const steering = useRef<number | undefined>(undefined);
  const count = media.length;

  function go(i: number) {
    setIndex((i + count) % count);
  }

  // Follow the selected size's own image (adjusting state during render, not in an effect).
  const [lastVariant, setLastVariant] = useState(variant.id);
  if (lastVariant !== variant.id) {
    setLastVariant(variant.id);
    const img = variant.image;
    const i = img?.kind === "image" ? media.findIndex((m) => m.kind === "image" && m.url === img.url) : -1;
    if (i >= 0) setIndex(i);
  }

  // Bring the track to the selected slide (buttons, thumbnails, size change).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const left = index * el.clientWidth;
    if (Math.abs(el.scrollLeft - left) < 2) return;
    window.clearTimeout(steering.current);
    steering.current = window.setTimeout(() => (steering.current = undefined), 700);
    el.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [index]);

  // Keep the counter in step with swipes.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (steering.current !== undefined) return;
        setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const current = media[index] ?? media[0];
  const label = (m: Media, i: number) => (m.kind === "image" ? m.alt : `${m.label.toLowerCase()} (image ${i + 1})`);

  return (
    <div className={styles.gallery} aria-roledescription="carousel" aria-label={`${product.title} images`}>
      <div className={styles.stage}>
        <div ref={track} className={styles.track} tabIndex={0} aria-live="polite">
          {media.map((m, i) => (
            <div key={mediaKey(m, i)} className={styles.slide} aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={i !== index || undefined}>
              <Slide media={m} priority={i === 0} sizes="(max-width: 860px) 100vw, 50vw" />
            </div>
          ))}
        </div>
        {count > 1 ? (
          <>
            <IconButton label="Previous image" className={[styles.stageButton, styles.prev].join(" ")} onClick={() => go(index - 1)}>
              <Icon name="chevron-left" size={22} />
            </IconButton>
            <IconButton label="Next image" className={[styles.stageButton, styles.next].join(" ")} onClick={() => go(index + 1)}>
              <Icon name="chevron-right" size={22} />
            </IconButton>
            <span className={styles.counter} aria-hidden="true">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
        {current?.kind === "image" ? (
          <IconButton label="Zoom image" className={[styles.stageButton, styles.zoom].join(" ")} onClick={() => setZoomOpen(true)}>
            <Icon name="zoom" size={22} />
          </IconButton>
        ) : null}
      </div>

      {count > 1 ? (
        <ul className={styles.thumbs}>
          {media.map((m, i) => (
            <li key={mediaKey(m, i)}>
              <button type="button" className={styles.thumb} aria-label={`Show ${label(m, i)}`} aria-current={i === index || undefined} onClick={() => go(i)}>
                {m.kind === "image" ? <Image src={m.url} alt="" fill sizes="80px" className={styles.cover} /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog
        open={zoomOpen}
        onClose={() => {
          setZoomOpen(false);
          setZoomed(false);
        }}
        placement="center"
        title={product.title}
        closeLabel="Close zoom"
        className={styles.lightbox}
      >
        {current?.kind === "image" ? (
          <button type="button" className={styles.zoomFrame} data-zoomed={zoomed || undefined} onClick={() => setZoomed((z) => !z)} aria-label={zoomed ? "Zoom out" : "Zoom in"}>
            <Image src={current.url} alt={current.alt} fill sizes="(max-width: 900px) 100vw, 900px" className={styles.contain} />
          </button>
        ) : null}
      </Dialog>
    </div>
  );
}
