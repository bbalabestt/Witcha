import "server-only";

/**
 * Environment, validated once per server process. Every variable is listed in `.env.example`.
 * Invalid configuration throws at startup with a message that names the variable.
 */

export type CommerceSource = "fixtures" | "shopify";
export type ReviewsSource = "none" | "sample";

export type Env = {
  commerceSource: CommerceSource;
  shopify: {
    domain: string;
    privateToken: string;
    publicToken: string;
    apiVersion: string;
    revalidationSecret: string;
  } | null;
  freeShippingThreshold: number;
  siteUrl: string;
  siteMode: "live" | "waitlist";
  reviewsSource: ReviewsSource;
  promoPopup: boolean;
  pixelCat: boolean;
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

  const thresholdRaw = source.FREE_SHIPPING_THRESHOLD_AUD ?? "80";
  const freeShippingThreshold = Number(thresholdRaw);
  if (!Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0) {
    throw new Error(`FREE_SHIPPING_THRESHOLD_AUD must be a positive number (got "${thresholdRaw}").`);
  }

  const siteUrl = source.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    new URL(siteUrl);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL must be an absolute URL (got "${siteUrl}").`);
  }

  const reviewsSource = oneOf("REVIEWS_SOURCE", source.REVIEWS_SOURCE, ["none", "sample"] as const, "none");
  if (reviewsSource === "sample" && isProduction && commerceSource === "shopify") {
    throw new Error("REVIEWS_SOURCE=sample shows invented reviews and is not allowed with live Shopify data.");
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
    freeShippingThreshold,
    siteUrl: siteUrl.replace(/\/$/, ""),
    siteMode: oneOf("NEXT_PUBLIC_SITE_MODE", source.NEXT_PUBLIC_SITE_MODE, ["live", "waitlist"] as const, "live"),
    reviewsSource,
    promoPopup: flag("PROMO_POPUP", source.PROMO_POPUP, false),
    pixelCat: flag("PIXEL_CAT", source.PIXEL_CAT, true),
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
