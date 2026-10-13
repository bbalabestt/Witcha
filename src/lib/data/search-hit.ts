import { formatMoney } from "./money";
import { cardPriceLabel, productEyebrow } from "./product";
import type { Article, Media, Product } from "./types";

/** Slim, serialisable shapes for the client-side search overlay. */
export type ProductHit = { kind: "product"; handle: string; title: string; eyebrow: string; price: string; media: Media | null };
export type ArticleHit = { kind: "article"; handle: string; blogHandle: string; title: string; method: string; media: Media };
export type PredictivePayload = { query: string; products: ProductHit[]; articles: ArticleHit[] };

export function toProductHit(p: Product): ProductHit {
  return { kind: "product", handle: p.handle, title: p.title, eyebrow: productEyebrow(p), price: cardPriceLabel(p, formatMoney), media: p.media[0] ?? null };
}

export function toArticleHit(a: Article): ArticleHit {
  return { kind: "article", handle: a.handle, blogHandle: a.blogHandle, title: a.title, method: a.method, media: a.image };
}
