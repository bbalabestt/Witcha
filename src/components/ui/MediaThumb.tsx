import Image from "next/image";
import type { Media } from "@/lib/data/types";
import { ImagePlaceholder, ratioToCss, type Ratio } from "./Frame";
import styles from "./MediaThumb.module.css";

type MediaFrameProps = {
  media: Media | null;
  ratio: Ratio;
  /** `sizes` for next/image; describe the rendered width at each breakpoint. */
  sizes: string;
  /** Only for the LCP image on a page. */
  priority?: boolean;
  className?: string;
  /** Label used when there is no media at all. */
  fallbackLabel?: string;
};

/** Ratio-locked image (no layout shift) or a labelled placeholder when the art does not exist yet. */
export function MediaFrame({ media, ratio, sizes, priority, className, fallbackLabel = "Image pending" }: MediaFrameProps) {
  if (!media || media.kind === "placeholder") {
    return <ImagePlaceholder label={media?.label ?? fallbackLabel} ratio={ratio} className={className} />;
  }
  return (
    <div className={[styles.frame, className].filter(Boolean).join(" ")} style={{ aspectRatio: ratioToCss(ratio) }}>
      <Image src={media.url} alt={media.alt} fill sizes={sizes} priority={priority} className={styles.img} />
    </div>
  );
}

/** Small decorative thumbnail (search, cart lines); the adjacent text names the item. */
export function MediaThumb({ media, ratio, width }: { media: Media | null; ratio: Ratio; width: number }) {
  const style = { width, aspectRatio: ratioToCss(ratio) };
  if (!media || media.kind === "placeholder") return <span className={styles.thumb} style={style} aria-hidden="true" />;
  return (
    <span className={styles.thumb} style={style}>
      <Image src={media.url} alt="" fill sizes={`${width}px`} className={styles.img} />
    </span>
  );
}
