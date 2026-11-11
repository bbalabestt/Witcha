import type { TeaType } from "@/lib/data/types";
import styles from "./TinPlaceholder.module.css";

/**
 * Stand-in until pack shots exist. No caption, no claim, no wordmark (the logo is never retyped).
 * Hojicha gets the dark lid of its black tin, drawn in charcoal: packaging, not a theme colour.
 * Hovering the surrounding link lifts the lid and lets a little of the tea out.
 */
export function TinPlaceholder({ teaType, className }: { teaType: TeaType | null; className?: string }) {
  const lid = teaType === "hojicha" ? "var(--brand-charcoal)" : "var(--brand-cream)";
  const puff = teaType === "hojicha" ? "var(--tea-hojicha)" : "var(--tea-matcha)";
  return (
    <svg viewBox="0 -18 80 128" aria-hidden="true" className={[styles.tin, className].filter(Boolean).join(" ")}>
      <g fill={puff}>
        <circle className={styles.puff} style={{ animationDelay: "0ms" }} cx="30" cy="8" r="4" />
        <circle className={styles.puff} style={{ animationDelay: "120ms" }} cx="42" cy="6" r="5" />
        <circle className={styles.puff} style={{ animationDelay: "240ms" }} cx="52" cy="9" r="3.5" />
      </g>
      <rect x="14" y="18" width="52" height="88" fill="var(--brand-cream)" stroke="var(--brand-charcoal)" />
      <rect x="14" y="44" width="52" height="34" fill="none" stroke="var(--line-hairline)" />
      <rect className={styles.lid} x="10" y="4" width="60" height="14" fill={lid} stroke="var(--brand-charcoal)" />
    </svg>
  );
}
