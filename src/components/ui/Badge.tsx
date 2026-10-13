import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeTone = "solid" | "sale" | "pending";

export function Badge({ tone = "solid", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")}>{children}</span>;
}

export type ChipTone = "note" | "noteOnSoft" | "outline";

export function Chip({ tone = "note", children, className }: { tone?: ChipTone; children: ReactNode; className?: string }) {
  return <span className={[styles.chip, styles[tone], className].filter(Boolean).join(" ")}>{children}</span>;
}

type FilterChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & { pressed: boolean };

export function FilterChip({ pressed, className, type, ...rest }: FilterChipProps) {
  return (
    <button
      {...rest}
      type={type ?? "button"}
      aria-pressed={pressed}
      className={[styles.chip, styles.filter, className].filter(Boolean).join(" ")}
    />
  );
}
