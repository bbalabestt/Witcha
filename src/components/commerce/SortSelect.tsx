"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/data/sort";
import type { SortKey } from "@/lib/data/types";
import styles from "./Collection.module.css";

/** URL-driven sort (`?sort=`); works as a plain form without JavaScript. */
export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <form method="get" className={styles.sort}>
      <label htmlFor="collection-sort" className="label">
        Sort
      </label>
      <span className={styles.selectWrap}>
        <select
          id="collection-sort"
          name="sort"
          defaultValue={value}
          className={styles.select}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            next.set("sort", e.target.value);
            next.delete("shown");
            router.replace(`${pathname}?${next.toString()}`, { scroll: false });
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
      <noscript>
        <button type="submit" className="label-link">
          Apply
        </button>
      </noscript>
    </form>
  );
}
