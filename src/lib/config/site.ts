import type { SiteSettings } from "@/lib/data/types";
import { LIVE } from "./launch";

/**
 * Fallbacks for the `site_settings` metaobject. Shipping and support values stay null until the founders
 * supply them, and every block that needs one hides. One source for the PDP, cart and Shipping & Returns.
 */
export function defaultSiteSettings(): SiteSettings {
  return {
    freeShippingThreshold: null,
    standardShipping: null,
    expressShipping: null,
    dispatchDays: null,
    dispatchCity: null,
    deliveryDays: null,
    expressDays: null,
    returnsDays: null,
    refundDays: null,
    giftCutoff: null,
    supportEmail: null,
    replyTime: null,
    legalEntity: "MINIWITCH PTY LTD",
    abn: "41 702 554 265",
  };
}

export const TEAS_HREF = "/collections/teas";

export const NAV = [
  { href: TEAS_HREF, label: "Shop the teas", mega: true },
  { href: "/pages/academy", label: "Witcha Academy" },
  { href: "/pages/faq", label: "FAQ" },
] as const;

export const HELP_LINKS = [
  { href: "/pages/faq", label: "FAQ" },
  ...(LIVE.shippingReturns ? [{ href: "/pages/shipping-returns", label: "Shipping & Returns" }] : []),
  ...(LIVE.contact ? [{ href: "/pages/contact", label: "Contact" }] : []),
];

/** Exact profile URLs, pending. A null link is not shown. */
export const SOCIAL: Array<{ label: string; href: string | null }> = [
  { label: "Instagram", href: null },
  { label: "Facebook", href: null },
  { label: "TikTok", href: null },
];
