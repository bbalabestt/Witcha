import { getContactProvider, NotConfiguredError } from "@/lib/providers";
import { clientKey, EMAIL_RE, rateLimit } from "@/lib/server/rate-limit";

const TOPICS = new Set(["order", "tea", "gift", "review", "other"]);

export async function POST(request: Request) {
  const limited = rateLimit(`contact:${clientKey(request.headers)}`, { limit: 3, windowMs: 10 * 60_000 });
  if (!limited.ok) return Response.json({ error: "Too many messages. Try again in a few minutes." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Send JSON." }, { status: 400 });
  }
  if (typeof body.company === "string" && body.company) return Response.json({ ok: true });

  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const name = str("name", 120);
  const email = str("email", 254);
  const message = str("message", 5000);
  const orderNumber = str("order", 40) || undefined;
  const topic = TOPICS.has(str("topic", 20)) ? str("topic", 20) : "other";

  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return Response.json({ error: "Check your name, email and message." }, { status: 422 });
  }
  try {
    const r = await getContactProvider().send({ name, email, topic, message, orderNumber });
    return r.ok ? Response.json({ ok: true }) : Response.json({ error: r.message }, { status: 502 });
  } catch (err) {
    console.error("[api/contact]", err instanceof NotConfiguredError ? err.message : err);
    return Response.json({ error: "We couldn’t send that just now. Try again in a moment." }, { status: 503 });
  }
}
