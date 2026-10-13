import { revalidateTag } from "next/cache";
import { getServerEnv } from "@/lib/config/env";
import { MANUAL_TAGS } from "@/lib/data/tags";
import { tagsForWebhook, verifyShopifyHmac } from "@/lib/server/webhooks";

/**
 * Shopify webhooks (products, collections, inventory, metaobjects, shop): verify the HMAC, then mark
 * the matching cache tags stale. Menus have no webhook: POST `?tag=menus` with the same HMAC scheme
 * over an empty body to refresh them by hand (see docs/SHOPIFY-SETUP.md).
 */
export async function POST(request: Request) {
  const secret = getServerEnv().SHOPIFY_REVALIDATION_SECRET;
  if (!secret) return Response.json({ error: "Revalidation is not configured." }, { status: 503 });

  const raw = await request.text();
  if (!verifyShopifyHmac(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  const manual = new URL(request.url).searchParams.get("tag");
  let tags: string[];
  if (manual) {
    tags = MANUAL_TAGS.has(manual) ? [manual] : [];
  } else {
    let payload: { handle?: unknown; type?: unknown } | null = null;
    try {
      payload = raw ? (JSON.parse(raw) as typeof payload) : null;
    } catch {
      return Response.json({ error: "Body is not JSON." }, { status: 400 });
    }
    tags = tagsForWebhook(request.headers.get("x-shopify-topic"), payload);
  }

  for (const tag of tags) revalidateTag(tag, "max");
  // Shopify retries on non-2xx, so unknown topics still answer 200.
  return Response.json({ revalidated: tags });
}
