import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { toCardData, toUpsellItems } from "@/components/commerce/card-data";
import { UpsellRail } from "@/components/commerce/CartParts";
import { ProductCard } from "@/components/commerce/ProductCard";
import { AnchorNav } from "@/components/product/AnchorNav";
import { BuyBox, BuyBoxFromUrl } from "@/components/product/BuyBox";
import { Gallery } from "@/components/product/Gallery";
import { PrepMethodTabs } from "@/components/product/PrepMethodTabs";
import { ShippingPromise, ShippingSummary } from "@/components/product/ShippingPromise";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Disclosure";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Navigation";
import { env } from "@/lib/config/env";
import { getFaq, getGuides, getPrepMethods, getProduct, getProducts, getSiteSettings } from "@/lib/data/catalog";
import { productJsonLd } from "@/lib/seo";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return (await getProducts()).filter((p) => p.kind === "tea").map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description.slice(0, 160),
    alternates: { canonical: `/products/${handle}` },
    openGraph: { title: p.title, description: p.description.slice(0, 160), images: p.tin ? [{ url: p.tin.url, alt: p.tin.alt }] : [] },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const [product, products, settings, methods, faq, guides] = await Promise.all([
    getProduct(handle),
    getProducts(),
    getSiteSettings(),
    getPrepMethods(),
    getFaq(),
    getGuides(),
  ]);
  if (!product || product.kind !== "tea") notFound();

  const e = env();
  const others = products.filter((p) => p.kind === "tea" && p.handle !== product.handle);
  const otherPositions = [...new Set(others.flatMap((p) => (p.taste ? [p.taste.position] : [])))];
  const troubleshoot = guides.find((g) => g.troubleshooting);
  // V4 opens the second question ("How do I store it?") by default.
  const pdpFaq = faq.filter((f) => f.onProduct);
  const keeper = product.character;
  const word = product.taste?.word ?? "Tea";
  const buyBoxProps = {
    product,
    lowStockThreshold: settings.lowStockThreshold,
    otherPositions,
    shippingPromise: <ShippingPromise settings={settings} />,
    shopPay: e.shopPay,
  };

  const anchors = [
    { id: "pdp-tea", label: "The tea" },
    { id: "pdp-make", label: "Make it" },
    { id: "pdp-store", label: "Storage" },
    ...(keeper ? [{ id: "pdp-char", label: `Meet ${keeper.name}` }] : []),
    { id: "pdp-reviews", label: "Reviews" },
    { id: "pdp-faq", label: "FAQ" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(product, e.siteUrl) }} />
      <div className={`container ${styles.crumbs}`}>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop Matcha", href: "/collections/matcha" }, { label: product.title }]} />
      </div>

      <section className={`container ${styles.top}`}>
        <Gallery items={product.gallery} title={product.title} />
        <div className={styles.buyColumn}>
          <Suspense fallback={<BuyBox {...buyBoxProps} />}>
            <BuyBoxFromUrl {...buyBoxProps} />
          </Suspense>
        </div>
      </section>

      <AnchorNav items={anchors} />

      <section id="pdp-tea" className={`container ${styles.tea}`}>
        <div className={styles.teaCopy}>
          <span className="label" data-reveal="up">
            The tea
          </span>
          <h2 className="heading-2" data-reveal="up">
            {word}, and honest about it
          </h2>
          <p data-reveal="up">{product.description}</p>
        </div>
        {product.facts ? (
          <dl className={styles.facts} data-reveal="up">
            <dt>Origin</dt>
            <dd>{product.facts.origin}</dd>
            <dt>Cultivar</dt>
            <dd>{product.facts.cultivar}</dd>
            <dt>Harvest</dt>
            <dd>{product.facts.harvest}</dd>
            <dt>Grade</dt>
            <dd>{product.facts.grade}</dd>
            <dt>Net weight</dt>
            <dd>{product.facts.netWeight}</dd>
            <dt>Pack date</dt>
            <dd>{product.facts.packDate}</dd>
            <dt>Ingredients</dt>
            <dd>{product.facts.ingredients}</dd>
          </dl>
        ) : null}
        <div className={styles.factShot} role="img" aria-label="Image placeholder: powder colour fact shot, 4:5" data-reveal="up">
          Powder colour · fact shot · 4:5
        </div>
      </section>

      <section id="pdp-make" className={styles.make}>
        <div className={`container ${styles.makeInner}`}>
          <div className={styles.stack} data-reveal="up">
            <span className="label">Make it</span>
            <h2 className="heading-2">Four ways, all measured</h2>
          </div>
          <PrepMethodTabs methods={methods} troubleshootHref={troubleshoot ? `/blogs/brewing-guides/${troubleshoot.handle}` : null} />
        </div>
      </section>

      <section id="pdp-store" className={`container ${styles.store}`}>
        <h2 className="heading-2" data-reveal="up">
          Storage and freshness
        </h2>
        <div className={styles.storeGrid}>
          <p data-reveal="up">
            <Icon name="cool" size={28} />
            <span>
              <b>Cool.</b> Away from the stove and sunlight.
            </span>
          </p>
          <p data-reveal="up" data-delay="80">
            <Icon name="dry" size={28} />
            <span>
              <b>Dry.</b> Use a dry scoop, every time.
            </span>
          </p>
          <p data-reveal="up" data-delay="160">
            <Icon name="sealed" size={28} />
            <span>
              <b>Closed tight.</b> Best within {settings.openedShelfLife}.
            </span>
          </p>
        </div>
        {product.storageNote ? (
          <p className="body-small" data-reveal="up">
            {product.storageNote}
          </p>
        ) : null}
      </section>

      {keeper ? (
        <section id="pdp-char" className={styles.character}>
          <div className={`container ${styles.characterInner}`}>
            <div className={styles.characterArt} data-reveal="rise">
              {keeper.art ? <Image src={keeper.art.url} alt={keeper.art.alt} fill sizes="300px" className={styles.contain} /> : null}
            </div>
            <div className={styles.stack}>
              <span className="label" data-reveal="up">
                Keeper of the {product.taste ? `${product.taste.tier} · ${product.taste.word}` : ""} tea
              </span>
              <h2 className="heading-2" data-reveal="up">
                Meet {keeper.name}
              </h2>
              <p data-reveal="up">
                {keeper.story ?? "[Two-sentence character story, from the character metaobject.]"}{" "}
                {keeper.accessory ? `Always with ${keeper.accessory}.` : "[Accessory: one object.]"}
              </p>
              <Link href="/pages/academy" className="label-link" data-reveal="up">
                Visit the Academy
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section id="pdp-reviews" className={`container ${styles.reviews}`}>
        <h2 className="heading-2" data-reveal="up">
          Reviews
        </h2>
        {/* Zero state until a reviews provider is chosen: no stars, no counts (V2.1 4.7). */}
        <div className={styles.zero} data-reveal="up">
          <div>
            <p className="heading-3">No reviews yet.</p>
            <p>Be the first to share how you made it.</p>
          </div>
          <Button href="/pages/contact" variant="secondary" size="md">
            Write a review
          </Button>
        </div>
      </section>

      <section id="pdp-faq" className={`container ${styles.faq}`}>
        <h2 className="heading-2" data-reveal="up">
          Questions
        </h2>
        <Accordion
          defaultOpen={pdpFaq[1] ? [pdpFaq[1].id] : []}
          items={pdpFaq.map((f) => ({ id: f.id, title: f.question, content: <p>{f.answer}</p> }))}
        />
      </section>

      <ShippingSummary settings={settings} />

      <section className={`container ${styles.related}`}>
        <div className={styles.stack}>
          <h2 className="heading-2" data-reveal="up">
            You might also like
          </h2>
          <div className={styles.relatedGrid}>
            {others.slice(0, 3).map((p) => (
              <div key={p.handle} data-reveal="up">
                <ProductCard card={toCardData(p)} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.stack}>
          <h2 className="heading-2" data-reveal="up">
            Pair with
          </h2>
          <UpsellRail items={toUpsellItems(products)} showLabel={false} />
        </div>
      </section>
    </>
  );
}
