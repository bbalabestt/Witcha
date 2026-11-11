import type { RecipeDrawingId } from "@/components/motion/MatchaScenes";
import { CONFIRMED } from "@/lib/config/launch";
import type { Product, TeaType } from "@/lib/data/types";

export type Recipe = {
  /** Also the anchor on the recipes page and the drawing shown for it. */
  id: RecipeDrawingId;
  name: string;
  lead: string | null;
  tea: TeaType;
  needs: string[];
  steps: string[];
  bestWith: Array<{ handle: string; label: string }>;
};

const WHISK = 'Whisk briskly in an "M" motion for about 15 seconds, until well mixed.';

/** Copy v5.3 §4, as written. Sweetener is optional in all of them. Water at 80°C throughout, as tested. */
const ALL: Array<Recipe & { live: boolean }> = [
  {
    id: "usucha",
    name: "Usucha (classic matcha)",
    lead: "Matcha whisked with water, without milk or sweetener.",
    tea: "matcha",
    needs: ["2 g matcha", "60 ml hot water at 80°C", "bowl and whisk"],
    steps: [
      "Sift 2 g matcha into a bowl.",
      "Add 60 ml hot water at 80°C.",
      'Whisk briskly in an "M" motion for about 15 seconds, until well mixed with a fine layer of foam.',
    ],
    bestWith: [{ handle: "the-professor-yame-matcha", label: "The Professor — Yame Matcha" }],
    live: true,
  },
  {
    id: "iced-matcha-latte",
    name: "Iced matcha latte",
    lead: null,
    tea: "matcha",
    needs: ["3–4 g matcha", "30–40 ml hot water at 80°C", "ice", "90–120 ml milk"],
    steps: ["Sift 3–4 g matcha into a bowl.", "Add 30–40 ml hot water at 80°C.", WHISK, "Add ice and 90–120 ml milk to a glass, then pour in the matcha."],
    bestWith: [
      { handle: "the-scholar-japanese-matcha-blend", label: "The Scholar — Japanese Matcha Blend" },
      { handle: "the-rebel-kagoshima-matcha", label: "The Rebel — Kagoshima Matcha with oat milk" },
    ],
    live: true,
  },
  {
    id: "iced-matcha-americano",
    name: "Iced matcha americano",
    lead: "Matcha over ice, without milk.",
    tea: "matcha",
    needs: ["3 g matcha", "40 ml hot water at 80°C", "ice", "90–100 ml cold water"],
    steps: ["Sift 3 g matcha into a bowl.", "Add 40 ml hot water at 80°C.", WHISK, "Fill a glass with ice and 90–100 ml cold water, then pour the matcha over."],
    bestWith: [],
    live: true,
  },
  {
    // Held: the milk quantity is not confirmed. Add it to `needs` when CONFIRMED.hojichaLatte flips.
    id: "hojicha-latte",
    name: "Hojicha latte",
    lead: null,
    tea: "hojicha",
    needs: ["4–5 g hojicha", "40–50 ml hot water at 80°C", "ice", "milk"],
    steps: ["Sift 4–5 g hojicha into a bowl.", "Add 40–50 ml hot water at 80°C.", WHISK, "Fill a glass with ice and milk, then pour the hojicha over."],
    bestWith: [{ handle: "the-librarian-uji-hojicha", label: "The Librarian — Uji Hojicha" }],
    live: CONFIRMED.hojichaLatte,
  },
];

export const RECIPES: Recipe[] = ALL.filter((r) => r.live);

export const METHOD_NOTES: Array<[string, string]> = [
  ["Whisk", 'Whisk briskly in an "M" motion, not circles.'],
  ["Frother", "Same flavour, a foamier texture. Use the recipe's measurements."],
  ["Shaker", "Room-temperature or cold water only, never hot. Use a shaker with a secure lid."],
  ["Cold whisk", "Whisking with cold water tends to bring out more sweetness and less bitterness."],
];

/** Recipes for this tea only, best-for first. Hojicha never gets a matcha recipe. */
export function recipesFor(product: Pick<Product, "handle" | "teaType">): Recipe[] {
  const mine = RECIPES.filter((r) => r.tea === product.teaType);
  const isBest = (r: Recipe) => r.bestWith.some((b) => b.handle === product.handle);
  return [...mine.filter(isBest), ...mine.filter((r) => !isBest(r))];
}
