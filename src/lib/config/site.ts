import { money } from "@/lib/data/money";
import type { SiteSettings } from "@/lib/data/types";

/**
 * Fallbacks for the `site_settings` metaobject. Bracketed values are deliberate placeholders that the
 * founders have not decided yet (brief §10). One source for the shipping promise on PDP, cart and
 * the Shipping & Returns page, so they can never contradict.
 */
export function defaultSiteSettings(freeShippingThreshold: number, placeholder: boolean): SiteSettings {
  return {
    freeShippingThreshold: money(freeShippingThreshold, placeholder),
    standardShipping: money(9.95, placeholder),
    expressShipping: money(14.95, placeholder),
    dispatchDays: "[x]",
    dispatchCity: "[city]",
    deliveryDays: "[x–y]",
    expressDays: "[x]",
    returnsDays: "[30]",
    refundDays: "[x]",
    lowStockThreshold: 5,
    giftCutoff: "Order by [date] for [occasion]",
    openedShelfLife: "[opened shelf-life, to be confirmed]",
    supportEmail: "[support email pending]",
    abn: "[pending]",
    replyTime: "[1] business day",
  };
}

export const NAV = [
  { href: "/collections/matcha", label: "Shop Matcha", mega: true },
  { href: "/collections/gifts", label: "Gifts" },
  { href: "/blogs/brewing-guides", label: "Brewing Guides" },
  { href: "/pages/academy", label: "Witcha Academy" },
  { href: "/pages/our-story", label: "Our Story" },
] as const;

export const HELP_LINKS = [
  { href: "/pages/faq", label: "FAQ" },
  { href: "/pages/shipping-returns", label: "Shipping & Returns" },
  { href: "/pages/contact", label: "Contact" },
] as const;

export const SHOPIFY_ACCOUNT_URL = "/account";
