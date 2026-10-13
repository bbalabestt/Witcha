import { getNewsletterProvider, NotConfiguredError } from "@/lib/providers";
import { clientKey, EMAIL_RE, rateLimit } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`newsletter:${clientKey(request.headers)}`, { limit: 5, windowMs: 60_000 });
  if (!limited.ok) {
    return Response.json({ error: "Too many attempts. Try again in a minute." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  let email = "";
  let source = "newsletter-band";
  try {
    const body = (await request.json()) as { email?: unknown; source?: unknown; company?: unknown };
    // Honeypot: real people never fill the hidden "company" field.
    if (typeof body.company === "string" && body.company) return Response.json({ ok: true });
    email = typeof body.email === "string" ? body.email.trim() : "";
    if (typeof body.source === "string") source = body.source.slice(0, 40);
  } catch {
    return Response.json({ error: "Send JSON with an email." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ error: "Check the email address, e.g. name@example.com." }, { status: 422 });
  }

  try {
    const result = await getNewsletterProvider().subscribe({ email, source });
    if (!result.ok) return Response.json({ error: result.message }, { status: result.reason === "invalid" ? 422 : 502 });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof NotConfiguredError) console.error(`[api/newsletter] ${err.message}`);
    else console.error("[api/newsletter]", err);
    return Response.json({ error: "We couldn’t sign you up just now. Try again in a moment." }, { status: 503 });
  }
}
