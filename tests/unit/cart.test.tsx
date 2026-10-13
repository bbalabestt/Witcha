import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { applyCartOp, EMPTY_CART, freeShippingMeter, lineCap, merchandiseFor, OPTIMISTIC_PREFIX } from "@/lib/cart/optimistic";
import { SITE_SETTINGS_FALLBACK } from "@/lib/config/site";
import { PRODUCTS } from "@/lib/data/fixtures/data";
import { money } from "@/lib/data/money";
import type { Cart } from "@/lib/data/types";

const addToCart = vi.fn();
vi.mock("@/lib/cart/actions", () => ({
  addToCart: (...a: unknown[]) => addToCart(...a),
  fetchCart: vi.fn(async () => null),
  updateCartLine: vi.fn(),
  removeCartLine: vi.fn(),
  updateGift: vi.fn(),
  requestBackInStock: vi.fn(async () => ({ ok: true })),
}));

const { CartProvider } = await import("@/components/cart/CartProvider");
const { PdpProvider } = await import("@/components/pdp/PdpContext");
const { BuyBox } = await import("@/components/pdp/BuyBox");
const { shippingPromise } = await import("@/components/commerce/ShippingPromise");

afterEach(cleanup);

const yame = PRODUCTS.find((p) => p.handle === "yame")!;
const daily = PRODUCTS.find((p) => p.handle === "daily")!;
const yame30 = merchandiseFor(yame, yame.variants[0]!);

describe("applyCartOp", () => {
  it("adds a new optimistic line with totals", () => {
    const c = applyCartOp(null, { type: "add", merchandise: yame30, quantity: 2 });
    expect(c.lines).toHaveLength(1);
    expect(c.lines[0]!.id).toBe(`${OPTIMISTIC_PREFIX}${yame30.variantId}`);
    expect(c.totalQuantity).toBe(2);
    expect(c.cost.subtotal).toEqual(money(9600, "AUD", true));
  });

  it("merges into an existing line and caps at stock", () => {
    const one = applyCartOp(null, { type: "add", merchandise: yame30, quantity: 10 });
    const two = applyCartOp(one, { type: "add", merchandise: yame30, quantity: 10 });
    expect(two.lines).toHaveLength(1);
    expect(two.lines[0]!.quantity).toBe(12);
  });

  it("updates, removes at zero, and removes", () => {
    const base: Cart = { ...applyCartOp(null, { type: "add", merchandise: yame30, quantity: 1 }), id: "c" };
    const id = base.lines[0]!.id;
    expect(applyCartOp(base, { type: "update", lineId: id, quantity: 3 }).cost.subtotal.amount).toBe(14400);
    expect(applyCartOp(base, { type: "update", lineId: id, quantity: 0 }).lines).toHaveLength(0);
    const removed = applyCartOp(base, { type: "remove", lineId: id });
    expect(removed.totalQuantity).toBe(0);
    expect(removed.cost.subtotal.amount).toBe(0);
  });

  it("trims gift notes to 150 characters", () => {
    expect(applyCartOp(EMPTY_CART, { type: "attributes", attributes: { gift: true, giftNote: "x".repeat(200) } }).attributes.giftNote).toHaveLength(150);
  });

  it("caps unknown stock at 99", () => {
    expect(lineCap({ quantityAvailable: null })).toBe(99);
    expect(lineCap({ quantityAvailable: 4 })).toBe(4);
  });
});

describe("freeShippingMeter", () => {
  const threshold = money(8000);
  it("tracks progress and the amount left", () => {
    expect(freeShippingMeter(money(0), threshold)).toEqual({ kind: "progress", remaining: money(8000), percent: 0 });
    expect(freeShippingMeter(money(6000), threshold)).toEqual({ kind: "progress", remaining: money(2000), percent: 75 });
  });
  it("is reached at or above the threshold", () => {
    expect(freeShippingMeter(money(8000), threshold).kind).toBe("reached");
    expect(freeShippingMeter(money(9000), threshold).kind).toBe("reached");
  });
  it("brackets the remainder when either figure is a placeholder", () => {
    const m = freeShippingMeter(money(4800, "AUD", true), money(8000, "AUD", true));
    expect(m.kind === "progress" && m.remaining.placeholder).toBe(true);
  });
});

describe("shipping promise", () => {
  it("comes from one settings source", () => {
    const p = shippingPromise({ ...SITE_SETTINGS_FALLBACK, dispatchDays: "2", dispatchCity: "Sydney", freeShippingThreshold: money(9000) });
    expect(p.dispatch.lead + p.dispatch.rest).toBe("Dispatched within 2 business days from Sydney.");
    expect(p.free).toBe("Free shipping over $90.00. Otherwise $[9.95].");
    expect(p.trio.delivery).toContain("Free over $90.00");
  });
});

function renderBuyBox(product = yame, variant: string | null = null) {
  return render(
    <CartProvider>
      <PdpProvider product={product} initialVariant={variant}>
        <BuyBox lowStockThreshold={5} compareMarkers={[]} shippingPromise={null} shopPay={false} />
      </PdpProvider>
    </CartProvider>,
  );
}

describe("BuyBox", () => {
  it("shows price, per-cup and live add-to-cart total", async () => {
    renderBuyBox();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Yame no Mukashi");
    expect(screen.getByText(/≈ \$\[3\.20\] per cup/)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByRole("button", { name: /Add to cart · \$\[96\.00\]/ })).toBeTruthy();
  });

  it("never shows Add to cart for a sold-out size; offers Notify me instead", async () => {
    renderBuyBox();
    await userEvent.click(screen.getByRole("radio", { name: /100 g/ }));
    expect(screen.getByText("Sold out in 100 g.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Add to cart/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Notify me" })).toBeTruthy();
  });

  it("selects the size from ?variant=", () => {
    renderBuyBox(yame, "1001100");
    expect(screen.getByRole("radio", { name: /100 g/ }).getAttribute("aria-checked")).toBe("true");
  });

  it("shows low stock from the shared rule", () => {
    renderBuyBox(daily);
    expect(screen.getByText("Only 3 left in 30 g.")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add to cart/ })).toBeTruthy();
  });

  it("opens the cart with the line and calls the action", async () => {
    addToCart.mockResolvedValueOnce({ ok: false, error: "Sold out." });
    renderBuyBox(daily);
    await userEvent.click(screen.getByRole("button", { name: /Add to cart/ }));
    expect(addToCart).toHaveBeenCalledWith([{ variantId: daily.variants[0]!.id, quantity: 1 }]);
  });
});
