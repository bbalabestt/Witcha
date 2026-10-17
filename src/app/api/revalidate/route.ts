import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { TAGS } from "@/lib/data/catalog";
import { verifyShopifyHmac } from "@/lib/http/hmac";

/** Shopify webhook topic → cache tags to mark stale. */
const TOPIC_TAGS: Record<string, string[]> = {
  "products/create": [TAGS.products],
  "products/update": [TAGS.products],
  "products/delete": [TAGS.products],
  "inventory_levels/update": [TAGS.products],
  "collections/create": [TAGS.collections],
  "collections/update": [TAGS.collections],
  "collections/delete": [TAGS.collections],
  "metaobjects/create": [TAGS.content, TAGS.settings],
  "metaobjects/update": [TAGS.content, TAGS.settings],
  "metaobjects/delete": [TAGS.content, TAGS.settings],
};

export async function POST(request: Request) {
  const secret = env().shopify?.revalidationSecret ?? "";
  const raw = await request.text();
  if (!verifyShopifyHmac(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const topic = request.headers.get("x-shopify-topic") ?? "";
  const tags = TOPIC_TAGS[topic] ?? [TAGS.products, TAGS.collections, TAGS.content];
  // Stale-while-revalidate: shoppers keep seeing the old page while the new one renders.
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: tags, topic });
}
