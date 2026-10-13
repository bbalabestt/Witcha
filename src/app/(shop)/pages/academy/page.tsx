import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Pending } from "@/components/content/PageHeader";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/Frame";
import { MediaFrame } from "@/components/ui/MediaThumb";
import { getCollection } from "@/lib/data";
import styles from "@/components/content/Content.module.css";

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
  const matcha = await getCollection("matcha", { first: 12 });
  // Keepers come from the teas' character metaobjects; deepest tea first, as in the prototype.
  const keepers = (matcha?.products.nodes ?? []).filter((t) => t.taste).sort((a, b) => b.taste!.position - a.taste!.position);

  return (
    <>
      <PageHeader
        eyebrow="The world"
        title="Witcha Academy"
        align="center"
        intro={
          <p>
            [Two-sentence world intro from the Brand Bible.] A painted school where every tea has a keeper, and every keeper is a cat. <Pending />
          </p>
        }
      />
      <section className={styles.section} aria-labelledby="class-title">
        <h2 id="class-title" className="heading-2">
          Meet the class
        </h2>
        <ul className={styles.archCards}>
          {keepers.map((t) => (
            <li key={t.id} className={styles.archCard}>
              {t.character?.art.kind === "image" ? (
                <MediaFrame media={t.character.art} ratio="3:4" sizes="(max-width: 600px) 100vw, 33vw" className={styles.archImage} />
              ) : (
                <ImagePlaceholder label={t.character?.art.label ?? "Character art · pending artist"} shape="arch" showRatio={false} />
              )}
              <span className="label">Keeper of the {t.taste!.word.toLowerCase()} tea</span>
              <h3 className="heading-3">{t.character?.name ?? "[Character name]"}</h3>
              <Link href={`/products/${t.handle}`}>{t.title}</Link>
            </li>
          ))}
          <li className={styles.archCard}>
            <ImagePlaceholder label="A new student · coming" shape="arch" tone="dashed" showRatio={false} />
            <span className="label">To be announced</span>
            <h3 className="heading-3">[Character name]</h3>
          </li>
        </ul>
      </section>
      <section className={styles.band} aria-labelledby="grounds-title">
        <div className={styles.section}>
          <h2 id="grounds-title" className="heading-2">
            Around the grounds
          </h2>
          <ul className={styles.tiles}>
            {GROUNDS.map(([name, line]) => (
              <li key={name} className={styles.tile}>
                <h3 className="heading-3">{name}</h3>
                <p className={styles.small}>{line}</p>
              </li>
            ))}
          </ul>
          <div>
            <Button href="/collections/matcha">Shop the matcha</Button>
          </div>
        </div>
      </section>
    </>
  );
}
