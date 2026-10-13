import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CollectionHeader, collectionVariant } from "@/components/commerce/CollectionHeader";
import { FilterDrawer } from "@/components/commerce/FilterDrawer";
import { InPreparationCard, ProductCard } from "@/components/commerce/ProductCard";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { SortSelect } from "@/components/commerce/SortSelect";
import { Icon } from "@/components/ui/Icon";
import { getCollection, getCollectionHandles, getSiteSettings } from "@/lib/data";
import { collectionHref, filterLabel, parseFilters, parseSort, serializeFilter, showFilters } from "@/lib/data/collection-params";
import type { CollectionPage as CollectionData } from "@/lib/data/types";
import { CollectionSkeleton } from "./skeleton";
import styles from "@/components/commerce/Collection.module.css";

const PAGE_SIZE = 12;

export async function generateStaticParams() {
  const handles = await getCollectionHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const page = await getCollection(handle, { first: 1 });
  if (!page) return { title: "Not found" };
  const c = page.collection;
  const title = c.seo.title ?? (collectionVariant(handle) === "taste" ? "Which Matcha Today? Shop Matcha" : c.title);
  return {
    title,
    description: c.seo.description ?? c.description,
    alternates: { canonical: `/collections/${handle}` },
    openGraph: { title, description: c.seo.description ?? c.description, url: `/collections/${handle}` },
  };
}

function nounFor(handle: string): string {
  if (handle === "accessories") return "tools";
  if (handle === "gifts") return "gifts";
  return "teas";
}

/** Header prerenders per collection; only the sort/filter-dependent results stream (D-51). */
export const instant = false;

export default function CollectionPage({ params, searchParams }: PageProps<"/collections/[handle]">) {
  return <CollectionBody params={params} searchParams={searchParams} />;
}

async function CollectionBody({ params, searchParams }: Pick<PageProps<"/collections/[handle]">, "params" | "searchParams">) {
  const { handle } = await params;
  const [base, settings] = await Promise.all([getCollection(handle, { first: PAGE_SIZE }), getSiteSettings()]);
  if (!base) notFound();

  const variant = collectionVariant(handle);
  return (
    <>
      <CollectionHeader collection={base.collection} teas={variant === "taste" ? base.products.nodes : []} giftCutoff={settings.giftCutoff} />
      {variant === "gifts" ? (
        <GiftResults handle={handle} />
      ) : (
        <Suspense fallback={<CollectionSkeleton />}>
          <Results handle={handle} base={base} searchParams={searchParams} />
        </Suspense>
      )}
    </>
  );
}

async function Results({ handle, base, searchParams }: { handle: string; base: CollectionData; searchParams: PageProps<"/collections/[handle]">["searchParams"] }) {
  const sp = await searchParams;
  const sort = parseSort(sp.sort);
  const filters = parseFilters(sp.filter);
  const isDefault = sort === "featured" && filters.length === 0;
  const page = isDefault ? base : await getCollection(handle, { sort, filters, first: PAGE_SIZE });
  if (!page) notFound();

  const noun = nounFor(handle);
  const baseTotal = base.products.totalCount ?? (base.products.pageInfo.hasNextPage ? Number.POSITIVE_INFINITY : base.products.nodes.length);
  const filterable = showFilters(baseTotal, base.products.nodes.length) && base.filters.length > 0;
  const { nodes, pageInfo, totalCount } = page.products;
  const countText = totalCount !== null ? `${totalCount} ${totalCount === 1 ? noun.replace(/s$/, "") : noun}` : `${nodes.length}${pageInfo.hasNextPage ? "+" : ""} ${noun}`;
  const filterKeys = filters.map(serializeFilter);

  return (
    <section className={styles.results} aria-label="Products">
      <div className={styles.toolbar}>
        <div className={styles.toolbarStart}>
          {filterable ? <FilterDrawer handle={handle} groups={base.filters} active={filters} sort={sort} /> : null}
          <p className={styles.count} aria-live="polite">
            {countText}
          </p>
        </div>
        <SortSelect value={sort} />
      </div>

      {filters.length ? (
        <ul className={styles.active} aria-label="Active filters">
          {filters.map((f) => (
            <li key={serializeFilter(f)}>
              <Link
                href={collectionHref(handle, { sort, filters: filters.filter((x) => serializeFilter(x) !== serializeFilter(f)) })}
                className={styles.activeChip}
                aria-label={`Remove filter: ${filterLabel(f)}`}
                scroll={false}
              >
                {filterLabel(f)}
                <Icon name="close" size={16} />
              </Link>
            </li>
          ))}
          <li>
            <Link href={collectionHref(handle, { sort })} className={styles.activeChip} scroll={false}>
              Clear filters
            </Link>
          </li>
        </ul>
      ) : null}

      {nodes.length === 0 ? (
        <div className={styles.empty}>
          <p className="heading-3">No {noun} match.</p>
          <Link href={collectionHref(handle, { sort })}>Clear filters</Link>
        </div>
      ) : (
        <ProductGrid
          key={`${sort}|${filterKeys.join(",")}`}
          handle={handle}
          sort={sort}
          filters={filterKeys}
          initial={nodes}
          pageInfo={pageInfo}
          total={totalCount}
          noun={noun}
          trailing={handle === "matcha" && filters.length === 0 && (totalCount ?? nodes.length) < 3 ? <InPreparationCard /> : undefined}
        />
      )}
    </section>
  );
}

/** Gifts: sets first, then single tins (prototype). Small collection, no paging or sort. */
async function GiftResults({ handle }: { handle: string }) {
  const page = await getCollection(handle, { first: 50 });
  const products = page?.products.nodes ?? [];
  const sets = products.filter((p) => p.kind === "gift");
  const tins = products.filter((p) => p.kind !== "gift");
  return (
    <section className={styles.results} aria-label="Gifts">
      {sets.length ? (
        <>
          <h2 className={styles.sectionTitle}>Sets</h2>
          <ul className={styles.grid}>
            {sets.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} priority={i === 0} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {tins.length ? (
        <>
          <h2 className={styles.sectionTitle}>Single tins</h2>
          <ul className={styles.grid}>
            {tins.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
