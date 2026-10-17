/**
 * Editorial placements for the home page that are not product data. Move to a `home_settings` metaobject
 * if the team wants to edit them in Shopify.
 */

export type QuadrantRow = "pure" | "latte";

/** V4 taste quadrant: Bright ↔ Deep across, Pure on top, Latte below. `null` handle = concept keeper. */
export const QUADRANT: Array<{ handle: string | null; row: QuadrantRow; side: "bright" | "deep"; character: string }> = [
  { handle: null, row: "pure", side: "bright", character: "the-dreamer" },
  { handle: "yame-no-mukashi", row: "pure", side: "deep", character: "the-professor" },
  { handle: "kosen-daily-matcha", row: "latte", side: "bright", character: "kosen-keeper" },
  { handle: "the-charmer", row: "latte", side: "deep", character: "the-charmer" },
];

/** Roasted tea sits outside the matcha quadrant, linked underneath it. */
export const ROASTED_HANDLE = "organic-hojicha";

export const MANIFESTO =
  "Every tin is tasted by Pop before it reaches the Academy shelf. We look for sweetness, depth and a colour that tells the truth, then place each tea on one simple scale from bright to deep, so choosing feels like a little magic, not homework.";

/** Key words get a hand-drawn gold underline as they light (V2.1 2.4). */
export const MANIFESTO_KEYS = ["tasted", "sweetness", "depth", "colour", "bright", "deep", "magic"];

export const ACADEMY_INTRO =
  "At the Academy, the deep tea is kept by one cat and the bright tea by another, each with a single treasured object and a favourite corner of the grounds. There is a conservatory where the plants winter, a library window where recipes collect in the margins, a garden bridge for slow morning cups and a tea room where every tin is tasted before it is shelved. The words wrap around the window on purpose: the world is soft and painted, but the shop stays clear, so you always know what is in the tin, what it tastes like and when it will reach your door.";

export const GHOST_LINES = "The bright keeper ✦ The deep keeper ✦ The conservatory ✦ The library window ✦ The garden bridge ✦ The tea room ✦ ";
