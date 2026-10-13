import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/commerce/ProductCard";
import { QuickAdd } from "@/components/commerce/QuickAdd";
import { merchandiseFor } from "@/lib/cart/optimistic";
import { defaultVariant } from "@/lib/data/product";
import { AcademyWheel } from "@/components/home/AcademyWheel";
import { HomeHero } from "@/components/home/HomeHero";
import { Manifesto } from "@/components/home/Manifesto";
import { Marquee } from "@/components/home/Marquee";
import { MarqueeDriver } from "@/components/home/MarqueeDriver";
import { TasteDial } from "@/components/home/TasteDial";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/Frame";
import { Icon, type IconName } from "@/components/ui/Icon";
import { BLOG_HANDLE, SITE } from "@/lib/config/site";
import { getCollection, getSiteSettings } from "@/lib/data";
import { formatMoney } from "@/lib/data/money";
import type { Product } from "@/lib/data/types";
import styles from "@/components/home/Home.module.css";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} · ${SITE.tagline}` },
  description: "Japanese matcha, chosen for taste and placed on one scale from bright to deep. Which Matcha Today?",
  alternates: { canonical: "/" },
};

const MANIFESTO =
  "Every tin is tasted by Pop before it reaches the Academy shelf. We look for sweetness, depth and a colour that tells the truth, then place each tea on one simple scale from bright to deep, so choosing feels like a little magic, not homework.";

const METHODS: Array<{ n: string; icon: IconName; name: string; line: string; method: string }> = [
  { n: "01", icon: "whisk", name: "Whisk", line: "2 g · 70 ml at 80°C · 2 min", method: "Whisk" },
  { n: "02", icon: "frother", name: "Frother", line: "2 g · 30 ml · 180 ml milk", method: "Frother" },
  { n: "03", icon: "shaker", name: "Shaker", line: "2 g · 60 ml cold · 20 s", method: "Shaker" },
  { n: "04", icon: "iced", name: "Iced latte", line: "2 g · 40 ml · over ice", method: "Iced" },
];

function pickTea(teas: Product[], target: number): Product | undefined {
  return [...teas].sort((a, b) => Math.abs((a.taste?.position ?? 3) - target) - Math.abs((b.taste?.position ?? 3) - target))[0];
}

export default async function HomePage() {
  const [settings, matcha, gifts] = await Promise.all([getSiteSettings(), getCollection("matcha", { first: 12 }), getCollection("gifts", { first: 12 })]);
  const teas = (matcha?.products.nodes ?? []).filter((p) => p.taste);
  const sets = (gifts?.products.nodes ?? []).filter((p) => p.kind === "gift");
  const bright = pickTea(teas, 2);
  const deep = pickTea(teas, 4);
  const set = sets[0];
  const facts = deep?.facts;
  const factStrip = [facts?.originRegion, facts?.cultivar?.replace(/^100%\s*/, ""), facts?.harvest, "2 g a cup", "80°C", `Free shipping over ${formatMoney(settings.freeShippingThreshold)}`, "Gift notes in the cart"]
    .filter((x): x is string => Boolean(x))
    .map((x) => x.toUpperCase());

  return (
    <>
      <HomeHero />
      <Marquee tone="deep" items={["Matcha, With Taste.", "Which Matcha Today?", "Bright to deep", "Whisked, frothed, shaken, iced"]} />
      <Marquee tone="soft" reverse items={factStrip} />
      <MarqueeDriver />

      <TasteDial
        bright={bright ? <div className={styles.dialCard}><ProductCard product={bright} /></div> : null}
        deep={deep ? <div className={styles.dialCard}><ProductCard product={deep} /></div> : null}
        balanced={
          set ? (
            <div className={styles.dialSet}>
              <ImagePlaceholder label="Both tins · discovery set" shape="arch" showRatio={false} />
              <span className="label">Right in the middle</span>
              <p className="heading-3">Can’t decide? Try both.</p>
              <p>
                The {set.title} sits bright and deep side by side · {formatMoney(set.priceRange.min)}
              </p>
              {defaultVariant(set)?.availableForSale ? <QuickAdd merchandise={merchandiseFor(set, defaultVariant(set)!)} /> : null}
            </div>
          ) : null
        }
      />

      <AcademyWheel products={[...teas, ...sets]} />

      <Manifesto
        text={MANIFESTO}
        chips={[facts?.originRegion && `Origin · ${facts.originRegion}`, facts?.cultivar && `Cultivar · ${facts.cultivar}`, facts?.harvest && `Harvest · ${facts.harvest.replace(/ harvest$/i, "")}`].filter((x): x is string => Boolean(x))}
      />

      <section className={styles.methodsBand} aria-labelledby="methods-title">
        <div className={styles.inner}>
          <div className={styles.methodsHead}>
            <h2 id="methods-title" className={styles.sectionDisplay} data-reveal="left">
              A little magic, <i>made at home</i>
            </h2>
            <Link href={`/blogs/${BLOG_HANDLE}`} className={styles.textCta} data-reveal="right">
              All brewing guides
            </Link>
          </div>
          <ul className={styles.methods}>
            {METHODS.map((m, i) => (
              <li key={m.n} data-reveal={i < 2 ? "left" : "right"}>
                <Link href={`/blogs/${BLOG_HANDLE}?method=${m.method}`} className={styles.methodCard}>
                  <span className={styles.methodNo} aria-hidden="true">
                    {m.n}
                  </span>
                  <Icon name={m.icon} size={36} />
                  <span className={styles.methodName}>{m.name}</span>
                  <span className={styles.small}>{m.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={[styles.inner, styles.academy].join(" ")} aria-labelledby="academy-title">
        <span className="label" data-reveal="up">
          Witcha Academy
        </span>
        <div className={styles.academyArch} data-reveal="arch-open" aria-hidden="true">
          Character art · pending artist
        </div>
        <h2 id="academy-title" className={styles.sectionDisplay} data-reveal="right">
          Every tea has a keeper.
        </h2>
        <p className={styles.academyCopy} data-reveal="up">
          At the Academy, the deep tea is kept by one cat and the bright tea by another, each with a single treasured object and a favourite corner of the grounds. There is a conservatory where the plants winter, a library window where recipes collect in the margins, a garden bridge for slow morning cups and a tea room where every tin is tasted before it is shelved. The words wrap around the window on purpose: the world is soft and painted, but the shop stays clear, so you always know what is in the tin, what it tastes like and when it will reach your door.{" "}
          <span className={styles.pending}>Copy pending Brand Bible</span>
        </p>
        <Button href="/pages/academy" variant="secondary" className={styles.academyCta}>
          Meet the class
        </Button>
      </section>

      <section className={[styles.inner, styles.giftsWrap].join(" ")} aria-labelledby="gifts-title">
        <div className={styles.giftsPanel}>
          <div className={styles.giftsCopy}>
            <span className="label" data-reveal="left">
              Gifts
            </span>
            <h2 id="gifts-title" className={styles.sectionDisplay} data-reveal="left">
              A tin to give, <i>a note in your words.</i>
            </h2>
            <p data-reveal="left">Tick “This is a gift” in your cart. Up to 150 characters, and no prices on the packing slip.</p>
            <p className={styles.giftCutoff} data-reveal="left">
              <Icon name="gift" size={22} />
              {settings.giftCutoff}
            </p>
            <Button href="/collections/gifts" className={styles.giftsCta}>
              Shop gifts
            </Button>
          </div>
          <div className={styles.giftsArt} data-reveal="right">
            <ImagePlaceholder label="Gift set · tins + linen · 4:5" ratio="4:5" shape="rect" showRatio={false} className={styles.giftsArch} />
          </div>
        </div>
      </section>
    </>
  );
}
