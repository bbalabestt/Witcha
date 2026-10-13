import { getBackInStockProvider, NotConfiguredError } from "@/lib/providers";
import { clientKey, EMAIL_RE, rateLimit } from "@/lib/server/rate-limit";

/** Back-in-stock sign-up for non-JS clients and integrations (the PDP uses a server action). */
export async function POST(request: Request) {
  const limited = rateLimit(`notify:${clientKey(request.headers)}`, { limit: 5, windowMs: 60_000 });
  if (!limited.ok) return Response.json({ error: "Too many attempts. Try again in a minute." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });

  let body: { email?: unknown; variantId?: unknown; productHandle?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Send JSON with email, variantId and productHandle." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const variantId = typeof body.variantId === "string" ? body.variantId : "";
  const productHandle = typeof body.productHandle === "string" ? body.productHandle : "";
  if (!EMAIL_RE.test(email) || email.length > 254) return Response.json({ error: "Check the email address, e.g. name@example.com." }, { status: 422 });
  if (!variantId.startsWith("gid://shopify/ProductVariant/") || !/^[a-z0-9-]{1,100}$/.test(productHandle)) {
    return Response.json({ error: "Unknown product." }, { status: 422 });
  }
  try {
    const r = await getBackInStockProvider().register({ email, variantId, productHandle });
    return r.ok ? Response.json({ ok: true }) : Response.json({ error: r.message }, { status: 502 });
  } catch (err) {
    console.error("[api/notify-me]", err instanceof NotConfiguredError ? err.message : err);
    return Response.json({ error: "We couldn’t save that just now. Try again in a moment." }, { status: 503 });
  }
}
