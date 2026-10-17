"use client";

import { useState, type ReactNode } from "react";
import { FilterChip } from "@/components/ui/Badge";
import type { MethodId } from "@/lib/data/types";
import styles from "@/app/(shop)/content.module.css";

const FILTERS: Array<{ id: MethodId | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "whisk", label: "Whisk" },
  { id: "frother", label: "Frother" },
  { id: "shaker", label: "Shaker" },
  { id: "iced", label: "Iced" },
];

/** Method filter chips over server-rendered guide cards. */
export function GuideGrid({ cards }: { cards: Array<{ method: MethodId; node: ReactNode; key: string }> }) {
  const [filter, setFilter] = useState<MethodId | "all">("all");
  const shown = cards.filter((c) => filter === "all" || c.method === filter);
  return (
    <>
      <div className={styles.chips} role="group" aria-label="Filter by method">
        {FILTERS.map((f) => (
          <FilterChip key={f.id} pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </FilterChip>
        ))}
      </div>
      <div className={styles.cardGrid} aria-live="polite">
        {shown.map((c) => (
          <div key={c.key}>{c.node}</div>
        ))}
      </div>
    </>
  );
}
