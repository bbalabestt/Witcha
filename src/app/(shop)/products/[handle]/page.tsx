import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toCardData } from "@/components/commerce/card-data";
import { ProductCard } from "@/components/commerce/ProductCard";
import { FaqAnswer } from "@/components/content/FaqAnswer";
import { RecipeCard } from "@/components/content/RecipeCard";
import { HojichaCup, SiftedPowder, UsuchaCup } from "@/components/motion/MatchaScenes";
import { AnchorNav } from "@/components/product/AnchorNav";
import { BuyBox } from "@/components/product/BuyBox";
import { DrawingGallery } from "@/components/product/DrawingGallery";
import { Gallery } from "@/components/product/Gallery";
import { ShippingPromise } from "@/components/product/ShippingPromise";
import { Accordion, Tabs } from "@/components/ui/Disclosure";
import { TinPlaceholder } from "@/components/ui/TinPlaceholder";
import { Breadcrumb } from "@/components/ui/Navigation";
import { env } from "@/lib/config/env";
import { LIVE } from "@/lib/config/launch";
import { TEAS_HREF } from "@/lib/config/site";
import { METHOD_NOTES, recipesFor } from "@/lib/content/recipes";
import { brandTitle } from "@/lib/content/seo";
import { getFaq, getProduct, getProducts, getSiteSettings } from "@/lib/data/catalog";
import type { Facts } from "@/lib/data/types";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return (await getProducts()).filter((p) => p.kind === "tea").map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) return {};
  const title = brandTitle(p.title);
  const description = p.seoDescription ?? p.description.slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: `/products/${handle}` },
    openGraph: { title, description, images: p.tin ? [{ url: p.tin.url, alt: p.tin.alt }] : [] },
  };
}

const FACT_ROWS: Array<[keyof Facts, string]> = [
  ["type", "Type"],
  ["origin", "Origin"],
  ["cultivar", "Cultivar"],
  ["harvest", "Harvest"],
  ["ingredients", "Ingredients"],
  ["netWeight", "Net weight"],
  ["packedIn", "Packed in"],
  ["caffeine", "Caffeine"],
];

/**
 * Order from the client: the first screen on a phone answers "what will it taste like?" and "why this one?", then
 * description, compare line, facts, how to make it, storage. Every section hides when its content is not confirmed.
 */
export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const [product, products, settings, allFaq] = await Promise.all([getProduct(handle), getProducts(), getSiteSettings(), getFaq()]);
  if (!product || product.kind !== "tea") notFound();

  const e = env();
  const recipes = recipesFor(product);
  const facts = product.facts;
  const hojicha = product.teaType === "hojicha";
  // The making answers talk about matcha, so they stay off the hojicha page.
  const faq = allFaq.filter((f) => f.onProduct && !(hojicha && f.category === "making"));
  const others = products.filter((p) => p.kind === "tea" && p.handle !== product.handle);
  const hasStorage = Boolean(product.storageNote || product.servingsNote);

  const tin = <TinPlaceholder key="tin" teaType={product.teaType} />;
  const slides = hojicha ? [tin, <HojichaCup key="cup" />] : [tin, <SiftedPowder key="powder" />, <UsuchaCup key="usucha" />];

  const anchors = [
    { id: "pdp-tea", label: "Description" },
    ...(recipes.length ? [{ id: "pdp-make", label: "How to make it" }] : []),
    ...(hasStorage ? [{ id: "pdp-store", label: "Storage" }] : []),
    ...(faq.length ? [{ id: "pdp-faq", label: "FAQ" }] : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(product, e.siteUrl) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "Teas", path: TEAS_HREF },
              { name: product.title, path: `/products/${product.handle}` },
            ],
            e.siteUrl,
          ),
        }}
      />
      <div className={`container ${styles.crumbs}`}>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Teas", href: TEAS_HREF }, { label: product.title }]} />
      </div>

      <section className={`container ${styles.top}`}>
        <div className={styles.buyColumn}>
          <BuyBox product={product} shopPay={e.shopPay} />
          {LIVE.shippingReturns ? <ShippingPromise settings={settings} /> : null}
        </div>
        <div className={styles.galleryColumn}>{product.gallery.length ? <Gallery items={product.gallery} title={product.title} /> : <DrawingGallery slides={slides} />}</div>
      </section>

      <AnchorNav items={anchors} />

      <section id="pdp-tea" className={`container ${styles.tea}`}>
        <div className={styles.copy}>
          <h2 className="heading-2">{product.descriptor}</h2>
          <p>{product.description}</p>
          {product.compare ? (
            <p>
              <Link href={`/products/${product.compare.handle}`} className="text-link">
                {product.compare.line}
              </Link>
            </p>
          ) : null}
        </div>
        {facts ? (
          <dl className={styles.facts}>
            {FACT_ROWS.flatMap(([key, label]) =>
              facts[key]
                ? [
                    <div key={key} className={styles.fact}>
                      <dt>{label}</dt>
                      <dd>{facts[key]}</dd>
                    </div>,
                  ]
                : [],
            )}
          </dl>
        ) : null}
      </section>

      {recipes.length ? (
        <section id="pdp-make" className={styles.make}>
          <div className={`container ${styles.makeInner}`}>
            <h2 className="heading-2">How to make it</h2>
            <Tabs label="Recipes" items={recipes.map((r) => ({ id: r.id, label: r.name, panel: <RecipeCard recipe={r} /> }))} />
            <dl className={styles.notes}>
              {METHOD_NOTES.map(([method, note]) => (
                <div key={method}>
                  <dt>{method}</dt>
                  <dd>{note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {hasStorage ? (
        <section id="pdp-store" className={`container ${styles.block}`}>
          <h2 className="heading-2">Storage and cups per tin</h2>
          {product.storageNote ? <p>{product.storageNote}</p> : null}
          {product.servingsNote ? <p>{product.servingsNote}</p> : null}
        </section>
      ) : null}

      {faq.length ? (
        <section id="pdp-faq" className={`container ${styles.block}`}>
          <h2 className="heading-2">FAQ</h2>
          <Accordion items={faq.map((f) => ({ id: f.id, title: f.question, content: <FaqAnswer text={f.answer} /> }))} />
        </section>
      ) : null}

      <section className={`container ${styles.block}`}>
        <h2 className="heading-2">Find your next cup</h2>
        <div className={styles.related}>
          {others.map((p, i) => (
            <ProductCard key={p.handle} card={toCardData(p)} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
