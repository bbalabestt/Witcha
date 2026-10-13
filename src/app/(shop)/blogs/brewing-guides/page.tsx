import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleCard } from "@/components/content/ArticleCard";
import { PageHeader } from "@/components/content/PageHeader";
import { Skeleton } from "@/components/ui/Frame";
import { BLOG_HANDLE } from "@/lib/config/site";
import { getArticles } from "@/lib/data";
import type { Article } from "@/lib/data/types";
import styles from "@/components/content/Content.module.css";

export const metadata: Metadata = {
  title: "Brewing Guides · A Little Magic, Made at Home",
  description: "Measured matcha recipes for whisk, frother, shaker and ice. Two grams and a little patience.",
  alternates: { canonical: `/blogs/${BLOG_HANDLE}` },
};

const METHODS: Array<"All" | Article["method"]> = ["All", "Whisk", "Frother", "Shaker", "Iced"];

export default function GuidesPage({ searchParams }: PageProps<"/blogs/brewing-guides">) {
  return (
    <>
      <PageHeader
        eyebrow="Brewing Guides"
        title="A Little Magic, Made at Home"
        intro={<p>Measured recipes for whisk, frother, shaker and ice. No special skills, just two grams and a little patience.</p>}
      />
      <section className={styles.section} aria-label="Guides">
        <Suspense fallback={<GuidesSkeleton />}>
          <Guides searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

function GuidesSkeleton() {
  return (
    <ul className={styles.cardGrid} aria-busy="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className={styles.articleCard}>
          <Skeleton ratio="3:2" />
          <Skeleton width="40%" height={16} />
          <Skeleton width="80%" height={30} />
        </li>
      ))}
    </ul>
  );
}

async function Guides({ searchParams }: Pick<PageProps<"/blogs/brewing-guides">, "searchParams">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.method) ? sp.method[0] : sp.method;
  const method = METHODS.find((m) => m.toLowerCase() === (raw ?? "").toLowerCase()) ?? "All";
  const all = await getArticles(BLOG_HANDLE);
  const list = method === "All" ? all : all.filter((a) => a.method === method);
  return (
    <>
      <nav aria-label="Filter guides by method">
        <ul className={styles.chips}>
          {METHODS.map((m) => (
            <li key={m}>
              <Link href={m === "All" ? `/blogs/${BLOG_HANDLE}` : `/blogs/${BLOG_HANDLE}?method=${m}`} className={styles.chip} aria-current={m === method ? "page" : undefined} scroll={false}>
                {m}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {list.length ? (
        <ul className={styles.cardGrid}>
          {list.map((a) => (
            <li key={a.id}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No {method.toLowerCase()} guides yet. <Link href={`/blogs/${BLOG_HANDLE}`}>See all guides</Link></p>
      )}
    </>
  );
}
