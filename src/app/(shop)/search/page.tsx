import type { Metadata } from "next";
import { Suspense } from "react";
import { toCardData } from "@/components/commerce/card-data";
import { ProductCard } from "@/components/commerce/ProductCard";
import { GuideCard } from "@/components/content/GuideCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Frame";
import { search } from "@/lib/data/catalog";
import styles from "../content.module.css";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

/** Teas as product cards, then guides as guide cards, and a kind empty state (V2.1 3.5). */
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <section className={`container ${styles.section}`}>
      <span className="label">Search results</span>
      <Suspense fallback={<Skeleton height={56} width="min(640px, 100%)" />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 80);
  const results = q.length >= 2 ? await search(q) : { products: [], guides: [] };
  const none = results.products.length + results.guides.length === 0;

  return (
    <>
      <h1 className="heading-1">{q ? `Results for “${q}”` : "Search"}</h1>
      <form action="/search" role="search" className={styles.searchField}>
        <Icon name="search" />
        <input type="search" name="q" defaultValue={q} placeholder="Search teas and guides" aria-label="Search teas and guides" />
      </form>
      {results.products.length ? (
        <div className={styles.section}>
          <h2 className="heading-2">Teas</h2>
          <div className={styles.productGrid}>
            {results.products.map((p) => (
              <div key={p.handle} data-reveal="up">
                <ProductCard card={toCardData(p)} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {results.guides.length ? (
        <div className={styles.section}>
          <h2 className="heading-2">Guides</h2>
          <div className={styles.cardGrid}>
            {results.guides.map((g) => (
              <GuideCard key={g.handle} guide={g} showTime={false} />
            ))}
          </div>
        </div>
      ) : null}
      {none ? (
        <div className={styles.empty}>
          <p className="heading-3">{q.length < 2 ? "Type a tea, a method or a flavour." : `Nothing for “${q}” yet.`}</p>
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
      ) : null}
    </>
  );
}
