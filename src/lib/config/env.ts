import "server-only";

/**
 * Environment, validated once per server process. Every variable is listed in `.env.example`.
 * Invalid configuration throws at startup with a message that names the variable.
 */

export type CommerceSource = "fixtures" | "shopify";

export type Env = {
  commerceSource: CommerceSource;
  shopify: {
    domain: string;
    privateToken: string;
    publicToken: string;
    apiVersion: string;
    revalidationSecret: string;
  } | null;
  siteUrl: string;
  siteMode: "live" | "waitlist";
  shopPay: boolean;
  pricesArePlaceholders: boolean;
  isProduction: boolean;
};

/** Pinned Storefront API version (latest stable at build time). Override with SHOPIFY_API_VERSION. */
export const SHOPIFY_API_VERSION = "2026-10";

function oneOf<T extends string>(name: string, value: string | undefined, allowed: readonly T[], fallback: T): T {
  if (value === undefined || value === "") return fallback;
  if ((allowed as readonly string[]).includes(value)) return value as T;
  throw new Error(`${name} must be one of ${allowed.join(", ")} (got "${value}").`);
}

function flag(name: string, value: string | undefined, fallback: boolean): boolean {
  return oneOf(name, value, ["on", "off"] as const, fallback ? "on" : "off") === "on";
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required when COMMERCE_SOURCE=shopify.`);
  return value;
}

export function parseEnv(source: Record<string, string | undefined>): Env {
  const isProduction = source.NODE_ENV === "production";
  const commerceSource = oneOf("COMMERCE_SOURCE", source.COMMERCE_SOURCE, ["fixtures", "shopify"] as const, "fixtures");

  const vercelUrl = source.VERCEL_PROJECT_PRODUCTION_URL;
  const siteUrl = source.NEXT_PUBLIC_SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
  try {
    new URL(siteUrl);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL must be an absolute URL (got "${siteUrl}").`);
  }

  return {
    commerceSource,
    shopify:
      commerceSource === "shopify"
        ? {
            domain: required("SHOPIFY_STORE_DOMAIN", source.SHOPIFY_STORE_DOMAIN),
            privateToken: required("SHOPIFY_STOREFRONT_PRIVATE_TOKEN", source.SHOPIFY_STOREFRONT_PRIVATE_TOKEN),
            publicToken: source.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ?? "",
            apiVersion: source.SHOPIFY_API_VERSION || SHOPIFY_API_VERSION,
            revalidationSecret: source.SHOPIFY_REVALIDATION_SECRET ?? "",
          }
        : null,
    siteUrl: siteUrl.replace(/\/$/, ""),
    siteMode: oneOf("NEXT_PUBLIC_SITE_MODE", source.NEXT_PUBLIC_SITE_MODE, ["live", "waitlist"] as const, "live"),
    shopPay: flag("SHOP_PAY", source.SHOP_PAY, false),
    // Fixtures always carry bracketed prices; live prices are real unless explicitly flagged.
    pricesArePlaceholders: commerceSource === "fixtures" || flag("PRICE_PLACEHOLDERS", source.PRICE_PLACEHOLDERS, false),
    isProduction,
  };
}

let cached: Env | null = null;

export function env(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
