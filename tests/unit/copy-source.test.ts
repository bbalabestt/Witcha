import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ACADEMY_TITLES } from "@/lib/content/academy";
import { METHOD_NOTES, RECIPES } from "@/lib/content/recipes";
import { SEO } from "@/lib/content/seo";
import { COLLECTIONS, FAQ, PRODUCTS } from "@/lib/data/fixtures/catalog";

/**
 * Words on the site must be the client's, not ours. Everything here must appear word for word in copy v5.3.
 * The file is gitignored while the repo is public, so this skips where it is absent. See docs/COPY-SOURCES.md.
 */
const COPY_FILE = "docs/client/WEBSITE-COPY-DRAFT.md";

function normalise(text: string): string {
  return text
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\*\*|`/g, "")
    .replace(/\\\|/g, "|")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Hard-coded in page components. */
const PAGE_COPY = [
  "Japanese matcha & hojicha",
  "Matcha, With Taste.",
  "Four teas, four distinct flavour profiles. From creamy, umami-rich matcha to deeply roasted hojicha, find the cup you'll want to make again.",
  "Shop the teas",
  "Find your tea",
  "Find your next cup",
  "Each tea has a clear character. Choose by flavour, or by how you like to drink it.",
  "Taste comes first.",
  "Our co-founder Wichita tasted more than 40 Japanese tea samples, so you don't have to. Every matcha was tasted on its own first, and only the ones that stood out were tried iced and with milk. All were good; fewer than half were memorable. The final question was simple: would we want to drink it again tomorrow?",
  "How we chose them",
  "Your cup. Your way.",
  "Start with a recipe, then make it your own. Find the measurements and steps for your next cup, straight or with milk.",
  "See the recipes",
  "Meet Witcha Academy.",
  "The Academy is where we explore tea by taste. Each of our teas carries an Academy title that sums up its character, and one curious cat keeps them all company.",
  "Step inside",
  "Keep in the loop.",
  "New teas, recipes and news from the Academy, straight to your inbox.",
  "Sign me up",
  "By signing up, you agree to receive news and marketing emails from WITCHA MATCHA. Unsubscribe at any time. See our Privacy Policy.",
  "You're on the list. Welcome to the Academy.",
  "Our co-founder Wichita tasted more than 40 tea samples from tea-producing regions across Japan, looking for teas worth drinking again.",
  "Every matcha was tasted first as usucha, whisked with water and served without milk or sweetener. If it didn't stand out there, it went no further. The ones that did were tried with cold water and in lattes with different milks, to see how each one held up and where it shone.",
  "We looked at aroma, colour, texture, sweetness, umami, bitterness, astringency and finish. Every sample was high quality, but fewer than half were memorable. We wanted character: a tea you'd recognise and remember in the next cup.",
  "Witcha Academy is where WITCHA MATCHA explores tea by taste. Each of our four teas carries a title that sums up its character, so it's easy to remember the one you liked and find your way to the next.",
  "Learn by tasting",
  "Try one tea two ways, straight and with milk, and notice what changes. Our recipes are a good place to start.",
  "There is always room for another cup at the Academy. Our resident cat likes to know what's being made, appearing beside the tin before the first sip. Curious about every tea and content to keep you company, this familiar is part of the Academy's everyday life.",
  "Get in touch.",
  "Have a question about our teas or your order? Send us a message below.",
  "This page has wandered off.",
  "Let's get you back to the teas.",
  "Nothing brewing yet.",
  "Added to cart",
  "Enter an email address.",
  "Compare tasting notes and find your next cup.",
  "Method notes",
  "You'll need",
  "Best with:",
  "How to make it",
  "Tasting words",
  "Best for",
  "Choose it if",
];

const teas = PRODUCTS.filter((p) => p.kind === "tea");

const sources: Array<[string, string]> = [
  ...PAGE_COPY.map((t): [string, string] => ["page", t]),
  ...teas.flatMap((p) => {
    const f = p.facts!;
    const fields = [
      p.title,
      p.description,
      p.detailLine,
      p.tastingNotes.join(" · "),
      p.bestForShort,
      p.bestFor,
      p.chooseItIf,
      p.compare?.line,
      p.seoDescription,
      f.type,
      f.origin,
      f.cultivar,
      f.harvest,
      f.ingredients,
      f.netWeight,
      f.packedIn,
      f.caffeine,
    ];
    return fields.filter((v): v is string => Boolean(v)).map((v): [string, string] => [p.academyTitle, v]);
  }),
  ...FAQ.flatMap((f): Array<[string, string]> => [["faq", f.question], ["faq", f.answer]]),
  ...RECIPES.flatMap((r): Array<[string, string]> => [
    ["recipe", r.name],
    ...(r.lead ? ([["recipe", r.lead]] as Array<[string, string]>) : []),
    ...r.needs.map((n): [string, string] => ["recipe", n]),
    ...r.steps.map((s): [string, string] => ["recipe", s]),
    ...r.bestWith.map((b): [string, string] => ["recipe", b.label]),
  ]),
  ...METHOD_NOTES.flatMap(([method, note]): Array<[string, string]> => [["method", method], ["method", note]]),
  ...ACADEMY_TITLES.flatMap((t): Array<[string, string]> => [["academy", t.name], ["academy", t.character], ["academy", t.line]]),
  ["teas", COLLECTIONS.teas!.title],
  ["teas", COLLECTIONS.teas!.description],
  ...Object.entries(SEO).flatMap(([k, x]): Array<[string, string]> =>
    k === "recipes" || k === "faq" ? [] : [[`seo ${k}`, x.title], [`seo ${k}`, (x as { description: string }).description]],
  ),
];

describe.skipIf(!existsSync(COPY_FILE))("copy comes from the client file", () => {
  const copy = existsSync(COPY_FILE) ? normalise(readFileSync(COPY_FILE, "utf8")) : "";
  it.each(sources)("%s: %s", (_where, text) => {
    expect(copy).toContain(normalise(text));
  });
});
