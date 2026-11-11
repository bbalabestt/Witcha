import { cardPrice, firstAvailable, teaTypeLabel } from "@/lib/data/product";
import type { Image, Product, TeaType } from "@/lib/data/types";
import type { LinePreview } from "./CartProvider";
import type { GiftSetData } from "./GiftSetCard";
import type { UpsellItem } from "./CartParts";

/** Serializable card model built on the server: full name → tasting words → best for → price. */
export type CardData = {
  handle: string;
  title: string;
  teaType: TeaType | null;
  typeLabel: string;
  tin: Image | null;
  notes: string[];
  bestForShort: string | null;
  price: string | null;
  size: string;
  soldOut: boolean;
  /** Tools have no product page of their own. */
  href: string | null;
};

export function toCardData(p: Product): CardData {
  const v = firstAvailable(p);
  return {
    handle: p.handle,
    title: p.title,
    teaType: p.teaType,
    typeLabel: teaTypeLabel(p.teaType),
    tin: p.tin,
    notes: p.tastingNotes,
    bestForShort: p.bestForShort,
    price: cardPrice(p),
    size: v?.title ?? "",
    soldOut: !p.variants.some((x) => x.availableForSale),
    href: p.kind === "tea" ? `/products/${p.handle}` : null,
  };
}

function preview(p: Product): LinePreview | null {
  const v = firstAvailable(p);
  if (!v || !v.availableForSale) return null;
  return {
    merchandiseId: v.id,
    handle: p.handle,
    title: p.title,
    kind: p.kind,
    teaType: p.teaType,
    tin: p.tin,
    variantTitle: v.title,
    price: v.price,
    quantityAvailable: v.quantityAvailable,
  };
}

export function toGiftSet(p: Product): GiftSetData {
  const tins = p.gallery.flatMap((g) => (g.fit === "contain" ? [g.image] : []));
  return {
    handle: p.handle,
    title: p.title,
    note: p.description,
    price: cardPrice(p),
    tins: tins.length ? tins : p.tin ? [p.tin] : [],
    preview: preview(p),
  };
}

/** "Pair with" items: tools that can be quick-added. */
export function toUpsellItems(products: Product[]): UpsellItem[] {
  return products
    .filter((p) => p.kind === "tool")
    .flatMap((p) => {
      const line = preview(p);
      return line ? [{ ...line, label: p.title }] : [];
    });
}
