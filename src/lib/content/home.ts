/**
 * Home copy, as written in copy v5.3 §1 (plus the confirmed brand lines, checklist §1 and §7).
 * Sections keep Prototype V4's layout; only these words fill them. See docs/COPY-SOURCES.md.
 */

export const HERO = {
  eyebrow: "Japanese matcha & hojicha",
  headline: "Matcha, With Taste.",
  supporting: "Four teas, four distinct flavour profiles. From creamy, umami-rich matcha to deeply roasted hojicha, find the cup you'll want to make again.",
  primary: "Shop the teas",
  secondary: "Find your tea",
} as const;

/** Anchor that "Find your tea" scrolls to. */
export const SELECTION_ID = "find-your-tea";

export const BRAND_LINE = "Which Matcha Today?";
export const TAGLINE = "Matcha, With Taste.";

export const SELECTION = {
  heading: "Find your next cup",
  body: "Each tea has a clear character. Choose by flavour, or by how you like to drink it.",
} as const;

/** "Straight or with milk" is copy v5.3 §1 ("Your cup. Your way."). Recipes are §4. */
export const DRINK_WAYS = {
  straight: { label: "Straight", recipe: "Usucha (classic matcha)", needs: "2 g matcha · 60 ml hot water at 80°C" },
  milk: { label: "With milk", recipe: "Iced matcha latte", needs: "3–4 g matcha · 30–40 ml hot water at 80°C · ice · 90–120 ml milk" },
} as const;

export type DrinkWay = keyof typeof DRINK_WAYS;

/** Copy v5.3 §3, the Teas collection title and intro. */
export const RANGE = {
  title: "Japanese matcha and hojicha",
  intro: "Three matcha and one hojicha, each with a clear character. Compare tasting notes and how each one likes to be made, then pick your next cup.",
} as const;

export const TASTE_FIRST = {
  heading: "Taste comes first.",
  body: "Our co-founder Wichita tasted more than 40 Japanese tea samples, so you don't have to. Every matcha was tasted on its own first, and only the ones that stood out were tried iced and with milk. All were good; fewer than half were memorable. The final question was simple: would we want to drink it again tomorrow?",
  link: "How we chose them",
} as const;

/** Words that get the gold underline as the paragraph lights. */
export const TASTE_FIRST_KEYS = ["tasted", "40", "memorable", "tomorrow"];

export const YOUR_CUP = {
  heading: "Your cup.",
  headingItalic: "Your way.",
  body: "Start with a recipe, then make it your own. Find the measurements and steps for your next cup, straight or with milk.",
  cta: "See the recipes",
} as const;

export const ACADEMY = {
  label: "Witcha Academy",
  headingLeft: "Meet Witcha",
  headingRight: "Academy.",
  body: "The Academy is where we explore tea by taste. Each of our teas carries an Academy title that sums up its character, and one curious cat keeps them all company.",
  cta: "Step inside",
} as const;
