import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Variant } from "@/lib/data/types";

const params = { value: new URLSearchParams() };
vi.mock("next/navigation", () => ({
  useSearchParams: () => params.value,
  usePathname: () => "/products/yame-no-mukashi",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

const { SelectedNetWeight } = await import("@/components/product/BuyBox");

const money = { amount: 0, currencyCode: "AUD", placeholder: true } as unknown as Variant["price"];
const v = (id: string, title: string, availableForSale = true): Variant => ({
  id,
  title,
  price: money,
  compareAtPrice: null,
  availableForSale,
  quantityAvailable: null,
  servings: null,
});

describe("PDP net weight follows the selected size", () => {
  beforeEach(() => {
    params.value = new URLSearchParams();
  });

  it("shows the first available size by default", () => {
    const { container } = render(<SelectedNetWeight variants={[v("a", "30 g", false), v("b", "100 g")]} fallback="30 g" />);
    expect(container.textContent).toBe("100 g");
  });

  it("shows the size picked in ?variant=", () => {
    params.value = new URLSearchParams("variant=a");
    const { container } = render(<SelectedNetWeight variants={[v("a", "30 g"), v("b", "100 g")]} fallback="x" />);
    expect(container.textContent).toBe("30 g");
  });

  it("keeps the fact value for single-size products", () => {
    const { container } = render(<SelectedNetWeight variants={[v("a", "Default Title")]} fallback="80 g" />);
    expect(container.textContent).toBe("80 g");
  });
});
