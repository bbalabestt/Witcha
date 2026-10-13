"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SORT_OPTIONS, type SortKey } from "@/lib/data/types";
import styles from "./Collection.module.css";

/** URL-driven sort (`?sort=`). Keeps filters; resets pagination. */
export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <label className={styles.sort}>
      <span className="label">Sort</span>
      <span className={styles.selectWrap}>
        <select
          name="sort"
          value={value}
          aria-busy={pending || undefined}
          onChange={(e) => {
            const next = new URLSearchParams(params.toString());
            if (e.target.value === "featured") next.delete("sort");
            else next.set("sort", e.target.value);
            const qs = next.toString();
            startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
