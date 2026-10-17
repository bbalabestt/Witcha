import { formatMoney } from "@/lib/data/money";
import { cardAction, cardPrice, eyebrow, firstAvailable, tasteLabel, type CardAction } from "@/lib/data/product";
import type { BadgeKind, Image, Product } from "@/lib/data/types";
import type { LinePreview } from "./CartProvider";
import type { GiftSetData } from "./GiftSetCard";

/** Serializable card model built on the server; the card itself is a small client island. */
export type CardData = {
  handle: string;
  kind: Product["kind"];
  title: string;
  eyebrow: string;
  tin: Image | null;
  placeholderLabel: string | null;
  badge: BadgeKind | null;
  pending: boolean;
  taste: { position: number; label: string } | null;
  notes: string[];
  price: string;
  compareAt: string | null;
  size: string;
  action: CardAction;
  /** Present only for quick add (single-variant, available). */
  preview: LinePreview | null;
};

export function toCardData(p: Product): CardData {
  const v = firstAvailable(p);
  const action = cardAction(p);
  const multi = p.variants.length > 1;
  return {
    handle: p.handle,
    kind: p.kind,
    title: p.title,
    eyebrow: eyebrow(p),
    tin: p.tin,
    placeholderLabel: p.tin ? null : p.kind === "tool" ? "TOOL PHOTO · 4:5" : "PRODUCT PHOTO · 4:5",
    badge: p.badge,
    pending: p.pending,
    taste: p.taste ? { position: p.taste.position, label: `Taste: ${tasteLabel(p.taste)}` } : null,
    notes: p.tastingNotes.slice(0, 2),
    price: cardPrice(p),
    compareAt: !multi && v?.compareAtPrice ? formatMoney(v.compareAtPrice) : null,
    // Size shows even for single-size teas (V2.1 3.4).
    size: multi ? p.variants.map((x) => x.title).join(" · ") : (v?.title ?? ""),
    action,
    preview:
      action === "add" && v
        ? {
            merchandiseId: v.id,
            handle: p.handle,
            title: p.title,
            kind: p.kind,
            eyebrow: eyebrow(p),
            tin: p.tin,
            variantTitle: v.title,
            price: v.price,
            quantityAvailable: v.quantityAvailable,
          }
        : null,
  };
}

export function toGiftSet(p: Product): GiftSetData {
  const v = firstAvailable(p);
  const tins = p.gallery.flatMap((g) => (g.kind === "image" && g.fit === "contain" ? [g.image] : []));
  return {
    handle: p.handle,
    title: p.title,
    note: p.description,
    price: cardPrice(p),
    pending: p.pending,
    tins: tins.length ? tins : p.tin ? [p.tin] : [],
    preview:
      v && v.availableForSale
        ? {
            merchandiseId: v.id,
            handle: p.handle,
            title: p.title,
            kind: p.kind,
            eyebrow: eyebrow(p),
            tin: p.tin,
            variantTitle: v.title,
            price: v.price,
            quantityAvailable: v.quantityAvailable,
          }
        : null,
  };
}
