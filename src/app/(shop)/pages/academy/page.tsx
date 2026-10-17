import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCharacters, getProducts } from "@/lib/data/catalog";
import styles from "../pages.module.css";
import content from "../../content.module.css";

export const metadata: Metadata = {
  title: "Witcha Academy",
  description: "A painted school where every tea has a keeper, and every keeper is a cat.",
  alternates: { canonical: "/pages/academy" },
};

const GROUNDS = [
  ["The conservatory", "Where the tea plants winter."],
  ["The library window", "Recipes, written in the margins."],
  ["The garden bridge", "A morning walk with a cup."],
  ["The tea room", "Where every tin is tasted."],
] as const;

export default async function AcademyPage() {
  const [characters, products] = await Promise.all([getCharacters(), getProducts()]);
  const titleFor = (handle: string | null) => products.find((p) => p.handle === handle)?.title;
  return (
    <>
      <section className={content.band}>
        <div className={`container ${content.bandInner} ${content.bandCenter}`}>
          <span className="label" data-reveal="up">
            The world
          </span>
          <h1 className={styles.display} data-reveal="up">
            Witcha Academy
          </h1>
          <p className={content.lead} data-reveal="up">
            [Two-sentence world intro from the Brand Bible.] A painted school where every tea has a keeper, and every keeper is a cat.{" "}
            <span className="pending-tag">Pending</span>
          </p>
        </div>
        <div className={`container ${styles.garden}`} data-reveal="up">
          <Image
            src="/art/heroes-01-academy-garden-desktop.jpg"
            alt="Five painted cats gather around matcha and hojicha in a blue garden conservatory."
            width={1800}
            height={900}
            sizes="(max-width: 1440px) 92vw, 1312px"
            priority
          />
        </div>
      </section>

      <section className={`container ${content.section}`}>
        <h2 className="heading-2" data-reveal="up">
          Meet the class
        </h2>
        <div className={styles.class}>
          {characters.map((c, i) => (
            <div key={c.handle} className={styles.keeper}>
              <div className={styles.keeperArt} data-concept={c.concept || undefined} data-reveal="rise" data-delay={String(i * 100)}>
                {c.art ? <Image src={c.art.url} alt={c.art.alt} fill sizes="(max-width: 699px) 92vw, 260px" className={styles.contain} /> : null}
              </div>
              <span className="label">{c.concept ? `${c.role} · concept` : c.role}</span>
              <span className={content.title3}>{c.name}</span>
              {c.productHandle && titleFor(c.productHandle) ? (
                <Link href={`/products/${c.productHandle}`} className="text-link">
                  {titleFor(c.productHandle)}
                </Link>
              ) : (
                <span>Tea to be announced</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={content.bandSoft}>
        <div className={`container ${content.section}`}>
          <h2 className="heading-2" data-reveal="up">
            Around the grounds
          </h2>
          <div className={styles.grounds}>
            {GROUNDS.map(([title, line], i) => (
              <div key={title} className={styles.ground} data-reveal="up" data-delay={String(i * 80)}>
                <span className={content.title3}>{title}</span>
                <span className="body-small">{line}</span>
              </div>
            ))}
          </div>
          <div>
            <Button href="/collections/matcha" size="xl">
              Shop the matcha
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
