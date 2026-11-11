import Link from "next/link";

const RECIPES_LINK = "See the recipes";

/** Copy v5.3 §6 mentions the recipes in plain text; that phrase becomes the link. */
export function FaqAnswer({ text }: { text: string }) {
  const [before, after] = text.split(RECIPES_LINK);
  if (after === undefined) return <p>{text}</p>;
  return (
    <p>
      {before}
      <Link href="/pages/recipes" className="text-link">
        {RECIPES_LINK}
      </Link>
      {after}
    </p>
  );
}
