import type { SiteSettings } from "@/lib/data/types";

/**
 * Fallback site settings, used when the Shopify `site_settings` metaobject is missing a field
 * and always in fixtures mode. Bracketed values are placeholders from Prototype V2 (see HANDOVER).
 * The threshold here is a placeholder too: FREE_SHIPPING_THRESHOLD_AUD sets the real one.
 */
export const SITE_SETTINGS_FALLBACK: SiteSettings = {
  announcement: "Free shipping over {threshold} · Dispatched from {city} within {days} business days",
  freeShippingThreshold: { amount: 8000, currencyCode: "AUD", placeholder: true },
  standardShipping: { amount: 995, currencyCode: "AUD", placeholder: true },
  dispatchCity: "[city]",
  dispatchDays: "[x]",
  deliveryDays: "[x–y]",
  returnsDays: "[30]",
  lowStockThreshold: 5,
  giftCutoff: "Order by [date] for [occasion] delivery in metro Australia.",
  currencyCode: "AUD",
};

export const SITE = {
  name: "WITCHA MATCHA",
  tagline: "Matcha, With Taste.",
  brandLine: "Which Matcha Today?",
  locale: "en-AU",
  /** Shopify-hosted customer accounts; replaced by the store's account URL in Shopify mode. */
  accountPath: "/account",
  /** Social profile URLs are pending (HANDOVER); null renders a non-link placeholder. */
  social: {
    instagram: null as string | null,
    tiktok: null as string | null,
    pinterest: null as string | null,
  },
  business: { abn: "ABN [00 000 000 000]", email: "[hello@witchamatcha.com.au]" },
} as const;

export const MENU_HANDLES = { main: "main-menu", footer: "footer" } as const;

export const BLOG_HANDLE = "brewing-guides";

/** Collections with their own header treatment. */
export const COLLECTION_HANDLES = { matcha: "matcha", gifts: "gifts", accessories: "accessories" } as const;
