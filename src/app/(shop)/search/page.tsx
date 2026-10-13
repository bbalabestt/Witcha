import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MediaFrame } from "@/components/ui/MediaThumb";
import { search } from "@/lib/data";
import { CollectionSkeleton } from "../collections/[handle]/skeleton";
import styles from "./search.module.css";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className={styles.page}>
      <h1 className="heading-1">Search</h1>
      <Suspense fallback={<CollectionSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (raw ?? "").trim().slice(0, 80);
  const results = q.length >= 2 ? await search(q.toLowerCase()) : null;
  const total = results ? results.products.length + results.articles.length : 0;

  return (
    <>
      <form action="/search" role="search" className={styles.form}>
        <label className={styles.field}>
          <Icon name="search" />
          <span className="visually-hidden">Search teas and guides</span>
          <input type="search" name="q" defaultValue={q} placeholder="Search teas and guides" enterKeyHint="search" />
        </label>
        <Button type="submit" size="xl">
          Search
        </Button>
      </form>

      {results === null ? (
        <p>Type at least two letters, or start with <Link href="/collections/matcha">Which Matcha Today?</Link></p>
      ) : total === 0 ? (
        <div className={styles.none}>
          <p className="heading-3">Nothing for “{q}” yet.</p>
          <p>Try a taste instead: compare our teas from bright to deep, or ask us and we’ll point you to the right tin.</p>
          <div className={styles.actions}>
            <Button href="/collections/matcha" size="md">
              Which Matcha Today?
            </Button>
            <Button href="/pages/contact" variant="secondary" size="md">
              Contact us
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className={styles.count} aria-live="polite">
            {total} {total === 1 ? "result" : "results"} for “{q}”
          </p>
          {results.products.length ? (
            <section aria-labelledby="search-teas" className={styles.section}>
              <h2 id="search-teas" className="label">
                Teas and gifts
              </h2>
              <ul className={styles.grid}>
                {results.products.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} priority={i === 0} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {results.articles.length ? (
            <section aria-labelledby="search-guides" className={styles.section}>
              <h2 id="search-guides" className="label">
                Guides
              </h2>
              <ul className={styles.guides}>
                {results.articles.map((a) => (
                  <li key={a.id}>
                    <Link href={`/blogs/${a.blogHandle}/${a.handle}`} className={styles.guide}>
                      <MediaFrame media={a.image} ratio="3:2" sizes="(max-width: 600px) 100vw, 300px" />
                      <span className="label">{a.method}</span>
                      <span className="heading-3">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
