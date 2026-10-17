import { money } from "../money";
import { badgeFor, normaliseCompareAt } from "../product";
import type { Character, FaqEntry, GalleryItem, Guide, Image, Policy, PrepMethod, Product, Variant } from "../types";
import { ART } from "./art";

/**
 * Prototype V4 fixture content (design/prototype-v4.dc.html `data`). Prices, names and facts in brackets are
 * deliberate placeholders; there are no reviews. `pnpm dev` runs on this with no Shopify credentials.
 */

const P = true; // every fixture price is a placeholder

function variant(id: string, title: string, price: number, qty: number, servings: number | null, compareAt?: number): Variant {
  const p = money(price, P);
  return {
    id,
    title,
    price: p,
    compareAtPrice: normaliseCompareAt(p, compareAt === undefined ? null : money(compareAt, P)),
    availableForSale: qty > 0,
    quantityAvailable: qty,
    servings,
  };
}

const PLACEHOLDER_SLOTS = {
  powder: { kind: "placeholder", label: "POWDER COLOUR (TRUE)" },
  scale: { kind: "placeholder", label: "SIZE / SCALE SHOT" },
} as const satisfies Record<string, GalleryItem>;

function teaGallery(tin: Image, key: Image, hojicha = false): GalleryItem[] {
  return [
    { kind: "image", image: tin, fit: "contain", label: "TIN PACK SHOT" },
    PLACEHOLDER_SLOTS.powder,
    { kind: "image", image: hojicha ? ART.hojichaLatte : ART.whisking, fit: "cover", label: "HANDS WHISKING" },
    { kind: "image", image: hojicha ? ART.everyday : ART.iced, fit: "cover", label: "ICED LATTE" },
    { kind: "image", image: key, fit: "contain", label: "TIN + ARCH ART" },
    PLACEHOLDER_SLOTS.scale,
  ];
}

export const CHARACTERS: Character[] = [
  {
    handle: "the-professor",
    name: "The Professor",
    namePending: false,
    role: "Keeper of the reserve tea",
    story: null,
    accessory: null,
    art: ART.professorKey,
    concept: false,
    productHandle: "yame-no-mukashi",
  },
  {
    handle: "the-charmer",
    name: "The Charmer",
    namePending: false,
    role: "Keeper of the deep tea",
    story: null,
    accessory: null,
    art: ART.charmerKey,
    concept: false,
    productHandle: "the-charmer",
  },
  {
    handle: "kosen-keeper",
    name: "[Name pending]",
    namePending: true,
    role: "Keeper of the daily tea",
    story: null,
    accessory: null,
    art: ART.kosenKey,
    concept: false,
    productHandle: "kosen-daily-matcha",
  },
  {
    handle: "tea-room-keeper",
    name: "[Name pending]",
    namePending: true,
    role: "Keeper of the tea room",
    story: null,
    accessory: null,
    art: ART.hojichaKey,
    concept: false,
    productHandle: "organic-hojicha",
  },
  {
    handle: "the-dreamer",
    name: "The Dreamer",
    namePending: false,
    role: "A new student",
    story: null,
    accessory: null,
    art: ART.dreamerKey,
    concept: true,
    productHandle: null,
  },
];

function character(handle: string): Character | null {
  return CHARACTERS.find((c) => c.handle === handle) ?? null;
}

const FACT_DEFAULTS = { grade: "[Grade description]", packDate: "[Pack date note]", ingredients: "100% green tea (matcha)" };

function tea(input: Omit<Product, "id" | "kind" | "badge" | "pending" | "storageNote">): Product {
  return { ...input, id: `fx-${input.handle}`, kind: "tea", badge: badgeFor(input.tags, input.variants), pending: false, storageNote: null };
}

export const PRODUCTS: Product[] = [
  tea({
    handle: "yame-no-mukashi",
    title: "Yame no Mukashi",
    description:
      "The Professor keeps the deep tea at the Academy. Expect nutty, umami and mellow notes. From Yame in Fukuoka, 100% Okumidori, first harvest. Lovely whisked or as a latte.",
    tags: ["new"],
    tin: ART.professorTin,
    gallery: teaGallery(ART.professorTin, ART.professorKey),
    variants: [variant("y30", "30 g", 48, 12, 15), variant("y100", "100 g", 140, 0, 50)],
    taste: { position: 4, word: "Deep", tier: "Reserve" },
    tastingNotes: ["Nutty", "Umami", "Mellow"],
    bestFor: ["Latte", "Straight", "Iced"],
    facts: { origin: "Yame, Fukuoka", cultivar: "100% Okumidori", harvest: "First harvest", netWeight: "30 g", ...FACT_DEFAULTS },
    character: character("the-professor"),
  }),
  tea({
    handle: "kosen-daily-matcha",
    title: "Kosen Daily Matcha",
    description:
      "The Kosen keeper looks after the everyday tea at the Academy. Expect toasted, nutty and easy-going notes. From Shizuoka, Kagoshima and Uji, a first and second harvest blend. Lovely as a latte or over ice.",
    tags: [],
    tin: ART.kosenTin,
    gallery: teaGallery(ART.kosenTin, ART.kosenKey),
    variants: [variant("d30", "30 g", 32, 3, 15)],
    taste: { position: 2, word: "Bright", tier: "Daily" },
    tastingNotes: ["Toasted", "Nutty", "Easy-going"],
    bestFor: ["Latte", "Iced"],
    facts: {
      origin: "Shizuoka · Kagoshima · Uji",
      cultivar: "Saemidori · Yabukita · Yutakamidori",
      harvest: "First and second harvest blend",
      netWeight: "30 g",
      ...FACT_DEFAULTS,
    },
    character: character("kosen-keeper"),
  }),
  tea({
    handle: "the-charmer",
    title: "The Charmer",
    description:
      "The Charmer keeps the deepest tea at the Academy. Expect intense nuttiness, deep-roasted notes and a gentle sweetness. From Kagoshima, an Okumidori blend, first harvest. Lovely whisked or as a latte.",
    tags: [],
    tin: ART.charmerTin,
    gallery: teaGallery(ART.charmerTin, ART.charmerKey),
    variants: [variant("c30", "30 g", 52, 9, 15)],
    taste: { position: 5, word: "Deep", tier: "Reserve" },
    tastingNotes: ["Nutty", "Roasted", "Gently sweet"],
    bestFor: ["Latte", "Straight"],
    facts: { origin: "Kagoshima", cultivar: "Okumidori blend", harvest: "First harvest", netWeight: "30 g", ...FACT_DEFAULTS },
    character: character("the-charmer"),
  }),
  tea({
    handle: "organic-hojicha",
    title: "Organic Hojicha",
    description:
      "The tea-room keeper looks after the roasted tea at the Academy. Expect smoky, chocolatey notes and a warm, caramel-like finish. From Uji, a Yabukita blend. Lovely as a latte.",
    tags: [],
    tin: ART.hojichaTin,
    gallery: teaGallery(ART.hojichaTin, ART.hojichaKey, true),
    variants: [variant("h40", "40 g", 30, 20, 13)],
    taste: { position: 5, word: "Deep", tier: "Roasted" },
    tastingNotes: ["Smoky", "Chocolatey", "Caramel"],
    bestFor: ["Latte"],
    facts: {
      origin: "Uji, Kyoto",
      cultivar: "Yabukita blend",
      harvest: "Blended harvest",
      netWeight: "40 g",
      ...FACT_DEFAULTS,
      ingredients: "100% roasted green tea (hojicha)",
    },
    character: character("tea-room-keeper"),
  }),
  {
    id: "fx-discovery-set",
    handle: "discovery-set",
    kind: "gift",
    title: "[Two-tin discovery set]",
    description: "Bright and deep, side by side. Gift note included.",
    tags: ["gift"],
    badge: null,
    tin: ART.kosenTin,
    gallery: [
      { kind: "image", image: ART.kosenTin, fit: "contain", label: "GIFT SET" },
      { kind: "image", image: ART.professorTin, fit: "contain", label: "GIFT SET" },
    ],
    variants: [variant("g-set", "Set of 2", 76, 10, null)],
    taste: null,
    tastingNotes: [],
    bestFor: [],
    facts: null,
    storageNote: null,
    character: null,
    pending: true,
  },
  {
    id: "fx-tin-and-whisk",
    handle: "tin-and-whisk",
    kind: "gift",
    title: "[Tin + bamboo whisk]",
    description: "Everything needed to start whisking.",
    tags: ["gift"],
    badge: null,
    tin: ART.professorTin,
    gallery: [{ kind: "image", image: ART.professorTin, fit: "contain", label: "GIFT SET" }],
    variants: [variant("g-tool", "Set", 70, 10, null)],
    taste: null,
    tastingNotes: [],
    bestFor: [],
    facts: null,
    storageNote: null,
    character: null,
    pending: true,
  },
  {
    id: "fx-bamboo-whisk",
    handle: "bamboo-whisk",
    kind: "tool",
    title: "Bamboo whisk (chasen)",
    description: "A hundred-prong bamboo whisk for straight cups.",
    tags: ["accessory"],
    badge: null,
    tin: null,
    gallery: [{ kind: "placeholder", label: "TOOL PHOTO" }],
    variants: [variant("t-whisk", "1 piece", 28, 10, null)],
    taste: null,
    tastingNotes: [],
    bestFor: [],
    facts: null,
    storageNote: null,
    character: null,
    pending: false,
  },
  {
    id: "fx-handheld-frother",
    handle: "handheld-frother",
    kind: "tool",
    title: "Handheld frother",
    description: "For lattes in under a minute.",
    tags: ["accessory"],
    badge: null,
    tin: null,
    gallery: [{ kind: "placeholder", label: "TOOL PHOTO" }],
    variants: [variant("t-froth", "1 piece", 22, 10, null)],
    taste: null,
    tastingNotes: [],
    bestFor: [],
    facts: null,
    storageNote: null,
    character: null,
    pending: false,
  },
];

export const COLLECTIONS: Record<string, { title: string; description: string; handles: string[] }> = {
  matcha: {
    title: "Which Matcha Today?",
    description:
      "Choose by taste. Bright teas are fresh and lively; deep teas are rounder and richer, and hold up beautifully in milk.",
    handles: ["yame-no-mukashi", "kosen-daily-matcha", "the-charmer", "organic-hojicha"],
  },
  gifts: {
    title: "Gifts with a little magic",
    description: "Tick “This is a gift” in your cart and write a note of up to 150 characters. Prices stay off the packing slip.",
    handles: ["discovery-set", "tin-and-whisk", "yame-no-mukashi", "kosen-daily-matcha", "the-charmer", "organic-hojicha"],
  },
  accessories: {
    title: "Accessories",
    description: "The few tools that make good matcha easy: a whisk for straight cups, a frother for lattes.",
    handles: ["bamboo-whisk", "handheld-frother"],
  },
};

export const PREP_METHODS: PrepMethod[] = [
  {
    id: "whisk",
    name: "Whisk",
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
    poster: ART.whisking,
    summary: "2 g · 70 ml at 80°C · 2 min",
  },
  {
    id: "frother",
    name: "Frother",
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
    poster: ART.everyday,
    summary: "2 g · 30 ml · 180 ml milk",
  },
  {
    id: "shaker",
    name: "Shaker",
    grams: "2 g",
    water: "60 ml · cold",
    milk: "150 ml",
    time: "2 min",
    steps: ["Add 2 g and 60 ml cold water to a shaker.", "Close tight. Shake hard for 20 seconds.", "Pour over ice and milk."],
    videoUrl: null,
    poster: ART.iced,
    summary: "2 g · 60 ml cold · 20 s",
  },
  {
    id: "iced",
    name: "Iced latte",
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
    poster: ART.iced,
    summary: "2 g · 40 ml · over ice",
  },
];

function guideImage(method: string): Image {
  return method === "shaker" || method === "iced" ? ART.iced : method === "frother" ? ART.everyday : ART.whisking;
}

function guide(handle: string, title: string, method: Guide["method"], time: string, serves: string, troubleshooting = false): Guide {
  return { handle, title, method, time, serves, image: guideImage(method), contentHtml: null, troubleshooting };
}

export const GUIDES: Guide[] = [
  guide("how-to-whisk-matcha", "How to whisk matcha", "whisk", "3 min", "1"),
  guide("a-frothed-matcha-latte", "A frothed matcha latte", "frother", "4 min", "1"),
  guide("shaken-iced-matcha", "Shaken iced matcha", "shaker", "3 min", "1"),
  guide("iced-latte-poured-over", "Iced latte, poured over", "iced", "2 min", "1"),
  guide("clumps-bitterness-dull-colour", "Clumps, bitterness, dull colour: fixes", "whisk", "5 min read", "—", true),
  guide("oat-almond-or-dairy", "Oat, almond or dairy?", "frother", "4 min read", "—"),
];

export const FAQ: FaqEntry[] = [
  {
    id: "lattes",
    question: "Is it good for lattes?",
    answer: "Yes. The deep tea holds its flavour through milk; the bright tea is lighter and lovely over ice.",
    category: "tea",
    onProduct: true,
  },
  {
    id: "store",
    question: "How do I store it?",
    answer: "Keep the tin closed tight, somewhere cool and dry, away from sunlight. Once opened, enjoy it within [opened shelf-life].",
    category: "tea",
    onProduct: true,
  },
  {
    id: "per-serve",
    question: "How much is it per serve?",
    answer: "A 30 g tin makes about 15 serves at 2 g each, so roughly $[3.20] a cup.",
    category: "making",
    onProduct: true,
  },
  {
    id: "arrive",
    question: "When will it arrive?",
    answer: "We dispatch from [city] within [x] business days. Metro Australia usually arrives [x–y] business days after that.",
    category: "orders",
    onProduct: true,
  },
  {
    id: "gift",
    question: "Can I send it as a gift?",
    answer: "Yes. Tick “This is a gift” in your cart, add a note of up to 150 characters, and we leave prices off the packing slip.",
    category: "gifts",
    onProduct: true,
  },
];

export const POLICIES: Policy[] = [
  { handle: "privacy-policy", title: "Privacy Policy", body: "[Privacy policy text from Shopify admin → Settings → Policies.]" },
  { handle: "terms-of-service", title: "Terms of Service", body: "[Terms of service text from Shopify admin → Settings → Policies.]" },
  { handle: "refund-policy", title: "Refund Policy", body: "[Refund policy text from Shopify admin → Settings → Policies.]" },
  { handle: "shipping-policy", title: "Shipping Policy", body: "[Shipping policy text from Shopify admin → Settings → Policies.]" },
];
