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

export const TAGLINE = "Matcha, With Taste.";

export const SELECTION = {
  heading: "Find your next cup",
  body: "Each tea has a clear character. Choose by flavour, or by how you like to drink it.",
} as const;

/** Copy v5.3 §3, the Teas collection title and intro. */
export const RANGE = {
  title: "Japanese matcha and hojicha",
  intro: "Three matcha and one hojicha, each with a clear character. Compare tasting notes and how each one likes to be made, then pick your next cup.",
  /** The intro's two sentences, set as heading and standfirst so the hero's eyebrow is not repeated. */
  heading: "Three matcha and one hojicha, each with a clear character.",
  standfirst: "Compare tasting notes and how each one likes to be made, then pick your next cup.",
} as const;

/** Where the teas come from (copy v5.3 §2 facts), for the second banner. */
export const ORIGINS = ["Yame, Fukuoka", "Shizuoka", "Kagoshima", "Uji, Kyoto"] as const;

/**
 * "Find your next cup" chooser: copy v5.3 §6, the answer to "Which tea should I choose?", split into its four
 * cases. Each case leads to the tea the answer names.
 */
export const CHOOSER = [
  { handle: "the-professor-yame-matcha", option: "For matcha on its own" },
  { handle: "the-scholar-japanese-matcha-blend", option: "For everyday lattes" },
  { handle: "the-rebel-kagoshima-matcha", option: "If you like nutty flavours, especially in an oat milk latte" },
  { handle: "the-librarian-uji-hojicha", option: "For a roasted tea instead of green matcha" },
] as const;

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

/**
 * "Why it tastes good" (the client's design prompt §3; Bible "Fantasy earns attention, reality earns trust"):
 * real photos, facts and the selection story. Photos are stand-ins until the founders supply them.
 * Fact labels are the §2 facts tables.
 */
export const PROOF = {
  label: "Why it tastes good",
  /** Copy v5.3 §3 (How we chose them). The Wichita line lives in "Taste comes first." only. */
  heading: "We looked at aroma, colour, texture, sweetness, umami, bitterness, astringency and finish.",
  facts: { origin: "Origin", cultivar: "Cultivar", harvest: "Harvest" },
} as const;

/**
 * Gifts. Drafted from Brand Bible v3.0 (p.14 "a gift for my matcha-loving friend that looks chosen with care";
 * p.31 "the tin signals care") and the vendor list's tins (white for matcha, black for hojicha). Needs the
 * founders' sign-off. Promises nothing unconfirmed: no gift note, delivery cut-off, bundle or price.
 */
export const GIFTS = {
  heading: "For a matcha-loving friend",
  body: "Each tea comes in its own 30 g tin, white for matcha and black for hojicha, so a gift looks chosen with care.",
  /** Mock, from Bible p.14 (gifting as a purchase occasion). */
  occasions: "Birthdays · Christmas · Valentine's Day · Mother's Day",
  /** Mock label. */
  cta: "Choose a tin",
} as const;
