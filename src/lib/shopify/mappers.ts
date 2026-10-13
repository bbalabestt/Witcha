import { SITE_SETTINGS_FALLBACK } from "@/lib/config/site";
import { effectiveCompareAt, money, toMinorUnits } from "@/lib/data/money";
import { badgesFromTags, parseBestFor, productEyebrow, productKind, tasteProfile } from "@/lib/data/product";
import type {
  Article,
  Cart,
  Character,
  Collection,
  ContentPage,
  FaqEntry,
  FilterGroup,
  Image,
  Media,
  Menu,
  MenuItem,
  Money,
  PrepMethod,
  PrepMethodName,
  Product,
  ProductFilter,
  SiteSettings,
  SortKey,
  Variant,
} from "@/lib/data/types";
import { sanitizeMerchantHtml } from "./sanitize";
import type {
  SfArticle,
  SfCart,
  SfCollection,
  SfFilter,
  SfImage,
  SfMenuItem,
  SfMetafield,
  SfMetaobject,
  SfMoney,
  SfPolicy,
  SfProduct,
  SfVariant,
} from "./types";

/* ---------- primitives ---------- */

export function mapMoney(m: SfMoney): Money {
  return money(toMinorUnits(m.amount), m.currencyCode);
}

export function mapImage(img: SfImage | null | undefined, fallbackAlt: string): Image | null {
  if (!img?.url) return null;
  return { url: img.url, alt: img.altText?.trim() || fallbackAlt, width: img.width ?? 1200, height: img.height ?? 1500 };
}

function imageMedia(img: SfImage | null | undefined, fallbackAlt: string): Media | null {
  const i = mapImage(img, fallbackAlt);
  return i ? { kind: "image", ...i } : null;
}

function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).map((s) => s.trim()).filter(Boolean);
  } catch {
    // Not JSON: a plain multi-line text field.
  }
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIntOrNull(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function isMetaobject(x: unknown): x is SfMetaobject {
  return typeof x === "object" && x !== null && "fields" in x && Array.isArray((x as SfMetaobject).fields);
}

function fieldMap(mo: SfMetaobject) {
  const get = (key: string) => mo.fields.find((f) => f.key === key);
  return {
    text: (key: string) => get(key)?.value?.trim() || null,
    image: (key: string) => get(key)?.reference?.image ?? null,
  };
}

/* ---------- metaobjects ---------- */

const PREP_ICONS: Record<PrepMethodName, PrepMethod["icon"]> = { Whisk: "whisk", Frother: "frother", Shaker: "shaker", "Iced latte": "iced" };

function prepMethodName(raw: string | null): PrepMethodName | null {
  const v = raw?.trim().toLowerCase() ?? "";
  if (v.startsWith("whisk")) return "Whisk";
  if (v.startsWith("froth")) return "Frother";
  if (v.startsWith("shak")) return "Shaker";
  if (v.startsWith("iced")) return "Iced latte";
  return null;
}

export function mapPrepMethod(mo: SfMetaobject): PrepMethod | null {
  const f = fieldMap(mo);
  const method = prepMethodName(f.text("method"));
  if (!method) return null;
  const grams = f.text("grams");
  const waterMl = f.text("water_ml");
  const temp = f.text("temp_c");
  const milkMl = f.text("milk_ml");
  const tempText = !temp ? null : /^\d+$/.test(temp) ? `${temp}°C` : temp;
  return {
    method,
    icon: PREP_ICONS[method],
    grams: grams ? `${grams} g` : "—",
    water: waterMl ? [`${waterMl} ml`, tempText].filter(Boolean).join(" · ") : "—",
    milk: milkMl && milkMl !== "0" ? `${milkMl} ml` : "—",
    time: f.text("time") ?? "—",
    steps: parseList(f.text("steps")),
    videoUrl: f.text("video_url"),
  };
}

export function mapCharacter(mo: SfMetaobject): Character | null {
  const f = fieldMap(mo);
  const name = f.text("name");
  if (!name) return null;
  return {
    name,
    tasteRole: f.text("taste_role") ?? "",
    story: f.text("story") ?? "",
    art: imageMedia(f.image("art"), `${name}, Witcha Academy character art`) ?? { kind: "placeholder", label: "CHARACTER ART · PENDING ARTIST" },
    accessory: f.text("accessory"),
  };
}

/* ---------- product ---------- */

function metafieldsByKey(list: SfMetafield[]): Map<string, NonNullable<SfMetafield>> {
  const m = new Map<string, NonNullable<SfMetafield>>();
  for (const mf of list) if (mf) m.set(mf.key, mf);
  return m;
}

function sizeOf(v: SfVariant): string {
  const opt = v.selectedOptions.find((o) => o.name.toLowerCase() === "size");
  if (opt) return opt.value;
  return v.title === "Default Title" ? "One size" : v.title;
}

export function mapVariant(v: SfVariant, productTitle: string): Variant {
  const price = mapMoney(v.price);
  return {
    id: v.id,
    title: v.title,
    size: sizeOf(v),
    selectedOptions: v.selectedOptions,
    price,
    compareAtPrice: effectiveCompareAt(price, v.compareAtPrice ? mapMoney(v.compareAtPrice) : null),
    availableForSale: v.availableForSale,
    quantityAvailable: typeof v.quantityAvailable === "number" ? v.quantityAvailable : null,
    servings: parseIntOrNull(v.servings?.value),
    image: imageMedia(v.image, productTitle),
    sku: v.sku || null,
  };
}

export function mapProduct(p: SfProduct): Product {
  const mf = metafieldsByKey(p.metafields ?? []);
  const text = (k: string) => mf.get(k)?.value?.trim() || null;
  const variants = p.variants.nodes.map((v) => mapVariant(v, p.title));
  const onSale = variants.some((v) => v.compareAtPrice !== null);
  const productServings = parseIntOrNull(text("servings"));

  const charRef = mf.get("character")?.reference;
  const prepRefs = mf.get("prep_methods")?.references?.nodes ?? [];

  const media = p.images.nodes.map((img, i) => imageMedia(img, i === 0 ? p.title : `${p.title}, image ${i + 1}`)).filter((m): m is Media => m !== null);

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    kind: productKind(p.productType, p.tags),
    descriptionHtml: sanitizeMerchantHtml(p.descriptionHtml),
    description: p.description,
    taste: tasteProfile(text("taste_position"), text("tier")),
    tastingNotes: parseList(text("tasting_notes")).slice(0, 3),
    bestFor: parseBestFor(parseList(text("best_for"))),
    facts: {
      originRegion: text("origin_region"),
      cultivar: text("cultivar"),
      harvest: text("harvest"),
      grade: text("grade_description"),
      packDateNote: text("pack_date_note"),
      netWeight: text("net_weight"),
      ingredients: text("ingredients"),
    },
    storageNote: text("storage_note"),
    servings: productServings,
    prepMethods: prepRefs.filter(isMetaobject).map(mapPrepMethod).filter((x): x is PrepMethod => x !== null),
    character: isMetaobject(charRef) ? mapCharacter(charRef) : null,
    badges: badgesFromTags(p.tags, onSale),
    tags: p.tags,
    media: media.length ? media : [{ kind: "placeholder", label: "PRODUCT IMAGE PENDING" }],
    options: p.options.filter((o) => !(o.name === "Title" && o.optionValues.length === 1)).map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
    variants: variants.map((v) => ({ ...v, servings: v.servings ?? productServings })),
    priceRange: { min: mapMoney(p.priceRange.minVariantPrice), max: mapMoney(p.priceRange.maxVariantPrice) },
    availableForSale: p.availableForSale,
    cardNote: text("card_note"),
    seo: { title: p.seo.title, description: p.seo.description },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/* ---------- collection, filters, sort ---------- */

export function sortToShopify(sort: SortKey): { sortKey: string; reverse: boolean } {
  switch (sort) {
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "newest":
      return { sortKey: "CREATED", reverse: true };
    case "featured":
    default:
      return { sortKey: "COLLECTION_DEFAULT", reverse: false };
  }
}

export function filterToShopify(f: ProductFilter): Record<string, unknown> {
  switch (f.kind) {
    case "available":
      return { available: true };
    case "price":
      return { price: { ...(f.min !== undefined ? { min: f.min } : {}), ...(f.max !== undefined ? { max: f.max } : {}) } };
    case "size":
      return { variantOption: { name: "Size", value: f.value } };
    case "note":
      return { productMetafield: { namespace: "custom", key: "tasting_notes", value: f.value } };
  }
}

export function filterFromShopifyInput(input: string): ProductFilter | null {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, Record<string, unknown> | boolean | undefined>;
  if (r.available === true) return { kind: "available" };
  if (typeof r.price === "object" && r.price) {
    const min = typeof r.price.min === "number" ? r.price.min : undefined;
    const max = typeof r.price.max === "number" ? r.price.max : undefined;
    return { kind: "price", min, max };
  }
  if (typeof r.variantOption === "object" && r.variantOption && String(r.variantOption.name).toLowerCase() === "size") {
    return { kind: "size", value: String(r.variantOption.value) };
  }
  if (typeof r.productMetafield === "object" && r.productMetafield && r.productMetafield.key === "tasting_notes") {
    return { kind: "note", value: String(r.productMetafield.value) };
  }
  return null;
}

export function mapFilters(filters: SfFilter[]): FilterGroup[] {
  return filters
    .map((f) => ({
      id: f.id,
      label: f.label,
      values: f.values
        .map((v) => {
          const input = filterFromShopifyInput(v.input);
          return input ? { id: v.id, label: v.label, count: v.count, input } : null;
        })
        .filter((v): v is FilterGroup["values"][number] => v !== null),
    }))
    .filter((g) => g.values.length > 0);
}

export function mapCollection(c: SfCollection): Collection {
  return {
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    descriptionHtml: sanitizeMerchantHtml(c.descriptionHtml),
    image: imageMedia(c.image, c.title),
    seo: c.seo,
  };
}

/* ---------- content ---------- */

const ARTICLE_METHODS = ["Whisk", "Frother", "Shaker", "Iced"] as const;

export function mapArticle(a: SfArticle): Article {
  const methodRaw = a.method?.value ?? a.tags.find((t) => ARTICLE_METHODS.some((m) => m.toLowerCase() === t.toLowerCase())) ?? "Whisk";
  const method = ARTICLE_METHODS.find((m) => m.toLowerCase() === methodRaw.trim().toLowerCase()) ?? "Whisk";
  return {
    id: a.id,
    handle: a.handle,
    blogHandle: a.blog.handle,
    title: a.title,
    method,
    time: a.time?.value ?? "",
    serves: a.serves?.value ?? "—",
    excerpt: a.excerpt ?? "",
    contentHtml: sanitizeMerchantHtml(a.contentHtml),
    image: imageMedia(a.image, a.title) ?? { kind: "placeholder", label: `${method.toUpperCase()} · GUIDE HERO` },
    publishedAt: a.publishedAt,
    tags: a.tags,
    seo: { title: a.seo?.title ?? null, description: a.seo?.description ?? null },
  };
}

export function mapPage(p: { id: string; handle: string; title: string; body: string; seo: { title: string | null; description: string | null } | null }): ContentPage {
  return { id: p.id, handle: p.handle, title: p.title, bodyHtml: sanitizeMerchantHtml(p.body), seo: p.seo ?? { title: null, description: null } };
}

export function mapPolicy(p: SfPolicy) {
  if (!p) return null;
  return { handle: p.handle, title: p.title, bodyHtml: sanitizeMerchantHtml(p.body), url: `/policies/${p.handle}` };
}

/** Shopify menu URLs are absolute; storefront links must be relative paths. */
export function toStorefrontHref(url: string | null, internalHosts: string[]): string {
  if (!url) return "/";
  try {
    const u = new URL(url, "https://placeholder.invalid");
    const internal = u.hostname === "placeholder.invalid" || internalHosts.includes(u.hostname) || u.hostname.endsWith(".myshopify.com");
    if (!internal) return u.toString();
    return `${u.pathname}${u.search}${u.hash}` || "/";
  } catch {
    return "/";
  }
}

export function mapMenu(handle: string, items: SfMenuItem[], internalHosts: string[]): Menu {
  const mapItem = (i: SfMenuItem, depth: number): MenuItem => ({
    id: i.id,
    title: i.title,
    href: toStorefrontHref(i.url, internalHosts),
    // Two levels maximum.
    items: depth < 1 ? (i.items ?? []).map((c) => mapItem(c, depth + 1)) : [],
  });
  return { handle, items: items.map((i) => mapItem(i, 0)) };
}

export function mapFaq(nodes: Array<{ id: string; handle: string; fields: Array<{ key: string; value: string | null }> }>): FaqEntry[] {
  return nodes
    .map((n) => {
      const get = (k: string) => n.fields.find((f) => f.key === k)?.value?.trim() ?? "";
      return { id: n.id, question: get("question"), answer: get("answer"), topic: get("topic") || null };
    })
    .filter((f) => f.question && f.answer);
}

export function mapSiteSettings(
  fields: Array<{ key: string; value: string | null }> | null | undefined,
  envThresholdAud: number | undefined,
  fallback: SiteSettings = SITE_SETTINGS_FALLBACK,
): SiteSettings {
  const get = (k: string) => fields?.find((f) => f.key === k)?.value?.trim() || null;
  const currency = fallback.currencyCode;
  const thresholdFromCms = get("free_shipping_threshold");
  const threshold: Money =
    envThresholdAud !== undefined
      ? money(Math.round(envThresholdAud * 100), currency)
      : thresholdFromCms
        ? money(toMinorUnits(thresholdFromCms.replace(/[^\d.]/g, "")), currency)
        : fallback.freeShippingThreshold;
  const low = parseIntOrNull(get("low_stock_threshold"));
  const standard = get("standard_shipping");
  return {
    announcement: get("announcement") ?? fallback.announcement,
    freeShippingThreshold: threshold,
    standardShipping: standard ? money(toMinorUnits(standard.replace(/[^\d.]/g, "")), currency) : fallback.standardShipping,
    dispatchCity: get("dispatch_city") ?? fallback.dispatchCity,
    dispatchDays: get("dispatch_days") ?? fallback.dispatchDays,
    deliveryDays: get("delivery_days") ?? fallback.deliveryDays,
    returnsDays: get("returns_days") ?? fallback.returnsDays,
    lowStockThreshold: low !== null && low >= 0 ? low : fallback.lowStockThreshold,
    giftCutoff: get("gift_cutoff") ?? fallback.giftCutoff,
    currencyCode: currency,
  };
}

/* ---------- cart ---------- */

export function mapCart(c: SfCart): Cart {
  const attr = (k: string) => c.attributes.find((a) => a.key === k)?.value ?? "";
  const lines = c.lines.nodes.map((l) => {
    const m = l.merchandise;
    const kind = productKind(m.product.productType, m.product.tags);
    const price = mapMoney(m.price);
    return {
      id: l.id,
      quantity: l.quantity,
      merchandise: {
        variantId: m.id,
        productHandle: m.product.handle,
        productTitle: m.product.title,
        productKind: kind,
        eyebrow: productEyebrow({ kind, taste: tasteProfile(m.product.taste?.value, m.product.tier?.value ?? null) }),
        size: m.selectedOptions.find((o) => o.name.toLowerCase() === "size")?.value ?? (m.title === "Default Title" ? "One size" : m.title),
        image: imageMedia(m.image ?? m.product.featuredImage, m.product.title),
        price,
        compareAtPrice: effectiveCompareAt(price, m.compareAtPrice ? mapMoney(m.compareAtPrice) : null),
        availableForSale: m.availableForSale,
        quantityAvailable: typeof m.quantityAvailable === "number" ? m.quantityAvailable : null,
      },
      cost: { total: mapMoney(l.cost.totalAmount) },
    };
  });
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    lines,
    totalQuantity: c.totalQuantity,
    cost: { subtotal: mapMoney(c.cost.subtotalAmount), total: mapMoney(c.cost.totalAmount) },
    attributes: { gift: attr("gift") === "true" || attr("gift") === "yes", giftNote: attr("gift_note") },
    note: c.note ?? "",
  };
}
