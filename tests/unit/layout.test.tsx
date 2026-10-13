import { describe, expect, it } from "vitest";
import { announcementText } from "@/components/layout/AnnouncementBar";
import { isActive } from "@/components/layout/HeaderBar";
import { markerPercent } from "@/components/commerce/TasteScale";
import { SITE_SETTINGS_FALLBACK } from "@/lib/config/site";
import { FixtureRepository } from "@/lib/data/fixtures/repository";
import { rateLimit } from "@/lib/server/rate-limit";

const shop = { id: "1", title: "Shop Matcha", href: "/collections/matcha", items: [{ id: "1a", title: "Gifts & sets", href: "/collections/gifts", items: [] }] };
const story = { id: "2", title: "Our Story", href: "/pages/our-story", items: [] };

describe("header active state", () => {
  it("underlines the section and its children", () => {
    expect(isActive("/collections/matcha", shop)).toBe(true);
    expect(isActive("/products/yame", shop)).toBe(true);
    expect(isActive("/collections/gifts", shop)).toBe(true);
    expect(isActive("/pages/our-story", story)).toBe(true);
    expect(isActive("/products/yame", story)).toBe(false);
    expect(isActive("/", story)).toBe(false);
  });
});

describe("announcement", () => {
  it("fills the threshold from the same settings the cart uses", () => {
    expect(announcementText(SITE_SETTINGS_FALLBACK)).toBe("Free shipping over $[80.00] · Dispatched from [city] within [x] business days");
    expect(announcementText({ ...SITE_SETTINGS_FALLBACK, freeShippingThreshold: { amount: 9000, currencyCode: "AUD" } })).toContain("$90.00");
  });
});

describe("taste scale", () => {
  it("places five stops evenly", () => {
    expect([1, 2, 3, 4, 5].map((n) => markerPercent(n as 1 | 2 | 3 | 4 | 5))).toEqual([0, 25, 50, 75, 100]);
  });
});

describe("fixture search", () => {
  it("matches teas by what they are best for", async () => {
    const r = await new FixtureRepository().search("iced");
    expect(r.products.map((p) => p.handle)).toEqual(["yame", "daily"]);
  });
});

describe("rateLimit", () => {
  it("blocks after the limit inside the window", () => {
    const opts = { limit: 2, windowMs: 1000 };
    expect(rateLimit("k", opts, 0).ok).toBe(true);
    expect(rateLimit("k", opts, 10).ok).toBe(true);
    const third = rateLimit("k", opts, 20);
    expect(third).toEqual({ ok: false, retryAfter: 1 });
    expect(rateLimit("k", opts, 1001).ok).toBe(true);
  });
});
