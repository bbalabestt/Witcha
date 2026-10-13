import type { NextRequest } from "next/server";
import { predictiveSearch } from "@/lib/data";
import { toArticleHit, toProductHit, type PredictivePayload } from "@/lib/data/search-hit";

/** Predictive search for the overlay. Two-character minimum, results capped (4 teas, 2 guides). */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return Response.json({ query: q, products: [], articles: [] } satisfies PredictivePayload);
  try {
    const r = await predictiveSearch(q.toLowerCase());
    const body: PredictivePayload = { query: q, products: r.products.map(toProductHit), articles: r.articles.map(toArticleHit) };
    return Response.json(body, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (err) {
    console.error("[api/search]", err);
    return Response.json({ error: "Search is unavailable right now." }, { status: 502 });
  }
}
