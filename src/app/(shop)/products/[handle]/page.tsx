import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { UpsellRail } from "@/components/cart/UpsellRail";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ShippingPromise } from "@/components/commerce/ShippingPromise";
import type { TasteMarker } from "@/components/commerce/TasteScale";
import { BuyBox } from "@/components/pdp/BuyBox";
import { Gallery } from "@/components/pdp/Gallery";
import { PdpProvider, PdpProviderFromUrl } from "@/components/pdp/PdpContext";
import { AnchorNav, CharacterPanel, MakeIt, Questions, Reviews, Storage, TheTea } from "@/components/pdp/PdpSections";
import { StickyBuyBar } from "@/components/pdp/StickyBuyBar";
import { Breadcrumb } from "@/components/ui/Navigation";
import { getServerEnv } from "@/lib/config/env";
import { getCollection, getFaqEntries, getPairings, getProduct, getProductHandles, getRelatedProducts, getSiteSettings } from "@/lib/data";
import { productJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { tasteText } from "@/lib/data/product";
import type { Product } from "@/lib/data/types";
import { getReviewsProvider } from "@/lib/providers";
import { PdpSkeleton } from "./skeleton";
import styles from "@/components/pdp/Pdp.module.css";

export async function generateStaticParams() {
  return (await getProductHandles()).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) return { title: "Not found" };
  const title = p.seo.title ?? p.title;
  const description = p.seo.description ?? p.description.slice(0, 160);
  const image = p.media.find((m) => m.kind === "image");
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.handle}` },
    openGraph: {
      title,
      description,
      url: `/products/${p.handle}`,
      images: image?.kind === "image" ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/products/[handle]">) {
  return (
    <Suspense fallback={<PdpSkeleton />}>
      <ProductBody params={params} />
    </Suspense>
  );
}

function crumbsFor(p: Product) {
  const parent = p.kind === "gift" ? { label: "Gifts", href: "/collections/gifts" } : p.kind === "accessory" ? { label: "Accessories", href: "/collections/accessories" } : { label: "Shop Matcha", href: "/collections/matcha" };
  return [{ label: "Home", href: "/" }, parent, { label: p.title }];
}

async function ProductBody({ params }: Pick<PageProps<"/products/[handle]">, "params">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const [settings, faq, related, pairings, matcha, reviews] = await Promise.all([
    getSiteSettings(),
    getFaqEntries(),
    getRelatedProducts(handle, 3),
    getPairings([handle], 2),
    product.kind === "tea" ? getCollection("matcha", { first: 12 }) : Promise.resolve(null),
    getReviewsProvider().getSummary(handle),
  ]);
  const compareMarkers: TasteMarker[] = (matcha?.products.nodes ?? [])
    .filter((t) => t.handle !== handle && t.taste)
    .map((t) => ({ position: t.taste!.position, label: `${t.title}, ${tasteText(t.taste!)}` }));
  const crumbs = crumbsFor(product);
  const shopPay = getServerEnv().NEXT_PUBLIC_FEATURE_SHOP_PAY;

  const hero = (
    <>
      <section className={styles.hero}>
        <Gallery />
        <BuyBox lowStockThreshold={settings.lowStockThreshold} compareMarkers={compareMarkers} shippingPromise={<ShippingPromise settings={settings} />} shopPay={shopPay} />
      </section>
      <StickyBuyBar />
    </>
  );

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumb items={crumbs} className={styles.crumbs} />
      <Suspense
        fallback={
          <PdpProvider product={product} initialVariant={null}>
            {hero}
          </PdpProvider>
        }
      >
        <PdpProviderFromUrl product={product}>{hero}</PdpProviderFromUrl>
      </Suspense>

      <AnchorNav product={product} />
      {product.kind === "tea" ? <TheTea product={product} /> : null}
      <MakeIt methods={product.prepMethods} />
      {product.kind === "tea" ? <Storage note={product.storageNote} /> : null}
      <CharacterPanel product={product} />
      <Reviews summary={reviews} productTitle={product.title} />
      <Questions faq={faq} />
      <ShippingPromise settings={settings} variant="trio" />

      <section className={[styles.section, styles.moreGrid].join(" ")}>
        {related.length ? (
          <div className={styles.more}>
            <h2 className="heading-2">You might also like</h2>
            <ul className={styles.relatedGrid}>
              {related.map((r) => (
                <li key={r.id}>
                  <ProductCard product={r} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {pairings.length ? (
          <div className={styles.more}>
            <h2 className="heading-2">Pair with</h2>
            <UpsellRail products={pairings} title="Pair with" size="roomy" showTitle={false} />
          </div>
        ) : null}
      </section>
    </>
  );
}
