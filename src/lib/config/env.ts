import "server-only";
import { z } from "zod";

/** Latest stable Storefront API version at build time. Override with SHOPIFY_API_VERSION. */
export const SHOPIFY_API_VERSION_DEFAULT = "2026-10";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    COMMERCE_SOURCE: z.enum(["fixtures", "shopify"]).default("fixtures"),
    SHOPIFY_STORE_DOMAIN: optionalString.pipe(
      z
        .string()
        .regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$|^[a-z0-9.-]+\.[a-z]{2,}$/i, "Use the bare domain, e.g. witcha-matcha.myshopify.com")
        .optional(),
    ),
    SHOPIFY_STOREFRONT_PRIVATE_TOKEN: optionalString,
    SHOPIFY_STOREFRONT_PUBLIC_TOKEN: optionalString,
    SHOPIFY_API_VERSION: z
      .string()
      .regex(/^\d{4}-(01|04|07|10)$|^unstable$/, "Shopify API versions look like 2026-10")
      .default(SHOPIFY_API_VERSION_DEFAULT),
    SHOPIFY_REVALIDATION_SECRET: optionalString,
    FREE_SHIPPING_THRESHOLD_AUD: optionalString.pipe(z.coerce.number<string | undefined>().nonnegative().optional()),
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_SITE_MODE: z.enum(["live", "waitlist"]).default("live"),
    NEXT_PUBLIC_FEATURE_SHOP_PAY: z
      .enum(["true", "false", "1", "0"])
      .optional()
      .transform((v) => v === "true" || v === "1"),
    NEWSLETTER_PROVIDER: z.enum(["stub", "klaviyo", "shopify"]).optional(),
    KLAVIYO_PRIVATE_API_KEY: optionalString,
    KLAVIYO_LIST_ID: optionalString,
    BACK_IN_STOCK_PROVIDER: z.enum(["stub", "klaviyo"]).optional(),
    CONTACT_PROVIDER: z.enum(["stub", "resend"]).optional(),
    RESEND_API_KEY: optionalString,
    CONTACT_TO_EMAIL: optionalString.pipe(z.email().optional()),
    REVIEWS_PROVIDER: z.enum(["none"]).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.COMMERCE_SOURCE !== "shopify") return;
    if (!env.SHOPIFY_STORE_DOMAIN) {
      ctx.addIssue({ code: "custom", path: ["SHOPIFY_STORE_DOMAIN"], message: "Required when COMMERCE_SOURCE=shopify" });
    }
    if (!env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN) {
      ctx.addIssue({
        code: "custom",
        path: ["SHOPIFY_STOREFRONT_PRIVATE_TOKEN"],
        message: "Required when COMMERCE_SOURCE=shopify (server-side private Storefront token)",
      });
    }
  });

export type ServerEnv = z.infer<typeof schema>;

export class EnvError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid environment:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "EnvError";
  }
}

export function parseServerEnv(raw: Record<string, string | undefined>): ServerEnv {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new EnvError(result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`));
  }
  return result.data;
}

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
