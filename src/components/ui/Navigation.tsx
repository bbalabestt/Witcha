import Link from "next/link";
import { Button } from "./Button";
import styles from "./Navigation.module.css";

export type Crumb = { label: string; href?: string };

/** Last crumb is the current page (no link). */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={[styles.breadcrumb, className].filter(Boolean).join(" ")}>
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`}>
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {last || !c.href ? <span aria-current={last ? "page" : undefined}>{c.label}</span> : <Link href={c.href}>{c.label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type LoadMoreProps = {
  shown: number;
  total: number | null;
  loading: boolean;
  onLoadMore: () => void;
  noun?: string;
};

export function LoadMore({ shown, total, loading, onLoadMore, noun = "teas" }: LoadMoreProps) {
  const done = total !== null && shown >= total;
  return (
    <div className={styles.loadMore}>
      {total !== null ? (
        <p className={styles.count} aria-live="polite">
          Showing {shown} of {total} {noun}
        </p>
      ) : null}
      {done ? null : (
        <Button variant="secondary" size="md" status={loading ? "loading" : "idle"} disabled={loading} onClick={onLoadMore}>
          {loading ? "Loading" : "Load more"}
        </Button>
      )}
    </div>
  );
}
