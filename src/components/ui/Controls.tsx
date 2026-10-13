"use client";

import { useRef, type KeyboardEvent } from "react";
import { Icon } from "./Icon";
import styles from "./Controls.module.css";

/* ---------- Quantity ---------- */

export function clampQuantity(value: number, max: number | null, min = 1): number {
  const ceiling = max === null ? Number.POSITIVE_INFINITY : Math.max(min, max);
  if (!Number.isFinite(value)) return min;
  return Math.min(ceiling, Math.max(min, Math.trunc(value)));
}

type QuantityStepperProps = {
  value: number;
  /** Upper bound from stock; null when unknown. */
  max: number | null;
  min?: number;
  onChange: (next: number) => void;
  size?: "default" | "compact";
  label?: string;
  disabled?: boolean;
};

export function QuantityStepper({ value, max, min = 1, onChange, size = "default", label = "Quantity", disabled }: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = max !== null && value >= max;
  return (
    <div role="group" aria-label={label} className={[styles.stepper, size === "compact" ? styles.stepperCompact : undefined].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={styles.stepperButton}
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={disabled || atMin}
        onClick={() => onChange(clampQuantity(value - 1, max, min))}
      >
        <Icon name="minus" size={20} />
      </button>
      <output className={styles.stepperValue} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={styles.stepperButton}
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={disabled || atMax}
        onClick={() => onChange(clampQuantity(value + 1, max, min))}
      >
        <Icon name="plus" size={20} />
      </button>
    </div>
  );
}

/* ---------- Option pills (radio group) ---------- */

export type PillOption = {
  value: string;
  label: string;
  sub?: string;
  /** Sold out options stay selectable so the shopper can ask to be notified. */
  available: boolean;
};

export function nextIndex(current: number, key: string, length: number): number | null {
  if (length === 0) return null;
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % length;
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + length) % length;
    case "Home":
      return 0;
    case "End":
      return length - 1;
    default:
      return null;
  }
}

type OptionPillGroupProps = {
  label: string;
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
};

export function OptionPillGroup({ label, options, value, onChange }: OptionPillGroupProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = Math.max(0, options.findIndex((o) => o.value === value));

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextIndex(index, e.key, options.length);
    if (next === null) return;
    e.preventDefault();
    const opt = options[next];
    if (!opt) return;
    onChange(opt.value);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className={styles.pillGroup}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === selected}
          tabIndex={i === selected ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={[styles.pill, o.available ? undefined : styles.pillUnavailable].filter(Boolean).join(" ")}
        >
          <span className={styles.pillMain}>{o.label}</span>
          {o.sub ? <span className={styles.pillSub}>{o.available ? o.sub : "Sold out"}</span> : null}
        </button>
      ))}
    </div>
  );
}
