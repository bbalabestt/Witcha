import type { CSSProperties, ReactNode } from "react";
import styles from "./Frame.module.css";

/** Standard brand ratios (design brief §3.5). */
export type Ratio = "4:5" | "3:4" | "16:9" | "3:2" | "1:1";

export function ratioToCss(ratio: Ratio): string {
  const [w, h] = ratio.split(":");
  return `${w} / ${h}`;
}

type ImagePlaceholderProps = {
  /** What belongs here, e.g. "TIN PACK SHOT". Rendered in capitals. */
  label: string;
  ratio?: Ratio;
  shape?: "rect" | "arch";
  tone?: "soft" | "brand" | "page" | "dashed";
  /** Append " · 4:5" to the label. */
  showRatio?: boolean;
  /** Optional corner slot, e.g. a PENDING or NEW badge. */
  badge?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Labelled, ratio-correct stand-in for imagery that does not exist yet. Never a fake photo. */
export function ImagePlaceholder({
  label,
  ratio = "4:5",
  shape = "rect",
  tone = "soft",
  showRatio = true,
  badge,
  className,
  style,
}: ImagePlaceholderProps) {
  const effectiveRatio: Ratio = shape === "arch" ? "3:4" : ratio;
  const text = showRatio ? `${label} · ${effectiveRatio}` : label;
  return (
    <div
      role="img"
      aria-label={`Image placeholder: ${text}`}
      className={[styles.frame, styles.placeholder, styles[tone], shape === "arch" ? styles.arch : undefined, className]
        .filter(Boolean)
        .join(" ")}
      style={{ aspectRatio: ratioToCss(effectiveRatio), ...style }}
    >
      <span aria-hidden="true">{text}</span>
      {badge ? <span className={styles.badgeSlot}>{badge}</span> : null}
    </div>
  );
}

type ArchFrameProps = {
  children: ReactNode;
  /** Gold hairline arch drawn just outside the frame. */
  outlined?: boolean;
  className?: string;
};

/** The signature arch: top corners only, 3:4 so it is always taller than wide. */
export function ArchFrame({ children, outlined = false, className }: ArchFrameProps) {
  return (
    <div className={[styles.archFrame, outlined ? styles.outlined : undefined, className].filter(Boolean).join(" ")}>
      <div className={styles.archInner}>{children}</div>
    </div>
  );
}

type SkeletonProps = { width?: CSSProperties["width"]; height?: CSSProperties["height"]; ratio?: Ratio; className?: string };

export function Skeleton({ width = "100%", height, ratio, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      style={{ width, height: ratio ? undefined : (height ?? "1em"), aspectRatio: ratio ? ratioToCss(ratio) : undefined }}
    />
  );
}
