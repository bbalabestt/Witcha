import type { Metadata } from "next";
import { GuideCard } from "@/components/content/GuideCard";
import { GuideGrid } from "@/components/content/GuideGrid";
import { getGuides } from "@/lib/data/catalog";
import styles from "../../content.module.css";

export const metadata: Metadata = {
  title: "Brewing Guides",
  description: "Measured recipes for whisk, frother, shaker and ice.",
  alternates: { canonical: "/blogs/brewing-guides" },
};

export default async function GuidesPage() {
  const guides = await getGuides();
  return (
    <>
      <section className={styles.band}>
        <div className={`container ${styles.bandInner}`}>
          <span className="label" data-reveal="up">
            Brewing guides
          </span>
          <h1 className="heading-1" data-reveal="up">
            A Little Magic, Made at Home
          </h1>
          <p className={styles.lead} data-reveal="up">
            Measured recipes for whisk, frother, shaker and ice. No special skills, just two grams and a little patience.
          </p>
        </div>
      </section>
      <section className={`container ${styles.sectionTight}`}>
        <GuideGrid cards={guides.map((g) => ({ key: g.handle, method: g.method, node: <GuideCard guide={g} /> }))} />
      </section>
    </>
  );
}
