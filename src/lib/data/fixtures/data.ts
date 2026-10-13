/**
 * Fixture catalogue for `COMMERCE_SOURCE=fixtures`. Content is lifted from Prototype V2 and stays
 * visibly placeholder: every price is bracketed, unnamed teas and characters are `[..]`, no reviews.
 * Do not "improve" this copy; real content arrives through Shopify (see docs/HANDOVER.md).
 */
import { money } from "../money";
import { badgesFromTags, parseBestFor, tasteProfile } from "../product";
import type { Article, FaqEntry, Media, Menu, PrepMethod, Product, ProductFacts, Variant } from "../types";

const P = (dollars: number) => money(Math.round(dollars * 100), "AUD", true);
const ph = (label: string): Media => ({ kind: "placeholder", label });

export const PREP_METHODS: PrepMethod[] = [
  {
    method: "Whisk",
    icon: "whisk",
    grams: "2 g",
    water: "70 ml · 80°C",
    milk: "—",
    time: "2 min",
    steps: [
      "Sift 2 g (one heaped scoop) into a warm bowl.",
      "Add a splash of 80°C water and paste it smooth.",
      "Top up to 70 ml. Whisk in a quick M shape for 15 seconds.",
      "Drink while the foam is fine.",
    ],
    videoUrl: null,
  },
  {
    method: "Frother",
    icon: "frother",
    grams: "2 g",
    water: "30 ml · 80°C",
    milk: "180 ml",
    time: "3 min",
    steps: [
      "Add 2 g to a mug with 30 ml of 80°C water.",
      "Froth for 10 seconds until no lumps remain.",
      "Froth 180 ml of warm milk separately.",
      "Pour the milk over the matcha.",
    ],
    videoUrl: null,
  },
  {
    method: "Shaker",
    icon: "shaker",
    grams: "2 g",
    water: "60 ml · cold",
    milk: "150 ml",
    time: "2 min",
    steps: ["Add 2 g and 60 ml cold water to a shaker.", "Close tight. Shake hard for 20 seconds.", "Pour over ice and milk."],
    videoUrl: null,
  },
  {
    method: "Iced latte",
    icon: "iced",
    grams: "2 g",
    water: "40 ml · 80°C",
    milk: "180 ml",
    time: "3 min",
    steps: [
      "Whisk or froth 2 g with 40 ml of 80°C water.",
      "Fill a glass with ice and 180 ml cold milk.",
      "Pour the matcha over slowly for the layers.",
    ],
    videoUrl: null,
  },
];

const NO_FACTS: ProductFacts = {
  originRegion: null,
  cultivar: null,
  harvest: null,
  grade: null,
  packDateNote: null,
  netWeight: null,
  ingredients: null,
};

const TEA_GALLERY = ["TIN PACK SHOT", "POWDER COLOUR (TRUE)", "HANDS WHISKING", "ICED LATTE", "TIN + ARCH ART · PENDING", "SIZE / SCALE SHOT"];

type VariantSeed = { id: string; size: string; price: number; compareAt?: number; avail: boolean; qty: number | null; servings?: number };

function variants(productId: string, seeds: VariantSeed[], optionName = "Size"): Variant[] {
  return seeds.map((s) => {
    const price = P(s.price);
    const compareAt = s.compareAt !== undefined ? P(s.compareAt) : null;
    return {
      id: `gid://shopify/ProductVariant/${productId}${s.id}`,
      title: s.size,
      size: s.size,
      selectedOptions: [{ name: optionName, value: s.size }],
      price,
      compareAtPrice: compareAt && compareAt.amount > price.amount ? compareAt : null,
      availableForSale: s.avail,
      quantityAvailable: s.qty,
      servings: s.servings ?? null,
      image: null,
      sku: null,
    };
  });
}

type ProductSeed = Omit<Product, "badges" | "priceRange" | "availableForSale" | "options" | "descriptionHtml" | "seo"> & {
  seo?: Product["seo"];
};

function product(seed: ProductSeed): Product {
  const prices = seed.variants.map((v) => v.price.amount);
  const onSale = seed.variants.some((v) => v.compareAtPrice !== null);
  const sizes = seed.variants.map((v) => v.size);
  return {
    ...seed,
    descriptionHtml: `<p>${seed.description}</p>`,
    badges: badgesFromTags(seed.tags, onSale),
    priceRange: { min: P(Math.min(...prices) / 100), max: P(Math.max(...prices) / 100) },
    availableForSale: seed.variants.some((v) => v.availableForSale),
    options: seed.variants.length > 1 ? [{ name: "Size", values: sizes }] : [],
    seo: seed.seo ?? { title: null, description: null },
  };
}

export const PRODUCTS: Product[] = [
  product({
    id: "gid://shopify/Product/1001",
    handle: "yame",
    title: "Yame no Mukashi",
    kind: "tea",
    description:
      "[Character name] keeps the deep tea at the Academy. Expect nutty, umami and mellow notes. From Yame in Fukuoka, 100% Okumidori, first harvest. Lovely whisked or as a latte.",
    taste: tasteProfile(4, "Reserve"),
    tastingNotes: ["Nutty", "Umami", "Mellow"],
    bestFor: parseBestFor(["Latte", "Straight", "Iced"]),
    facts: {
      originRegion: "Yame, Fukuoka",
      cultivar: "100% Okumidori",
      harvest: "First harvest",
      grade: "[Grade description]",
      packDateNote: "[Pack date note]",
      netWeight: "30 g",
      ingredients: "100% green tea (matcha)",
    },
    storageNote: null,
    servings: 15,
    prepMethods: PREP_METHODS,
    character: {
      name: "[Character name]",
      tasteRole: "Keeper of the deep tea",
      story: "[Two-sentence character story, from the character metaobject.]",
      art: ph("CHARACTER ART · PENDING ARTIST"),
      accessory: "[Accessory: one object.]",
    },
    tags: ["new", "matcha"],
    media: TEA_GALLERY.map(ph),
    variants: variants("1001", [
      { id: "30", size: "30 g", price: 48, avail: true, qty: 12, servings: 15 },
      { id: "100", size: "100 g", price: 140, avail: false, qty: 0, servings: 50 },
    ]),
    cardNote: "Nutty, umami, mellow. Whisked or in milk.",
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  }),
  product({
    id: "gid://shopify/Product/1002",
    handle: "daily",
    title: "[Daily tea name]",
    kind: "tea",
    description:
      "[Character name] keeps the bright tea at the Academy. Expect [2–3 notes]. From [region], [cultivar], [harvest]. Lovely as a latte or over ice.",
    taste: tasteProfile(2, "Daily"),
    tastingNotes: ["[Note]", "[Note]", "[Note]"],
    bestFor: parseBestFor(["Latte", "Iced"]),
    facts: {
      originRegion: "[Region]",
      cultivar: "[Cultivar]",
      harvest: "[Harvest]",
      grade: "[Grade description]",
      packDateNote: "[Pack date note]",
      netWeight: "30 g",
      ingredients: "100% green tea (matcha)",
    },
    storageNote: null,
    servings: 15,
    prepMethods: PREP_METHODS,
    character: {
      name: "[Character name]",
      tasteRole: "Keeper of the bright tea",
      story: "[Two-sentence character story, from the character metaobject.]",
      art: ph("CHARACTER ART · PENDING ARTIST"),
      accessory: "[Accessory: one object.]",
    },
    tags: ["matcha"],
    media: TEA_GALLERY.map(ph),
    variants: variants("1002", [{ id: "30", size: "30 g", price: 32, avail: true, qty: 3, servings: 15 }]),
    cardNote: "Fresh and lively. Lovely over ice.",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  }),
  product({
    id: "gid://shopify/Product/2001",
    handle: "two-tin-discovery-set",
    title: "[Two-tin discovery set]",
    kind: "gift",
    description: "Bright and deep, side by side. Gift note included.",
    taste: null,
    tastingNotes: [],
    bestFor: [],
    facts: NO_FACTS,
    storageNote: null,
    servings: null,
    prepMethods: [],
    character: null,
    tags: ["gift-set"],
    media: [ph("GIFT SET · BOTH TINS")],
    variants: variants("2001", [{ id: "1", size: "Gift set", price: 76, avail: true, qty: 20 }], "Title"),
    cardNote: "Bright and deep, side by side. Gift note included.",
    createdAt: "2026-09-15T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  }),
  product({
    id: "gid://shopify/Product/2002",
    handle: "tin-and-bamboo-whisk",
    title: "[Tin + bamboo whisk]",
    kind: "gift",
    description: "Everything needed to start whisking.",
    taste: null,
    tastingNotes: [],
    bestFor: [],
    facts: NO_FACTS,
    storageNote: null,
    servings: null,
    prepMethods: [],
    character: null,
    tags: ["gift-set"],
    media: [ph("GIFT SET · TIN + WHISK")],
    variants: variants("2002", [{ id: "1", size: "Gift set", price: 70, avail: true, qty: 20 }], "Title"),
    cardNote: "Everything needed to start whisking.",
    createdAt: "2026-09-15T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  }),
  product({
    id: "gid://shopify/Product/3001",
    handle: "bamboo-whisk-chasen",
    title: "Bamboo whisk (chasen)",
    kind: "accessory",
    description: "[Accessory description pending.]",
    taste: null,
    tastingNotes: [],
    bestFor: [],
    facts: NO_FACTS,
    storageNote: null,
    servings: null,
    prepMethods: [],
    character: null,
    tags: ["accessory"],
    media: [ph("BAMBOO WHISK")],
    variants: variants("3001", [{ id: "1", size: "Tool", price: 28, avail: true, qty: 10 }], "Title"),
    cardNote: null,
    createdAt: "2026-09-20T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  }),
  product({
    id: "gid://shopify/Product/3002",
    handle: "handheld-frother",
    title: "Handheld frother",
    kind: "accessory",
    description: "[Accessory description pending.]",
    taste: null,
    tastingNotes: [],
    bestFor: [],
    facts: NO_FACTS,
    storageNote: null,
    servings: null,
    prepMethods: [],
    character: null,
    tags: ["accessory"],
    media: [ph("HANDHELD FROTHER")],
    variants: variants("3002", [{ id: "1", size: "Tool", price: 22, avail: true, qty: 10 }], "Title"),
    cardNote: null,
    createdAt: "2026-09-20T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  }),
];

export const COLLECTIONS = [
  {
    id: "gid://shopify/Collection/1",
    handle: "matcha",
    title: "Which Matcha Today?",
    description: "Every tea, placed on one scale from bright to deep. Pick by taste.",
    productHandles: ["yame", "daily"],
  },
  {
    id: "gid://shopify/Collection/2",
    handle: "gifts",
    title: "Gifts",
    description: "Sets with a gift note and no prices on the packing slip.",
    productHandles: ["two-tin-discovery-set", "tin-and-bamboo-whisk", "yame", "daily"],
  },
  {
    id: "gid://shopify/Collection/3",
    handle: "accessories",
    title: "Accessories",
    description: "The tools for making it at home.",
    productHandles: ["bamboo-whisk-chasen", "handheld-frother"],
  },
] as const;

type GuideSeed = { handle: string; title: string; method: Article["method"]; time: string; serves: string };

const GUIDE_SEEDS: GuideSeed[] = [
  { handle: "how-to-whisk-matcha", title: "How to whisk matcha", method: "Whisk", time: "3 min", serves: "1" },
  { handle: "frothed-matcha-latte", title: "A frothed matcha latte", method: "Frother", time: "4 min", serves: "1" },
  { handle: "shaken-iced-matcha", title: "Shaken iced matcha", method: "Shaker", time: "3 min", serves: "1" },
  { handle: "iced-latte-poured-over", title: "Iced latte, poured over", method: "Iced", time: "2 min", serves: "1" },
  { handle: "clumps-bitterness-dull-colour-fixes", title: "Clumps, bitterness, dull colour: fixes", method: "Whisk", time: "5 min read", serves: "—" },
  { handle: "oat-almond-or-dairy", title: "Oat, almond or dairy?", method: "Frother", time: "4 min read", serves: "—" },
];

export const ARTICLES: Article[] = GUIDE_SEEDS.map((g, i) => ({
  id: `gid://shopify/Article/${100 + i}`,
  handle: g.handle,
  blogHandle: "brewing-guides",
  title: g.title,
  method: g.method,
  time: g.time,
  serves: g.serves,
  excerpt: "[Guide introduction pending.]",
  contentHtml: "<p>[Guide body pending. Steps come from the matching prep method.]</p>",
  image: ph(`${g.method.toUpperCase()} · GUIDE HERO`),
  publishedAt: `2026-09-${String(10 + i).padStart(2, "0")}T00:00:00Z`,
  tags: [g.method.toLowerCase()],
  seo: { title: null, description: null },
}));

export const FAQ: FaqEntry[] = [
  {
    id: "faq-lattes",
    question: "Is it good for lattes?",
    answer: "Yes. The deep tea holds its flavour through milk; the bright tea is lighter and lovely over ice.",
    topic: "tea",
  },
  {
    id: "faq-store",
    question: "How do I store it?",
    answer: "Keep the tin closed tight, somewhere cool and dry, away from sunlight. Once opened, enjoy it within [opened shelf-life].",
    topic: "tea",
  },
  {
    id: "faq-per-serve",
    question: "How much is it per serve?",
    answer: "A 30 g tin makes about 15 serves at 2 g each, so roughly $[3.20] a cup.",
    topic: "tea",
  },
  {
    id: "faq-arrive",
    question: "When will it arrive?",
    answer: "We dispatch from [city] within [x] business days. Metro Australia usually arrives [x–y] business days after that.",
    topic: "shipping",
  },
  {
    id: "faq-gift",
    question: "Can I send it as a gift?",
    answer: "Yes. Tick “This is a gift” in your cart, add a note of up to 150 characters, and we leave prices off the packing slip.",
    topic: "gifts",
  },
];

const item = (id: string, title: string, href: string, items: Menu["items"] = []) => ({ id, title, href, items });

export const MENUS: Menu[] = [
  {
    handle: "main-menu",
    items: [
      item("m1", "Shop Matcha", "/collections/matcha", [
        item("m1a", "All matcha", "/collections/matcha"),
        item("m1b", "Which Matcha Today?", "/collections/matcha#taste"),
        item("m1c", "Gifts & sets", "/collections/gifts"),
        item("m1d", "Accessories", "/collections/accessories"),
      ]),
      item("m2", "Gifts", "/collections/gifts"),
      item("m3", "Brewing Guides", "/blogs/brewing-guides"),
      item("m4", "Witcha Academy", "/pages/academy"),
      item("m5", "Our Story", "/pages/our-story"),
    ],
  },
  {
    handle: "footer",
    items: [
      item("f1", "Shop", "/collections/matcha", [
        item("f1a", "Shop Matcha", "/collections/matcha"),
        item("f1b", "Gifts", "/collections/gifts"),
        item("f1c", "Accessories", "/collections/accessories"),
      ]),
      item("f2", "Learn", "/blogs/brewing-guides", [
        item("f2a", "Brewing Guides", "/blogs/brewing-guides"),
        item("f2b", "Witcha Academy", "/pages/academy"),
        item("f2c", "Our Story", "/pages/our-story"),
      ]),
      item("f3", "Help", "/pages/faq", [
        item("f3a", "FAQ", "/pages/faq"),
        item("f3b", "Shipping & Returns", "/pages/shipping-returns"),
        item("f3c", "Contact", "/pages/contact"),
        item("f3d", "Privacy", "/policies/privacy-policy"),
        item("f3e", "Terms", "/policies/terms-of-service"),
        item("f3f", "Refunds", "/policies/refund-policy"),
      ]),
    ],
  },
];

export const POLICIES = [
  { handle: "privacy-policy", title: "Privacy policy" },
  { handle: "terms-of-service", title: "Terms of service" },
  { handle: "refund-policy", title: "Refund policy" },
  { handle: "shipping-policy", title: "Shipping policy" },
].map((p) => ({
  ...p,
  bodyHtml: `<p>[${p.title} pending. In Shopify mode this text comes from Settings → Policies.]</p>`,
  url: `/policies/${p.handle}`,
}));

/** Placeholder checkout used in fixtures mode; e2e asserts navigation here. */
export const FIXTURE_CHECKOUT_ORIGIN = "https://checkout.fixtures.invalid";
