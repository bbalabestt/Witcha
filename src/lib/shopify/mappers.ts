import { cartTotals } from "@/lib/data/cart-math";
import { money } from "@/lib/data/money";
import { badgeFor, eyebrow, normaliseCompareAt } from "@/lib/data/product";
import { GIFT_NOTE_MAX } from "@/lib/data/repository";
import type {
  BestFor,
  Cart,
  CartLine,
  Character,
  FaqCategory,
  FaqEntry,
  GalleryItem,
  Guide,
  Image,
  MethodId,
  Money,
  PrepMethod,
  Product,
  ProductKind,
  SiteSettings,
  Taste,
  Variant,
} from "@/lib/data/types";
import type { SArticle, SCart, SImage, SMetafield, SMetaobject, SMoney, SProduct } from "./types";

export type MapOptions = { placeholderPrices: boolean };

export function mapMoney(m: SMoney, opts: MapOptions): Money {
  return money(Number(m.amount), opts.placeholderPrices);
}

export function mapImage(img: SImage | null | undefined, fallbackAlt: string): Image | null {
  if (!img) return null;
  return { url: img.url, alt: img.altText?.trim() || fallbackAlt, width: img.width ?? 1200, height: img.height ?? 1200 };
}

function text(m: SMetafield): string | null {
  const v = m?.value?.trim();
  return v ? v : null;
}

/** List metafields arrive as a JSON array string. */
export function list(m: SMetafield): string[] {
  const v = text(m);
  if (!v) return [];
  try {
    const parsed: unknown = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [v];
  } catch {
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

function int(m: SMetafield): number | null {
  const n = Number(text(m));
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

/** Taste word when `custom.taste_role` is not set: positions 1–2 bright, 3 balanced, 4–5 deep. */
export function tasteWordFor(position: number): string {
  return position <= 2 ? "Bright" : position === 3 ? "Balanced" : "Deep";
}

export function mapTaste(position: SMetafield, tier: SMetafield, word: SMetafield): Taste | null {
  const p = int(position);
  if (!p || p > 5) return null;
  return { position: p as Taste["position"], tier: text(tier) ?? "", word: text(word) ?? tasteWordFor(p) };
}

function kindFor(productType: string, tags: string[]): ProductKind {
  const t = `${productType} ${tags.join(" ")}`.toLowerCase();
  if (/\bgift/.test(t)) return "gift";
  if (/tool|accessor/.test(t)) return "tool";
  return "tea";
}

function fields(obj: SMetaobject): Record<string, { value: string | null; image: SImage | null }> {
  return Object.fromEntries(obj.fields.map((f) => [f.key, { value: f.value, image: f.reference?.image ?? null }]));
}

export function mapCharacter(obj: SMetaobject | null | undefined): Character | null {
  if (!obj) return null;
  const f = fields(obj);
  const name = f.name?.value?.trim() ?? "";
  return {
    handle: obj.handle,
    name: name || "[Name pending]",
    namePending: !name,
    role: f.taste_role?.value ?? "",
    story: f.story?.value ?? null,
    accessory: f.accessory?.value ?? null,
    art: mapImage(f.art?.image, name || "Character art"),
    concept: f.concept?.value === "true",
    productHandle: f.product_handle?.value ?? null,
  };
}

export function mapVariant(v: SProduct["variants"]["nodes"][number], productServings: number | null, opts: MapOptions): Variant {
  const price = mapMoney(v.price, opts);
  return {
    id: v.id,
    title: v.title === "Default Title" ? "" : v.title,
    price,
    compareAtPrice: normaliseCompareAt(price, v.compareAtPrice ? mapMoney(v.compareAtPrice, opts) : null),
    availableForSale: v.availableForSale,
    quantityAvailable: v.quantityAvailable,
    servings: int(v.servings) ?? productServings,
  };
}

const GALLERY_LABELS = ["TIN PACK SHOT", "POWDER COLOUR (TRUE)", "HANDS WHISKING", "ICED LATTE", "TIN + ARCH ART", "SIZE / SCALE SHOT"];

export function mapProduct(p: SProduct, opts: MapOptions): Product {
  const servings = int(p.servings);
  const variants = p.variants.nodes.map((v) => mapVariant(v, servings, opts));
  const images = p.images.nodes.map((img) => mapImage(img, p.title)).filter((i): i is Image => i !== null);
  const gallery: GalleryItem[] = images.map((image, i) => ({
    kind: "image",
    image,
    // The pack shot sits on a soft panel; lifestyle images fill the frame.
    fit: i === 0 ? "contain" : "cover",
    label: GALLERY_LABELS[i] ?? "PRODUCT PHOTO",
  }));
  const origin = text(p.originRegion);
  const kind = kindFor(p.productType, p.tags);
  return {
    id: p.id,
    handle: p.handle,
    kind,
    title: p.title,
    description: p.description,
    tags: p.tags,
    badge: badgeFor(p.tags, variants),
    tin: mapImage(p.featuredImage, p.title),
    gallery: gallery.length ? gallery : [{ kind: "placeholder", label: "PRODUCT PHOTO" }],
    variants,
    taste: kind === "tea" ? mapTaste(p.tastePosition, p.tier, p.tasteWord) : null,
    tastingNotes: list(p.tastingNotes).slice(0, 3),
    bestFor: list(p.bestFor).filter((b): b is BestFor => b === "Latte" || b === "Straight" || b === "Iced"),
    facts: origin
      ? {
          origin,
          cultivar: text(p.cultivar) ?? "",
          harvest: text(p.harvest) ?? "",
          grade: text(p.gradeDescription) ?? "",
          netWeight: text(p.netWeight) ?? variants[0]?.title ?? "",
          packDate: text(p.packDateNote) ?? "",
          ingredients: text(p.ingredients) ?? "",
        }
      : null,
    storageNote: text(p.storageNote),
    character: mapCharacter(p.character?.reference),
    pending: text(p.pending) === "true",
  };
}

const METHODS: MethodId[] = ["whisk", "frother", "shaker", "iced"];

function methodId(value: string | null | undefined): MethodId {
  const v = (value ?? "").toLowerCase();
  return METHODS.find((m) => v.startsWith(m)) ?? "whisk";
}

export function mapGuide(a: SArticle): Guide | null {
  const image = mapImage(a.image, a.title);
  if (!image) return null;
  return {
    handle: a.handle,
    title: a.title,
    method: methodId(text(a.method)),
    time: text(a.time) ?? "",
    serves: text(a.serves) ?? "—",
    image,
    contentHtml: a.contentHtml || null,
    troubleshooting: text(a.troubleshooting) === "true",
  };
}

export function mapPrepMethod(obj: SMetaobject): PrepMethod | null {
  const f = fields(obj);
  const poster = mapImage(f.poster?.image, `${f.method?.value ?? "Matcha"} method photo`);
  if (!poster) return null;
  const id = methodId(f.method?.value);
  const grams = f.grams?.value ? `${f.grams.value} g` : "2 g";
  const water = [f.water_ml?.value && `${f.water_ml.value} ml`, f.temp_c?.value ? `${f.temp_c.value}°C` : "cold"].filter(Boolean).join(" · ");
  const milk = f.milk_ml?.value ? `${f.milk_ml.value} ml` : "—";
  let steps: string[] = [];
  try {
    steps = JSON.parse(f.steps?.value ?? "[]") as string[];
  } catch {
    steps = (f.steps?.value ?? "").split("\n").filter(Boolean);
  }
  return {
    id,
    name: f.name?.value ?? id,
    grams,
    water,
    milk,
    time: f.time?.value ?? "",
    steps,
    videoUrl: f.video_url?.value ?? null,
    poster,
    summary: f.summary?.value ?? `${grams} · ${water}`,
  };
}

export function mapFaq(obj: SMetaobject): FaqEntry | null {
  const f = fields(obj);
  if (!f.question?.value || !f.answer?.value) return null;
  const cat = (f.category?.value ?? "tea").toLowerCase();
  const category: FaqCategory = cat === "making" || cat === "orders" || cat === "gifts" ? cat : "tea";
  return { id: obj.handle, question: f.question.value, answer: f.answer.value, category, onProduct: f.on_product?.value !== "false" };
}

export function mapSiteSettings(obj: SMetaobject | null, fallback: SiteSettings, opts: MapOptions): SiteSettings {
  if (!obj) return fallback;
  const f = fields(obj);
  const str = (k: string, d: string) => f[k]?.value?.trim() || d;
  const num = (k: string, d: Money) => {
    const n = Number(f[k]?.value);
    return Number.isFinite(n) && f[k]?.value ? money(n, opts.placeholderPrices) : d;
  };
  return {
    freeShippingThreshold: num("free_shipping_threshold", fallback.freeShippingThreshold),
    standardShipping: num("standard_shipping", fallback.standardShipping),
    expressShipping: num("express_shipping", fallback.expressShipping),
    dispatchDays: str("dispatch_days", fallback.dispatchDays),
    dispatchCity: str("dispatch_city", fallback.dispatchCity),
    deliveryDays: str("delivery_days", fallback.deliveryDays),
    expressDays: str("express_days", fallback.expressDays),
    returnsDays: str("returns_days", fallback.returnsDays),
    refundDays: str("refund_days", fallback.refundDays),
    lowStockThreshold: Number(f.low_stock_threshold?.value) || fallback.lowStockThreshold,
    giftCutoff: str("gift_cutoff", fallback.giftCutoff),
    openedShelfLife: str("opened_shelf_life", fallback.openedShelfLife),
    supportEmail: str("support_email", fallback.supportEmail),
    abn: str("abn", fallback.abn),
    replyTime: str("reply_time", fallback.replyTime),
  };
}

export function mapCart(c: SCart, opts: MapOptions): Cart {
  const lines: CartLine[] = c.lines.nodes.map((l) => {
    const m = l.merchandise;
    const kind = kindFor(m.product.productType, []);
    const taste = mapTaste(m.product.tastePosition, m.product.tier, m.product.tasteWord);
    return {
      id: l.id,
      merchandiseId: m.id,
      quantity: l.quantity,
      cost: mapMoney(l.cost.totalAmount, opts),
      product: {
        handle: m.product.handle,
        title: m.product.title,
        kind,
        eyebrow: eyebrow({ kind, taste }),
        tin: mapImage(m.product.featuredImage, m.product.title),
      },
      variant: {
        title: m.title === "Default Title" ? "" : m.title,
        price: mapMoney(m.price, opts),
        availableForSale: m.availableForSale,
        quantityAvailable: m.quantityAvailable,
      },
    };
  });
  const attr = (k: string) => c.attributes.find((a) => a.key === k)?.value ?? "";
  const gift = attr("gift") === "yes";
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    lines,
    ...cartTotals(lines, opts.placeholderPrices),
    subtotal: mapMoney(c.cost.subtotalAmount, opts),
    gift,
    giftNote: gift ? attr("gift_note").slice(0, GIFT_NOTE_MAX) : "",
  };
}
