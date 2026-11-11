import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideCard } from "@/components/content/GuideCard";
import { GuideGrid } from "@/components/content/GuideGrid";
import { LIVE } from "@/lib/config/launch";
import { getGuides } from "@/lib/data/catalog";
import styles from "../../content.module.css";

export const metadata: Metadata = {
  title: "Brewing Guides | WITCHA MATCHA",
  description: "Measured recipes for whisk, frother, shaker and ice.",
  alternates: { canonical: "/blogs/brewing-guides" },
};

export default async function GuidesPage() {
  if (!LIVE.guides) notFound();
  const guides = await getGuides();
  return (
    <>
      <section className={styles.band}>
        <div className={`container ${styles.bandInner}`}>
          <span className="label">
            Brewing guides
          </span>
          <h1 className="heading-1">
            Your cup. Your way.
          </h1>
          <p className={styles.lead}>
            Start with a recipe, then make it your own. Find the measurements and steps for your next cup, straight or with milk.
          </p>
        </div>
      </section>
      <section className={`container ${styles.sectionTight}`}>
        <GuideGrid cards={guides.map((g) => ({ key: g.handle, method: g.method, node: <GuideCard guide={g} /> }))} />
      </section>
    </>
  );
}
