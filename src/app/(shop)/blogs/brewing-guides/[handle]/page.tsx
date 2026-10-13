import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/content/ArticleCard";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Navigation";
import { BLOG_HANDLE } from "@/lib/config/site";
import { getArticle, getArticles, getCollection } from "@/lib/data";
import { breadcrumbJsonLd, JsonLd, absoluteUrl } from "@/lib/seo/json-ld";
import { prepFor } from "@/lib/data/product";
import type { Article } from "@/lib/data/types";
import styles from "@/components/content/Content.module.css";

export async function generateStaticParams() {
  return (await getArticles(BLOG_HANDLE)).map((a) => ({ handle: a.handle }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/brewing-guides/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const a = await getArticle(BLOG_HANDLE, handle);
  if (!a) return { title: "Not found" };
  return {
    title: a.seo.title ?? a.title,
    description: a.seo.description ?? (a.excerpt || `${a.method} matcha guide · ${a.time}`),
    alternates: { canonical: `/blogs/${BLOG_HANDLE}/${a.handle}` },
    openGraph: { type: "article", title: a.title, url: `/blogs/${BLOG_HANDLE}/${a.handle}` },
  };
}

const METHOD_ICON: Record<Article["method"], IconName> = { Whisk: "whisk", Frother: "frother", Shaker: "shaker", Iced: "iced" };

export const instant = false;

export default function GuidePage({ params }: PageProps<"/blogs/brewing-guides/[handle]">) {
  return <Guide params={params} />;
}

async function Guide({ params }: Pick<PageProps<"/blogs/brewing-guides/[handle]">, "params">) {
  const { handle } = await params;
  const [article, all, matcha] = await Promise.all([getArticle(BLOG_HANDLE, handle), getArticles(BLOG_HANDLE), getCollection("matcha", { first: 4 })]);
  if (!article) notFound();
  const tea = matcha?.products.nodes.find((p) => p.prepMethods.length) ?? matcha?.products.nodes[0];
  const prep = tea ? prepFor(article.method, tea.prepMethods) : undefined;
  const more = all.filter((a) => a.handle !== handle).slice(0, 3);
  const crumbs = [{ label: "Home", href: "/" }, { label: "Brewing Guides", href: `/blogs/${BLOG_HANDLE}` }, { label: article.title }];

  return (
    <article className={styles.article}>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          datePublished: article.publishedAt,
          url: absoluteUrl(`/blogs/${BLOG_HANDLE}/${article.handle}`),
        }}
      />
      <Breadcrumb items={crumbs} />
      <header className={styles.articleHead}>
        <h1 className="heading-1">{article.title}</h1>
        <ul className={styles.meta}>
          <li>
            <Icon name={METHOD_ICON[article.method]} size={20} />
            {article.method}
          </li>
          {article.time ? (
            <li>
              <Icon name="clock" size={20} />
              {article.time}
            </li>
          ) : null}
          {article.serves && article.serves !== "—" ? (
            <li>
              <Icon name="cup" size={20} />
              Serves {article.serves}
            </li>
          ) : null}
        </ul>
      </header>

      {prep?.videoUrl ? (
        <video className={styles.video} src={prep.videoUrl} controls preload="none" playsInline aria-label={`Video: ${article.title}`} />
      ) : (
        <div className={styles.video} role="img" aria-label="Video placeholder: 60-second video">
          <span className={styles.play} aria-hidden="true">
            <Icon name="play" size={26} />
          </span>
          <span aria-hidden="true">60-second video · 16:9</span>
        </div>
      )}

      <div className={styles.recipe}>
        <div className={styles.col}>
          {prep ? (
            <>
              <h2 className="heading-3">You’ll need</h2>
              <ul className={styles.need}>
                <li>
                  <span>Matcha</span>
                  <b>{prep.grams}</b>
                </li>
                <li>
                  <span>Water</span>
                  <b>{prep.water}</b>
                </li>
                <li>
                  <span>Milk</span>
                  <b>{prep.milk}</b>
                </li>
              </ul>
            </>
          ) : null}
          <div className={styles.wrong}>
            <span className="label">If it goes wrong</span>
            <p>Clumps: sift first. Bitter: cooler water, 80°C not boiling. Dull colour: the tin may be open too long.</p>
          </div>
        </div>
        <div className={styles.col}>
          <h2 className="heading-3">Method</h2>
          {prep ? (
            <ol className={styles.steps}>
              {prep.steps.map((s, i) => (
                <li key={i}>
                  <span className={styles.stepNo} aria-hidden="true">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          ) : null}
          {article.contentHtml ? <div className={styles.body} dangerouslySetInnerHTML={{ __html: article.contentHtml }} /> : null}
        </div>
        {tea ? (
          <div className={styles.col}>
            <h2 className="heading-3">Tea used</h2>
            <div className={styles.teaUsed}>
              <ProductCard product={tea} />
            </div>
          </div>
        ) : null}
      </div>

      {more.length ? (
        <section className={styles.more} aria-labelledby="more-guides">
          <h2 id="more-guides" className="heading-2">
            More guides
          </h2>
          <ul className={styles.cardGrid}>
            {more.map((a) => (
              <li key={a.id}>
                <ArticleCard article={a} headingLevel="h3" showTime={false} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
