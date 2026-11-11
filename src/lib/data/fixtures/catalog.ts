import { CONFIRMED } from "@/lib/config/launch";
import { money } from "../money";
import { normaliseCompareAt } from "../product";
import type { FaqEntry, Guide, Policy, PrepMethod, Product, Variant } from "../types";

/**
 * Launch range from copy v5.3 (`docs/client/WEBSITE-COPY-DRAFT.md`), used as written. Every fixture price is a
 * placeholder and is never rendered. `pnpm dev` runs on this with no Shopify credentials.
 */

const P = true; // every fixture price is a placeholder

function variant(id: string, sku: string, title: string, price: number, qty: number): Variant {
  const p = money(price, P);
  return { id, sku, title, price: p, compareAtPrice: normaliseCompareAt(p, null), availableForSale: qty > 0, quantityAvailable: qty };
}

const STORAGE_NOTE =
  "Store somewhere cool and dark. Once opened, keep the lid tightly closed and enjoy within 1–2 months for the best flavour. Use by the best-before date on your tin.";

const storageNote = CONFIRMED.storage ? STORAGE_NOTE : null;

function cups(line: string): string | null {
  return CONFIRMED.cupsPerTin ? line : null;
}

const MATCHA_FACTS = { type: "Matcha", ingredients: "100% Japanese matcha", netWeight: "30 g", packedIn: "Japan", caffeine: "Contains caffeine" };

function held(handle: string, title: string, kind: "gift" | "tool", description: string, id: string, sku: string, size: string, price: number): Product {
  return {
    id: `fx-${handle}`,
    handle,
    kind,
    title,
    academyTitle: "",
    descriptor: "",
    teaType: null,
    detailLine: null,
    description,
    seoDescription: null,
    tags: [kind],
    tin: null,
    gallery: [],
    variants: [variant(id, sku, size, price, 10)],
    tastingNotes: [],
    bestForShort: null,
    bestFor: null,
    chooseItIf: null,
    compare: null,
    facts: null,
    storageNote: null,
    servingsNote: null,
  };
}

const PROFESSOR: Product = {
  id: "fx-the-professor",
  handle: "the-professor-yame-matcha",
  kind: "tea",
  title: "The Professor — Yame Matcha",
  academyTitle: "The Professor",
  descriptor: "Yame Matcha",
  teaType: "matcha",
  detailLine: "Okumidori · First harvest · 30 g",
  description:
    "Our Yame matcha is creamy and rounded, with pronounced umami and notes of macadamia and sweet cream. Bitterness and astringency are low, so its natural sweetness comes through, followed by a lingering nutty finish. It's at its best as usucha, whisked with water, where you can taste every layer, and it's the one we'd choose for thick-style koicha. It makes a smooth latte too, though milk softens some of the detail.",
  seoDescription: "Creamy, umami-rich Yame matcha from Fukuoka. Okumidori, first harvest, with a soft macadamia note and low bitterness. Best as usucha. 30 g tin.",
  tags: [],
  tin: null,
  gallery: [],
  variants: [variant("wm-pro-30", "WM-PRO-30", "30 g", 48, 12)],
  tastingNotes: ["Creamy", "Umami", "Macadamia"],
  bestForShort: "Drinking straight (usucha)",
  bestFor: "Straight (usucha). Also makes a smooth latte.",
  chooseItIf: "you want the richest umami and creamiest texture in the range.",
  compare: { handle: "the-scholar-japanese-matcha-blend", line: "Mostly drink lattes? The Scholar — Japanese Matcha Blend suits them best." },
  facts: { ...MATCHA_FACTS, origin: "Yame, Fukuoka, Japan", cultivar: "Okumidori", harvest: "First harvest" },
  storageNote,
  servingsNote: cups("Usucha, 2 g: about 15 cups."),
};

const SCHOLAR: Product = {
  id: "fx-the-scholar",
  handle: "the-scholar-japanese-matcha-blend",
  kind: "tea",
  title: "The Scholar — Japanese Matcha Blend",
  academyTitle: "The Scholar",
  descriptor: "Japanese Matcha Blend",
  teaType: "matcha",
  detailLine: "Shizuoka, Kagoshima and Uji · 30 g",
  description:
    "Our everyday matcha for café-style lattes: a blend of matcha from Shizuoka, Kagoshima and Uji. A light toasted aroma, like toasted rice and nuts, comes with a gentle bitterness that keeps the matcha flavour clear through milk and sweetener. It's straightforward and easy to get right, which makes it a good first matcha and a reliable daily one. Enjoy it hot or iced, with your favourite milk.",
  seoDescription: "A toasty, balanced Japanese matcha blend from Shizuoka, Kagoshima and Uji. Our everyday choice for café-style lattes, hot or iced. 30 g tin.",
  tags: [],
  tin: null,
  gallery: [],
  variants: [variant("wm-sch-30", "WM-SCH-30", "30 g", 32, 3)],
  tastingNotes: ["Toasty", "Balanced", "Nutty"],
  bestForShort: "Everyday lattes, hot or iced",
  bestFor: "Everyday lattes, hot or iced.",
  chooseItIf: "you want an easy, balanced matcha that's simple to get right every day.",
  compare: { handle: "the-rebel-kagoshima-matcha", line: "Want more nutty depth in your latte? Try The Rebel — Kagoshima Matcha." },
  facts: { ...MATCHA_FACTS, origin: "Shizuoka, Kagoshima and Uji, Japan", cultivar: "Saemidori, Yabukita and Yutakamidori", harvest: "Blend of first and second harvest" },
  storageNote,
  servingsNote: cups("Matcha latte, 3–4 g: about 7–10 cups."),
};

const REBEL: Product = {
  id: "fx-the-rebel",
  handle: "the-rebel-kagoshima-matcha",
  kind: "tea",
  title: "The Rebel — Kagoshima Matcha",
  academyTitle: "The Rebel",
  descriptor: "Kagoshima Matcha",
  teaType: "matcha",
  detailLine: CONFIRMED.rebelDetails ? "Okumidori blend · First harvest · 30 g" : null,
  description:
    "Our Kagoshima matcha leads with toasted almond and chestnut rather than fresh green notes. It's fuller-bodied than The Professor, with sweetness and umami under its nutty character and a lingering nutty finish. Our favourite way to drink it is an oat milk latte, where the milk brings out the nuttiness and the matcha still comes through; it's good as usucha too. If you've found matcha too grassy before, start here.",
  seoDescription: "Bold, nutty Kagoshima matcha with toasted almond and chestnut notes. Best in an oat milk latte and good straight. 30 g tin.",
  tags: [],
  tin: null,
  gallery: [],
  variants: [variant("wm-reb-30", "WM-REB-30", "30 g", 52, 9)],
  tastingNotes: CONFIRMED.rebelTastingWords ? ["Bold", "Rich", "Chestnut"] : [],
  bestForShort: "Oat milk lattes",
  bestFor: "Lattes, especially with oat milk. Also good straight.",
  chooseItIf: "you want a fuller, more pronounced nutty flavour than The Scholar.",
  compare: { handle: "the-professor-yame-matcha", line: "Prefer matcha smooth and straight? Try The Professor — Yame Matcha." },
  facts: {
    ...MATCHA_FACTS,
    origin: "Kagoshima, Japan",
    cultivar: CONFIRMED.rebelDetails ? "Okumidori blend" : null,
    harvest: CONFIRMED.rebelDetails ? "First harvest" : null,
  },
  storageNote,
  servingsNote: cups("Matcha latte, 3–4 g: about 7–10 cups."),
};

const LIBRARIAN: Product = {
  id: "fx-the-librarian",
  handle: "the-librarian-uji-hojicha",
  kind: "tea",
  title: "The Librarian — Uji Hojicha",
  academyTitle: "The Librarian",
  descriptor: "Uji Hojicha",
  teaType: "hojicha",
  detailLine: "Hojicha · Roasted Japanese green tea · 30 g",
  description:
    "Our Uji hojicha is Japanese green tea roasted to a deep mahogany, with notes of roasted nuts, warm wood and dark caramel in place of fresh green flavours. It's smoky without tasting burnt. Bitterness and astringency are low, with a toasty sweetness and a long, roasted finish. Milk softens the roast into a rounded latte; for the boldest flavour, whisk it straight with water.",
  seoDescription: "Smoky Uji hojicha, a roasted Japanese green tea with notes of roasted nuts and dark caramel. Lovely as a latte or straight. 30 g tin.",
  tags: [],
  tin: null,
  gallery: [],
  variants: [variant("wm-lib-30", "WM-LIB-30", "30 g", 30, 20)],
  tastingNotes: ["Smoky", "Roasted", "Caramel"],
  bestForShort: "Hojicha lattes",
  bestFor: "Hojicha lattes. Also good straight.",
  chooseItIf: "you'd like something roasted and warming instead of fresh green tea flavours.",
  compare: { handle: "the-scholar-japanese-matcha-blend", line: "Want matcha with a toasty edge instead? Try The Scholar — Japanese Matcha Blend." },
  facts: {
    type: "Hojicha (roasted Japanese green tea)",
    origin: "Uji, Kyoto, Japan",
    cultivar: "Yabukita blend",
    harvest: "Blend",
    ingredients: CONFIRMED.hojichaIngredients ? "100% roasted Japanese green tea (hojicha)" : null,
    netWeight: "30 g",
    packedIn: "Japan",
    caffeine: "Contains caffeine",
  },
  storageNote,
  servingsNote: cups("Hojicha latte, 4–5 g: about 6–7 cups."),
};

export const PRODUCTS: Product[] = [
  PROFESSOR,
  SCHOLAR,
  REBEL,
  LIBRARIAN,
  // Held: scope pending, behind LIVE.gifts and LIVE.accessories.
  held("discovery-set", "Two-tin discovery set", "gift", "", "g-set", "WM-GFT-SET", "Set of 2", 76),
  held("tin-and-whisk", "Tin + bamboo whisk", "gift", "", "g-tool", "WM-GFT-WSK", "Set", 70),
  held("bamboo-whisk", "Bamboo whisk (chasen)", "tool", "A hundred-prong bamboo whisk for straight cups.", "t-whisk", "WM-TL-WSK", "1 piece", 28),
  held("handheld-frother", "Handheld frother", "tool", "For lattes in under a minute.", "t-froth", "WM-TL-FRO", "1 piece", 22),
];

export const COLLECTIONS: Record<string, { title: string; description: string; handles: string[] }> = {
  teas: {
    title: "Japanese matcha and hojicha",
    description: "Three matcha and one hojicha, each with a clear character. Compare tasting notes and how each one likes to be made, then pick your next cup.",
    handles: [PROFESSOR.handle, SCHOLAR.handle, REBEL.handle, LIBRARIAN.handle],
  },
  gifts: {
    title: "Gifts",
    description: "",
    handles: ["discovery-set", "tin-and-whisk", PROFESSOR.handle, SCHOLAR.handle, REBEL.handle, LIBRARIAN.handle],
  },
  accessories: {
    title: "Accessories",
    description: "",
    handles: ["bamboo-whisk", "handheld-frother"],
  },
};

/** Tested methods go here once founders confirm them per tea; recipes for launch live in `content/recipes.ts`. */
export const PREP_METHODS: PrepMethod[] = [];

function guide(handle: string, title: string, method: Guide["method"], time: string, serves: string, troubleshooting = false): Guide {
  return { handle, title, method, time, serves, image: null, contentHtml: null, troubleshooting };
}

/** Titles only: the articles are not written yet, so the blog stays behind LIVE.guides. */
export const GUIDES: Guide[] = [
  guide("how-to-whisk-matcha", "How to whisk matcha", "whisk", "3 min", "1"),
  guide("a-frothed-matcha-latte", "A frothed matcha latte", "frother", "4 min", "1"),
  guide("shaken-iced-matcha", "Shaken iced matcha", "shaker", "3 min", "1"),
  guide("iced-latte-poured-over", "Iced latte, poured over", "iced", "2 min", "1"),
  guide("clumps-bitterness-dull-colour", "Clumps, bitterness, dull colour: fixes", "whisk", "5 min read", "—", true),
  guide("oat-almond-or-dairy", "Oat, almond or dairy?", "frother", "4 min read", "—"),
];

const ON_PRODUCT = new Set(["which-tea", "hojicha-vs-matcha", "caffeine", "bamboo-whisk", "cold-water", "storage", "cups"]);

function faq(id: string, question: string, answer: string, category: FaqEntry["category"] = "tea"): FaqEntry {
  return { id, question, answer, category, onProduct: ON_PRODUCT.has(id) };
}

export const FAQ: FaqEntry[] = [
  faq(
    "hojicha-vs-matcha",
    "Is hojicha the same as matcha?",
    "No. Matcha and hojicha are different Japanese teas. Hojicha is roasted, giving it a warm, toasty flavour. The Librarian — Uji Hojicha is our hojicha; our other three teas are matcha.",
  ),
  faq(
    "academy-titles",
    "Why do your teas have Academy titles?",
    "Each title sums up a tea's flavour character, so it's easy to remember the one you liked. The name next to it tells you exactly what it is: The Professor is our Yame matcha, The Scholar our Japanese matcha blend, The Rebel our Kagoshima matcha and The Librarian our Uji hojicha.",
  ),
  faq(
    "which-tea",
    "Which tea should I choose?",
    "For matcha on its own, start with The Professor — Yame Matcha. For everyday lattes, choose The Scholar — Japanese Matcha Blend. If you like nutty flavours, especially in an oat milk latte, try The Rebel — Kagoshima Matcha. For a roasted tea instead of green matcha, choose The Librarian — Uji Hojicha.",
  ),
  faq("caffeine", "Do your teas contain caffeine?", "Yes. Our matcha and hojicha all contain caffeine."),
  faq(
    "how-chosen",
    "How do you choose your teas?",
    "Our co-founder Wichita tasted more than 40 Japanese tea samples to choose the range, so you don't have to. Each matcha was tasted on its own first; the best were then tried iced and with different milks. We chose the teas we'd want to drink again.",
  ),
  faq(
    "grow-or-blend",
    "Do you grow or blend your own tea?",
    "No. We choose it. Our teas are grown and packed in Japan, and our co-founder Wichita tasted more than 40 samples to pick the range. What we add is the choosing, honest tasting notes and simple ways to make each one.",
  ),
  faq(
    "bamboo-whisk",
    "Do I need a bamboo whisk?",
    "A bamboo whisk is one way to prepare matcha. You can also use a handheld frother, or a shaker with cold water. See the recipes for how to make each one.",
    "making",
  ),
  faq(
    "cold-water",
    "Can I make matcha with cold water?",
    "Yes. Whisk it with cold or room-temperature water, or use a shaker with a secure lid. It tends to taste sweeter and less bitter. Never use hot water in a shaker.",
    "making",
  ),
  ...(CONFIRMED.storage ? [faq("storage", "How should I store my tea?", STORAGE_NOTE)] : []),
  ...(CONFIRMED.cupsPerTin
    ? [faq("cups", "How many cups are in a tin?", "A 30 g tin makes about 15 cups of usucha at 2 g each. A matcha latte at 3–4 g gives about 7–10 cups, and a hojicha latte at 4–5 g about 6–7.", "making")]
    : []),
];

/** Legal text comes from Shopify admin. Empty bodies stay behind LIVE.policies. */
export const POLICIES: Policy[] = [
  { handle: "privacy-policy", title: "Privacy Policy", body: "" },
  { handle: "terms-of-service", title: "Terms of Service", body: "" },
  { handle: "refund-policy", title: "Refund Policy", body: "" },
  { handle: "shipping-policy", title: "Shipping Policy", body: "" },
];
