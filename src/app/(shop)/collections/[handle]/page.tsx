import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toCardData, toGiftSet } from "@/components/commerce/card-data";
import { GiftSetCard } from "@/components/commerce/GiftSetCard";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Navigation";
import { LIVE } from "@/lib/config/launch";
import { brandTitle, SEO } from "@/lib/content/seo";
import { getCollection, getCollectionHandles, getSiteSettings } from "@/lib/data/catalog";
import styles from "@/components/commerce/Collection.module.css";

const HELD: Record<string, boolean> = { gifts: !LIVE.gifts, accessories: !LIVE.accessories };

export async function generateStaticParams() {
  return (await getCollectionHandles()).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  if (HELD[handle]) return {};
  const c = await getCollection(handle, { first: 1 });
  if (!c) return {};
  const canonical = { canonical: `/collections/${handle}` };
  return handle === "teas" ? { ...SEO.teas, alternates: canonical } : { title: brandTitle(c.title), description: c.description, alternates: canonical };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  if (HELD[handle]) notFound();
  const collection = await getCollection(handle, { first: 250 });
  if (!collection) notFound();

  if (handle === "gifts") return <GiftsTemplate />;

  return (
    <>
      <section className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.headerCopy}>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Teas" }]} />
            <h1 className="heading-1">{collection.title}</h1>
            <p className={styles.intro}>{collection.description}</p>
          </div>
        </div>
      </section>
      <div className={`container ${styles.body}`}>
        <div className={styles.grid}>
          {collection.products.map((p, i) => (
            <ProductCard key={p.handle} card={toCardData(p)} priority={i < 2} index={i} />
          ))}
        </div>
      </div>
      {handle === "teas" ? <HowWeChose /> : null}
    </>
  );
}

/** Copy v5.3 §3, as written. No hojicha line until the founders confirm it was part of the same selection. */
function HowWeChose() {
  return (
    <section id="how-we-chose-them" className={styles.chose}>
      <div className={`container ${styles.choseInner}`}>
        <h2 className="heading-2">How we chose them</h2>
        <div className={styles.choseCopy}>
          <p>Our co-founder Wichita tasted more than 40 tea samples from tea-producing regions across Japan, looking for teas worth drinking again.</p>
          <p>
            Every matcha was tasted first as usucha, whisked with water and served without milk or sweetener. If it didn&apos;t stand out there, it went no further. The ones that did were tried with cold water and in lattes with different milks, to see how each one held up and where it shone.
          </p>
          <p>
            We looked at aroma, colour, texture, sweetness, umami, bitterness, astringency and finish. Every sample was high quality, but fewer than half were memorable. We wanted character: a tea you&apos;d recognise and remember in the next cup.
          </p>
          <p>The final question was simple: would we want to drink it again tomorrow?</p>
        </div>
      </div>
    </section>
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
            <h1 className="heading-1">{collection.title}</h1>
            {collection.description ? <p className={styles.intro}>{collection.description}</p> : null}
          </div>
        </div>
      </section>
      {settings.giftCutoff ? (
        <div className={styles.cutoff}>
          <Icon name="gift" size={20} />
          {settings.giftCutoff}
        </div>
      ) : null}
      <div className={`container ${styles.body} ${styles.giftsBody}`}>
        <h2 className="heading-2">Sets</h2>
        <div className={styles.sets}>
          {sets.map((p) => (
            <GiftSetCard key={p.handle} set={toGiftSet(p)} />
          ))}
        </div>
        <h2 className={`heading-2 ${styles.sectionTitle}`}>Single tins</h2>
        <div className={styles.grid}>
          {singles.map((p) => (
            <ProductCard key={p.handle} card={toCardData(p)} />
          ))}
        </div>
      </div>
    </>
  );
}
