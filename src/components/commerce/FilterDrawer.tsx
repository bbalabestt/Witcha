"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { collectionHref, serializeFilter } from "@/lib/data/collection-params";
import type { FilterGroup, ProductFilter, SortKey } from "@/lib/data/types";
import styles from "./Collection.module.css";

type FilterDrawerProps = {
  handle: string;
  groups: FilterGroup[];
  active: ProductFilter[];
  sort: SortKey;
};

/** Right-hand drawer of checkbox filters; Apply writes them to the URL. Only mounted for 6+ products. */
export function FilterDrawer({ handle, groups, active, sort }: FilterDrawerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(() => new Set(active.map(serializeFilter)));

  const byKey = new Map(groups.flatMap((g) => g.values.map((v) => [serializeFilter(v.input), v.input] as const)));

  function apply(keys: Set<string>) {
    const filters = [...keys].map((k) => byKey.get(k)).filter((f): f is ProductFilter => Boolean(f));
    setOpen(false);
    router.replace(collectionHref(handle, { sort, filters }), { scroll: false });
  }

  return (
    <>
      <Button
        variant="secondary"
        size="md"
        onClick={() => {
          setDraft(new Set(active.map(serializeFilter)));
          setOpen(true);
        }}
      >
        <Icon name="scale" size={18} />
        Filter{active.length ? ` (${active.length})` : ""}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} placement="right" title="Filter">
        <form
          className={styles.filterForm}
          onSubmit={(e) => {
            e.preventDefault();
            apply(draft);
          }}
        >
          {groups.map((g) => (
            <fieldset key={g.id} className={styles.fieldset}>
              <legend className="label">{g.label}</legend>
              {g.values.map((v) => {
                const key = serializeFilter(v.input);
                return (
                  <label key={v.id} className={styles.option}>
                    <input
                      type="checkbox"
                      checked={draft.has(key)}
                      disabled={v.count === 0 && !draft.has(key)}
                      onChange={() =>
                        setDraft((d) => {
                          const n = new Set(d);
                          if (n.has(key)) n.delete(key);
                          else n.add(key);
                          return n;
                        })
                      }
                    />
                    <span>{v.label}</span>
                    <span className={styles.optionCount}>({v.count})</span>
                  </label>
                );
              })}
            </fieldset>
          ))}
          <div className={styles.filterActions}>
            <Button type="button" variant="link" onClick={() => setDraft(new Set())}>
              Clear all
            </Button>
            <Button type="submit" size="lg">
              Show results
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
