import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cart/actions", () => ({}));

import { applyCartOp, type LinePreview } from "@/components/commerce/CartProvider";
import { money } from "@/lib/data/money";

const preview: LinePreview = {
  merchandiseId: "d30",
  handle: "kosen-daily-matcha",
  title: "Kosen Daily Matcha",
  kind: "tea",
  eyebrow: "DAILY · BRIGHT",
  tin: null,
  variantTitle: "30 g",
  price: money(32, true),
  quantityAvailable: 3,
};

describe("optimistic cart reducer", () => {
  it("adds a line to an empty cart and totals it", () => {
    const cart = applyCartOp(null, { type: "add", preview, quantity: 2 });
    expect(cart.totalQuantity).toBe(2);
    expect(cart.subtotal).toMatchObject({ amount: 64, placeholder: true });
    expect(cart.lines[0]?.id).toBe("optimistic-d30");
  });

  it("merges repeat adds and caps them by stock", () => {
    const once = applyCartOp(null, { type: "add", preview, quantity: 2 });
    const twice = applyCartOp(once, { type: "add", preview, quantity: 2 });
    expect(twice.lines).toHaveLength(1);
    expect(twice.totalQuantity).toBe(3);
  });

  it("removes a line when its quantity reaches zero", () => {
    const cart = applyCartOp(null, { type: "add", preview, quantity: 1 });
    const next = applyCartOp(cart, { type: "quantity", lineId: "optimistic-d30", quantity: 0 });
    expect(next.lines).toHaveLength(0);
    expect(next.subtotal.amount).toBe(0);
  });

  it("clears the note when the gift box is unticked", () => {
    const cart = applyCartOp(null, { type: "gift", gift: true, note: "Happy birthday" });
    expect(cart.giftNote).toBe("Happy birthday");
    expect(applyCartOp(cart, { type: "gift", gift: false, note: "Happy birthday" }).giftNote).toBe("");
  });
});
