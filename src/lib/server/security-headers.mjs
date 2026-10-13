// Security headers for every route. CSP ships report-only first (spec §7); switch the header name
// to `Content-Security-Policy` once production reports are clean.

/** @param {{ dev: boolean }} opts */
export function contentSecurityPolicy({ dev }) {
  const directives = {
    "default-src": ["'self'"],
    // Next.js inlines its bootstrap; nonces would make every page dynamic (no static shell).
    "script-src": ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://cdn.shopify.com"],
    "media-src": ["'self'", "https://cdn.shopify.com"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(dev ? ["ws:"] : [])],
    "frame-src": ["'self'", "https://shop.app", "https://*.shopify.com"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'", "https://*.myshopify.com", "https://shop.app", "https://checkout.shopify.com"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
  };
  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
}

/** @param {{ dev: boolean }} opts */
export function securityHeaders({ dev }) {
  return [
    { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy({ dev }) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://shop.app\")" },
    ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
  ];
}
