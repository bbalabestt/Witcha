import Link from "next/link";
import type { CSSProperties } from "react";
import { RecipeDrawing } from "@/components/motion/MatchaScenes";
import type { Recipe } from "@/lib/content/recipes";
import styles from "./RecipeCard.module.css";

function BestWith({ recipe }: { recipe: Recipe }) {
  if (!recipe.bestWith.length) return null;
  return (
    <p className={styles.bestWith}>
      Best with:{" "}
      {recipe.bestWith.map((b, i) => (
        <span key={b.handle}>
          {i > 0 ? ", or " : ""}
          <Link href={`/products/${b.handle}`} className="text-link">
            {b.label}
          </Link>
        </span>
      ))}
      .
    </p>
  );
}

/** Home teaser card. Links to the recipe's full steps. */
export function RecipeSummary({ recipe, index = 0 }: { recipe: Recipe; index?: number }) {
  return (
    <article className={styles.card} data-rise="" style={{ "--i": index } as CSSProperties}>
      <span className={styles.drawing} aria-hidden="true">
        <RecipeDrawing id={recipe.id} />
      </span>
      <h3 className="heading-3">
        <Link href={`/pages/recipes#${recipe.id}`} className={styles.name}>
          {recipe.name}
        </Link>
      </h3>
      <p className={styles.needs}>{recipe.needs.join(" · ")}</p>
      <BestWith recipe={recipe} />
    </article>
  );
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article id={recipe.id} className={styles.card}>
      <span className={styles.drawing} aria-hidden="true">
        <RecipeDrawing id={recipe.id} />
      </span>
      <h2 className="heading-3">{recipe.name}</h2>
      {recipe.lead ? <p className={styles.lead}>{recipe.lead}</p> : null}
      <div>
        <span className="label">You&apos;ll need</span>
        <p className={styles.needs}>{recipe.needs.join(" · ")}</p>
      </div>
      <ol className={styles.steps}>
        {recipe.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <BestWith recipe={recipe} />
    </article>
  );
}
