import type { CSSProperties, ReactNode } from "react";
import styles from "./Frame.module.css";

/** Standard brand ratios (design brief §3.5). */
export type Ratio = "4:5" | "3:4" | "16:9" | "3:2" | "1:1";

export function ratioToCss(ratio: Ratio): string {
  const [w, h] = ratio.split(":");
  return `${w} / ${h}`;
}

type ImagePlaceholderProps = {
  ratio?: Ratio;
  shape?: "rect" | "arch";
  tone?: "soft" | "brand" | "page";
  /** Optional line drawing, centred. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Neutral, ratio-correct frame for imagery that does not exist yet. No caption, never a fake photo. */
export function ImagePlaceholder({ ratio = "4:5", shape = "rect", tone = "soft", children, className, style }: ImagePlaceholderProps) {
  const effectiveRatio: Ratio = shape === "arch" ? "3:4" : ratio;
  return (
    <div
      aria-hidden="true"
      className={[styles.frame, styles.placeholder, styles[tone], shape === "arch" ? styles.arch : undefined, className].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratioToCss(effectiveRatio), ...style }}
    >
      {children}
    </div>
  );
}

type ArchFrameProps = {
  children: ReactNode;
  /** Gold hairline arch drawn just outside the frame: on cream only. */
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
