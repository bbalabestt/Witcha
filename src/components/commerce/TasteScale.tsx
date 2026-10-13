import Link from "next/link";
import type { CSSProperties } from "react";
import type { TastePosition } from "@/lib/data/types";
import styles from "./TasteScale.module.css";

export type TasteMarker = {
  position: TastePosition;
  /** Accessible name, e.g. "Yame no Mukashi, Deep 4 of 5". */
  label: string;
  /** Short visible caption under the marker (header variant), e.g. "Yame · 4 of 5". */
  caption?: string;
  href?: string;
  /** Filled = this tea; outline = another tea, for comparison. */
  tone?: "filled" | "outline";
};

export type TasteScaleSize = "mini" | "panel" | "header";

type TasteScaleProps = {
  size: TasteScaleSize;
  markers: TasteMarker[];
  /** BRIGHT / DEEP end labels. Above the track for `header`, below otherwise. */
  endLabels?: boolean;
  /** Visible text equivalent, e.g. "Deep, 4 of 5"; the scale must read without colour. */
  caption?: string;
  className?: string;
};

/** Marker centre for a 1–5 stop, as a percentage along the track. */
export function markerPercent(position: TastePosition): number {
  return (position - 1) * 25;
}

export function TasteScale({ size, markers, endLabels = size !== "mini", caption, className }: TasteScaleProps) {
  const interactive = markers.some((m) => m.href);
  const summary = `Taste scale, bright to deep: ${markers.map((m) => m.label).join("; ")}`;
  const ends = endLabels ? (
    <div className={styles.ends} aria-hidden="true">
      <span>BRIGHT</span>
      <span>DEEP</span>
    </div>
  ) : null;

  return (
    <div className={[styles.scale, styles[size], className].filter(Boolean).join(" ")}>
      {size === "header" ? ends : null}
      <div className={styles.track} role={interactive ? "group" : "img"} aria-label={summary}>
        <span className={styles.line} />
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={styles.tick} style={{ left: `${markerPercent(n as TastePosition)}%` }} />
        ))}
        {markers.map((m) => {
          const style = { "--at": `${markerPercent(m.position)}%` } as CSSProperties;
          const cls = [styles.marker, m.tone === "outline" ? styles.outline : undefined].filter(Boolean).join(" ");
          return m.href ? (
            <Link key={`${m.label}-${m.position}`} href={m.href} className={cls} style={style} aria-label={m.label} />
          ) : (
            <span key={`${m.label}-${m.position}`} className={cls} style={style} aria-hidden="true" />
          );
        })}
      </div>
      {size === "header" && markers.some((m) => m.caption) ? (
        <div className={styles.captions} aria-hidden="true">
          {markers.map((m) =>
            m.caption ? (
              <span key={`${m.label}-cap`} style={{ "--at": `${markerPercent(m.position)}%` } as CSSProperties}>
                {m.caption}
              </span>
            ) : null,
          )}
        </div>
      ) : null}
      {size !== "header" ? ends : null}
      {caption ? <p className={styles.caption}>{caption}</p> : null}
    </div>
  );
}
