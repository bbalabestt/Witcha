import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/http/rate-limit";
import { cleanText, isEmail } from "@/lib/http/validate";
import { contact, NotConfiguredError } from "@/lib/providers";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "contact"), 3)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const message = {
    name: cleanText(body?.name, 120),
    email: cleanText(body?.email, 254),
    orderNumber: cleanText(body?.orderNumber, 40),
    topic: cleanText(body?.topic, 40),
    message: cleanText(body?.message, 4000),
  };
  if (!message.name || !isEmail(message.email) || !message.message) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
  }
  try {
    await contact.send(message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Messages are unavailable right now." }, { status: err instanceof NotConfiguredError ? 503 : 502 });
  }
}
