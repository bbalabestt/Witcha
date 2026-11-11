import { cartTotals } from "@/lib/data/cart-math";
import { money } from "@/lib/data/money";
import { normaliseCompareAt, teaTypeFrom } from "@/lib/data/product";
import { GIFT_NOTE_MAX } from "@/lib/data/repository";
import type {
  Cart,
  CartLine,
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

function kindFor(productType: string, tags: string[]): ProductKind {
  const t = `${productType} ${tags.join(" ")}`.toLowerCase();
  if (/\bgift/.test(t)) return "gift";
  if (/tool|accessor/.test(t)) return "tool";
  return "tea";
}

function fields(obj: SMetaobject): Record<string, { value: string | null; image: SImage | null }> {
  return Object.fromEntries(obj.fields.map((f) => [f.key, { value: f.value, image: f.reference?.image ?? null }]));
}

export function mapVariant(v: SProduct["variants"]["nodes"][number], opts: MapOptions): Variant {
  const price = mapMoney(v.price, opts);
  return {
    id: v.id,
    sku: v.sku ?? "",
    title: v.title === "Default Title" ? "" : v.title,
    price,
    compareAtPrice: normaliseCompareAt(price, v.compareAtPrice ? mapMoney(v.compareAtPrice, opts) : null),
    availableForSale: v.availableForSale,
    quantityAvailable: v.quantityAvailable,
  };
}

/** Product title is the full customer name, "Academy title — descriptor". Empty metafields hide their block. */
export function mapProduct(p: SProduct, opts: MapOptions): Product {
  const variants = p.variants.nodes.map((v) => mapVariant(v, opts));
  const images = p.images.nodes.map((img) => mapImage(img, p.title)).filter((i): i is Image => i !== null);
  // The pack shot sits on a soft panel; lifestyle images fill the frame.
  const gallery: GalleryItem[] = images.map((image, i) => ({ image, fit: i === 0 ? "contain" : "cover" }));
  const kind = kindFor(p.productType, p.tags);
  const type = text(p.teaType);
  const origin = text(p.originRegion);
  const [academyTitle = p.title, titleDescriptor = ""] = p.title.split(" — ");
  const compareHandle = p.compareProduct?.reference?.handle;
  const compareLine = text(p.compareLine);
  return {
    id: p.id,
    handle: p.handle,
    kind,
    title: p.title,
    academyTitle,
    descriptor: text(p.descriptor) ?? titleDescriptor,
    teaType: kind === "tea" ? teaTypeFrom(`${type ?? ""} ${p.productType} ${p.title}`) : null,
    detailLine: text(p.detailLine),
    description: p.description,
    seoDescription: p.seo?.description?.trim() || null,
    tags: p.tags,
    // Vendor list: "The Professor — Yame Matcha, 30 g white tin". Hojicha is in the black tin.
    tin: mapImage(p.featuredImage, `${p.title}, 30 g ${/hojicha/i.test(p.title) ? "black" : "white"} tin`),
    gallery,
    variants,
    tastingNotes: list(p.tastingNotes).slice(0, 3),
    bestForShort: text(p.bestForShort),
    bestFor: text(p.bestFor),
    chooseItIf: text(p.chooseItIf),
    compare: compareHandle && compareLine ? { handle: compareHandle, line: compareLine } : null,
    facts:
      type && origin
        ? {
            type,
            origin,
            cultivar: text(p.cultivar),
            harvest: text(p.harvest),
            ingredients: text(p.ingredients),
            netWeight: text(p.netWeight) ?? variants[0]?.title ?? "",
            packedIn: text(p.packedIn) ?? "",
            caffeine: text(p.caffeine) ?? "",
          }
        : null,
    storageNote: text(p.storageNote),
    servingsNote: text(p.servingsNote),
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
  const str = (k: string) => f[k]?.value?.trim() || null;
  const num = (k: string) => {
    const n = Number(f[k]?.value);
    return Number.isFinite(n) && f[k]?.value ? money(n, opts.placeholderPrices) : null;
  };
  return {
    freeShippingThreshold: num("free_shipping_threshold"),
    standardShipping: num("standard_shipping"),
    expressShipping: num("express_shipping"),
    dispatchDays: str("dispatch_days"),
    dispatchCity: str("dispatch_city"),
    deliveryDays: str("delivery_days"),
    expressDays: str("express_days"),
    returnsDays: str("returns_days"),
    refundDays: str("refund_days"),
    giftCutoff: str("gift_cutoff"),
    supportEmail: str("support_email"),
    replyTime: str("reply_time"),
    legalEntity: str("legal_entity") ?? fallback.legalEntity,
    abn: str("abn") ?? fallback.abn,
  };
}

export function mapCart(c: SCart, opts: MapOptions): Cart {
  const lines: CartLine[] = c.lines.nodes.map((l) => {
    const m = l.merchandise;
    const kind = kindFor(m.product.productType, []);
    return {
      id: l.id,
      merchandiseId: m.id,
      quantity: l.quantity,
      cost: mapMoney(l.cost.totalAmount, opts),
      product: {
        handle: m.product.handle,
        title: m.product.title,
        kind,
        teaType: kind === "tea" ? teaTypeFrom(`${m.product.productType} ${m.product.title}`) : null,
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
