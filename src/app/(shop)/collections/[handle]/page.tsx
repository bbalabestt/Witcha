import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { toCardData, toGiftSet } from "@/components/commerce/card-data";
import { GiftSetCard } from "@/components/commerce/GiftSetCard";
import { ComingSoonCard, ProductCard } from "@/components/commerce/ProductCard";
import { SortSelect } from "@/components/commerce/SortSelect";
import { TasteLineup } from "@/components/commerce/TasteScale";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Navigation";
import { Skeleton } from "@/components/ui/Frame";
import { getCharacters, getCollection, getCollectionHandles, getSiteSettings } from "@/lib/data/catalog";
import { FILTER_MIN_PRODUCTS, PAGE_SIZE, parseSort } from "@/lib/data/sort";
import styles from "@/components/commerce/Collection.module.css";

export async function generateStaticParams() {
  return (await getCollectionHandles()).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const c = await getCollection(handle, { first: 1 });
  if (!c) return {};
  return { title: c.title, description: c.description, alternates: { canonical: `/collections/${handle}` } };
}

const CRUMB: Record<string, string> = { matcha: "Shop Matcha", gifts: "Gifts", accessories: "Accessories" };

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const collection = await getCollection(handle, { first: 250 });
  if (!collection) notFound();

  if (handle === "gifts") return <GiftsTemplate />;

  const teas = collection.products
    .filter((p) => p.taste)
    .map((p) => ({ handle: p.handle, title: p.title, position: p.taste!.position, word: p.taste!.word }));
  const isMatcha = handle === "matcha";
  // The ghost card stays while a concept keeper (the Dreamer) is still being tasted.
  const ghost = isMatcha && (await getCharacters()).some((c) => c.concept);

  return (
    <>
      <section className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.headerCopy}>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: CRUMB[handle] ?? collection.title }]} />
            <h1 className="heading-1" id="which-matcha-today" data-reveal="up">
              {collection.title}
            </h1>
            <p className={styles.intro} data-reveal="up">
              {collection.description}
            </p>
          </div>
          {isMatcha && teas.length ? (
            <div data-reveal="up">
              <TasteLineup teas={teas} />
            </div>
          ) : null}
        </div>
      </section>
      <div className={`container ${styles.body}`}>
        <Suspense fallback={<GridSkeleton />}>
          <Results handle={handle} searchParams={searchParams} ghost={ghost} />
        </Suspense>
      </div>
    </>
  );
}

async function Results({
  handle,
  searchParams,
  ghost,
}: {
  handle: string;
  searchParams: PageProps<"/collections/[handle]">["searchParams"];
  ghost: boolean;
}) {
  const sp = await searchParams;
  const sort = parseSort(sp.sort);
  const available = sp.available === "1";
  const shown = Math.max(PAGE_SIZE, Math.min(240, Number(sp.shown) || PAGE_SIZE));
  const page = await getCollection(handle, { sort, available, first: shown });
  if (!page) notFound();
  const noun = handle === "accessories" ? "tools" : "teas";
  const showFilters = page.total >= FILTER_MIN_PRODUCTS || available;

  const link = (next: Record<string, string | null>) => {
    const q = new URLSearchParams();
    if (sort !== "featured") q.set("sort", sort);
    if (available) q.set("available", "1");
    for (const [k, v] of Object.entries(next)) {
      if (v === null) q.delete(k);
      else q.set(k, v);
    }
    const s = q.toString();
    return `/collections/${handle}${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span aria-live="polite">
            {page.total} {noun}
          </span>
          {showFilters ? (
            <Link
              href={link({ available: available ? null : "1", shown: null })}
              scroll={false}
              className={styles.filter}
              data-on={available || undefined}
              aria-label={`In stock only, ${available ? "on" : "off"}`}
            >
              {available ? <Icon name="check" size={16} strokeWidth={2} /> : null}
              In stock only
            </Link>
          ) : null}
        </div>
        <SortSelect value={sort} />
      </div>

      {page.products.length === 0 ? (
        <div className={styles.empty}>
          <p className="heading-3">No teas match.</p>
          <Button href={`/collections/${handle}`} variant="secondary" size="md">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {page.products.map((p, i) => (
            <div key={p.handle} data-reveal="up">
              <ProductCard card={toCardData(p)} priority={i < 2} />
            </div>
          ))}
          {ghost && !page.hasNextPage ? (
            <div data-reveal="up">
              <ComingSoonCard />
            </div>
          ) : null}
        </div>
      )}

      <div className={styles.more}>
        <span>
          Showing {page.products.length} of {page.total}
        </span>
        {page.hasNextPage ? (
          <Button href={link({ shown: String(shown + PAGE_SIZE) })} variant="secondary" size="xl">
            Load more
          </Button>
        ) : (
          // V4 keeps the button, disabled, once every product is shown.
          <Button variant="secondary" size="xl" disabled>
            Load more
          </Button>
        )}
      </div>
    </>
  );
}

function GridSkeleton() {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Loading teas">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <Skeleton ratio="4:5" />
          <Skeleton width="40%" height={16} />
          <Skeleton width="70%" height={30} />
          <Skeleton height={44} />
        </div>
      ))}
    </div>
  );
}

async function GiftsTemplate() {
  const [collection, settings] = await Promise.all([getCollection("gifts", { first: 250 }), getSiteSettings()]);
  if (!collection) notFound();
  const sets = collection.products.filter((p) => p.kind === "gift");
  const singles = collection.products.filter((p) => p.kind === "tea");
  return (
    <>
      <section className={styles.headerSoft}>
        <div className={`container ${styles.giftsInner}`}>
          <div className={styles.headerCopy}>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Gifts" }]} />
            <h1 className="heading-1" data-reveal="up">
              {collection.title}
            </h1>
            <p className={styles.intro} data-reveal="up">
              {collection.description}
            </p>
          </div>
        </div>
      </section>
      <div className={styles.cutoff} data-surface-dark="" data-reveal="fade">
        <Icon name="gift" size={20} />
        {settings.giftCutoff} delivery in metro Australia.
      </div>
      <div className={`container ${styles.body} ${styles.giftsBody}`}>
        <h2 className="heading-2" data-reveal="up">
          Sets
        </h2>
        <div className={styles.sets}>
          {sets.map((p) => (
            <div key={p.handle} data-reveal="up">
              <GiftSetCard set={toGiftSet(p)} />
            </div>
          ))}
        </div>
        <h2 className={`heading-2 ${styles.sectionTitle}`} data-reveal="up">
          Single tins
        </h2>
        <div className={`${styles.grid} ${styles.gridStart}`}>
          {singles.map((p) => (
            <div key={p.handle} data-reveal="up">
              <ProductCard card={toCardData(p)} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
