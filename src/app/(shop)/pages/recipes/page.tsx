import type { Metadata } from "next";
import { RecipeCard } from "@/components/content/RecipeCard";
import { METHOD_NOTES, RECIPES } from "@/lib/content/recipes";
import { SEO } from "@/lib/content/seo";
import styles from "../pages.module.css";

export const metadata: Metadata = { ...SEO.recipes, alternates: { canonical: "/pages/recipes" } };

/** Copy v5.3 §4. Replaces the held brewing guides as the one place to learn how to make each tea. */
export default function RecipesPage() {
  return (
    <>
      <section className={`container ${styles.intro}`}>
        <span className="label">Recipes</span>
        <h1 className={styles.display}>Your cup. Your way.</h1>
        <p className={styles.lead}>Start with a recipe, then make it your own. Find the measurements and steps for your next cup, straight or with milk.</p>
      </section>
      <section className={`container ${styles.recipes}`}>
        {RECIPES.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </section>
      <section className={`container ${styles.notes}`}>
        <h2 className="heading-3">Method notes</h2>
        <dl className={styles.noteList}>
          {METHOD_NOTES.map(([method, note]) => (
            <div key={method}>
              <dt>{method}</dt>
              <dd>{note}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
