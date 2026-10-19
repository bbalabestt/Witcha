import { NextResponse } from "next/server";
import { isEmail } from "@/lib/http/validate";
import { clientKey, rateLimit } from "@/lib/http/rate-limit";
import { newsletter, NotConfiguredError } from "@/lib/providers";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "newsletter"))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!isEmail(email)) return NextResponse.json({ error: "Check the email address." }, { status: 400 });
  try {
    await newsletter.subscribe(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err instanceof NotConfiguredError ? 503 : 502;
    return NextResponse.json({ error: "Sign-up is unavailable right now." }, { status });
  }
}
