/**
 * Fixed-window, per-instance rate limiter for the form routes. Good enough to blunt scripted abuse
 * on one instance; swap for a shared store (e.g. Upstash) when running many instances.
 */
type Window = { count: number; resetAt: number };

const store = new Map<string, Window>();
const MAX_KEYS = 10_000;

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }, now = Date.now()): { ok: boolean; retryAfter: number } {
  const w = store.get(key);
  if (!w || w.resetAt <= now) {
    if (store.size >= MAX_KEYS) {
      for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
      if (store.size >= MAX_KEYS) store.clear();
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  w.count += 1;
  if (w.count > limit) return { ok: false, retryAfter: Math.ceil((w.resetAt - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

export function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || headers.get("x-real-ip") || "unknown";
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
