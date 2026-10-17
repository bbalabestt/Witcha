import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toCardData } from "@/components/commerce/card-data";
import { ProductCard } from "@/components/commerce/ProductCard";
import { GuideCard, METHOD_LABEL } from "@/components/content/GuideCard";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Navigation";
import { getGuide, getGuides, getPrepMethods, getProducts } from "@/lib/data/catalog";
import { sanitizeHtml } from "@/lib/html";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return (await getGuides()).map((g) => ({ handle: g.handle }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/brewing-guides/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const g = await getGuide(handle);
  return g ? { title: g.title, alternates: { canonical: `/blogs/brewing-guides/${handle}` } } : {};
}

export default async function GuidePage({ params }: PageProps<"/blogs/brewing-guides/[handle]">) {
  const { handle } = await params;
  const [guide, guides, methods, products] = await Promise.all([getGuide(handle), getGuides(), getPrepMethods(), getProducts()]);
  if (!guide) notFound();
  // "You'll need" and the method steps come from the tea's preparation data (V2.1 6.3).
  const prep = methods.find((m) => m.id === guide.method) ?? methods[0];
  const tea = products.find((p) => p.kind === "tea");
  const related = guides.filter((g) => g.handle !== guide.handle).slice(0, 3);

  return (
    <article className={`container ${styles.article}`}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brewing Guides", href: "/blogs/brewing-guides" }, { label: guide.title }]} />
      <header className={styles.head}>
        <h1 className="heading-1" data-reveal="up">
          {guide.title}
        </h1>
        <div className={styles.meta} data-reveal="up">
          <span>
            <Icon name="whisk" size={20} />
            {METHOD_LABEL[guide.method]}
          </span>
          <span>
            <Icon name="clock" size={20} />
            {guide.time}
          </span>
          <span>
            <Icon name="cup" size={20} />
            Serves {guide.serves}
          </span>
        </div>
      </header>

      <div className={styles.video} style={{ backgroundImage: `url('${guide.image.url}')` }} role="img" aria-label={`${guide.title}: 60-second video, coming soon`} data-reveal="up">
        <span className={styles.play}>
          <Icon name="play" size={26} />
        </span>
        <span className={styles.videoLabel}>60-second video · 16:9</span>
      </div>

      <div className={styles.columns}>
        {prep ? (
          <>
            <div className={styles.column}>
              <h2 className="heading-3" data-reveal="up">
                You’ll need
              </h2>
              <ul className={styles.needs} data-reveal="up">
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
              <div className={styles.fix} data-reveal="up">
                <span className="label">If it goes wrong</span>
                <p>Clumps: sift first. Bitter: cooler water, 80°C not boiling. Dull colour: the tin may be open too long.</p>
              </div>
            </div>
            <div className={styles.column}>
              <h2 className="heading-3" data-reveal="up">
                Method
              </h2>
              <ol className={styles.steps}>
                {prep.steps.map((s, i) => (
                  <li key={i} data-reveal="up">
                    <span className={styles.n}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : null}
        {tea ? (
          <div className={styles.column}>
            <h2 className="heading-3" data-reveal="up">
              Tea used
            </h2>
            <div className={styles.tea} data-reveal="up">
              <ProductCard card={toCardData(tea)} />
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.body}>
        <span className="label">From the article</span>
        {guide.contentHtml ? (
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.contentHtml) }} />
        ) : (
          <p>[Longer article text from Shopify (article.contentHtml) follows here, set in the body style at 60–70 characters a line.]</p>
        )}
      </div>

      <section className={styles.more}>
        <h2 className="heading-2" data-reveal="up">
          More guides
        </h2>
        <div className={styles.moreGrid}>
          {related.map((g) => (
            <GuideCard key={g.handle} guide={g} showTime={false} />
          ))}
        </div>
      </section>
    </article>
  );
}
