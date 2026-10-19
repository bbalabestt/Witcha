import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/http/rate-limit";
import { cleanText, isEmail } from "@/lib/http/validate";
import { backInStock, NotConfiguredError } from "@/lib/providers";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "notify-me"))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const email = cleanText(body?.email, 254);
  const variantId = cleanText(body?.variantId, 200);
  if (!isEmail(email) || !variantId) return NextResponse.json({ error: "Check the email address." }, { status: 400 });
  try {
    await backInStock.notify(email, variantId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Restock alerts are unavailable right now." }, { status: err instanceof NotConfiguredError ? 503 : 502 });
  }
}
