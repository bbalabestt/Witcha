"use client";

import { useState, useTransition, type ReactNode } from "react";
import { LoadMore } from "@/components/ui/Navigation";
import { loadCollectionPage } from "@/lib/data/actions";
import type { PageInfo, Product } from "@/lib/data/types";
import { ProductCard } from "./ProductCard";
import styles from "./Collection.module.css";

type ProductGridProps = {
  handle: string;
  sort: string;
  filters: string[];
  initial: Product[];
  pageInfo: PageInfo;
  total: number | null;
  noun?: string;
  /** Extra tile after the products (e.g. "Coming to the Academy"). */
  trailing?: ReactNode;
};

/** Server-rendered first page; further pages append in place with "Load more" (cursor based). */
export function ProductGrid({ handle, sort, filters, initial, pageInfo, total, noun = "teas", trailing }: ProductGridProps) {
  const [products, setProducts] = useState(initial);
  const [info, setInfo] = useState(pageInfo);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    if (!info.endCursor) return;
    setError(null);
    startTransition(async () => {
      try {
        const next = await loadCollectionPage(handle, sort, filters, info.endCursor!);
        if (!next) throw new Error("empty");
        setProducts((list) => [...list, ...next.nodes.filter((n) => !list.some((x) => x.id === n.id))]);
        setInfo(next.pageInfo);
      } catch {
        setError("More teas didn’t load. Try again.");
      }
    });
  }

  return (
    <>
      <ul className={styles.grid}>
        {products.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} priority={i === 0} headingLevel="h2" />
          </li>
        ))}
        {trailing ? <li>{trailing}</li> : null}
      </ul>
      {info.hasNextPage || (total !== null && products.length < total) ? (
        <LoadMore shown={products.length} total={total} loading={pending} onLoadMore={loadMore} noun={noun} />
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
