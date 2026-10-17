import { NextResponse, type NextRequest } from "next/server";
import type { PredictiveResult } from "@/components/layout/SearchOverlay";
import { search } from "@/lib/data/catalog";
import { cardPrice, eyebrow } from "@/lib/data/product";

/** Predictive search for the overlay: up to 4 teas with thumbnails and 2 guides. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ products: [], guides: [] } satisfies PredictiveResult);
  const results = await search(q);
  const body: PredictiveResult = {
    products: results.products.slice(0, 4).map((p) => ({
      handle: p.handle,
      title: p.title,
      eyebrow: eyebrow(p),
      price: cardPrice(p),
      tin: p.tin ? { url: p.tin.url, alt: p.tin.alt } : null,
    })),
    guides: results.guides.slice(0, 2).map((g) => ({ handle: g.handle, title: g.title, image: { url: g.image.url, alt: g.image.alt } })),
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=60" } });
}
