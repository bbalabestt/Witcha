import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buttonClassName } from "@/components/ui/Button";
import { clampQuantity, nextIndex, OptionPillGroup, QuantityStepper, type PillOption } from "@/components/ui/Controls";
import { Accordion, toggleOpen } from "@/components/ui/Disclosure";
import { ratioToCss } from "@/components/ui/Frame";
import { iconMarkup } from "@/components/ui/icons.generated";
import { LOGO_MIN_WIDTH, Logo, resolveLogoWidth } from "@/components/ui/Logo";

afterEach(cleanup);

const isDisabled = (el: HTMLElement) => (el as HTMLButtonElement).disabled;

describe("clampQuantity", () => {
  it("never goes below the minimum", () => {
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(-4, 10)).toBe(1);
  });
  it("caps at stock", () => {
    expect(clampQuantity(13, 12)).toBe(12);
  });
  it("treats unknown stock as uncapped", () => {
    expect(clampQuantity(250, null)).toBe(250);
  });
  it("handles junk input", () => {
    expect(clampQuantity(Number.NaN, 5)).toBe(1);
    expect(clampQuantity(2.7, 5)).toBe(2);
  });
  it("keeps min when stock is below min", () => {
    expect(clampQuantity(3, 0)).toBe(1);
  });
});

describe("nextIndex (roving focus)", () => {
  it("wraps forward and back", () => {
    expect(nextIndex(2, "ArrowRight", 3)).toBe(0);
    expect(nextIndex(0, "ArrowLeft", 3)).toBe(2);
  });
  it("supports Home and End", () => {
    expect(nextIndex(1, "Home", 4)).toBe(0);
    expect(nextIndex(1, "End", 4)).toBe(3);
  });
  it("ignores other keys and empty lists", () => {
    expect(nextIndex(0, "a", 3)).toBeNull();
    expect(nextIndex(0, "ArrowRight", 0)).toBeNull();
  });
});

describe("toggleOpen", () => {
  it("adds and removes without mutating", () => {
    const start = new Set(["a"]);
    const opened = toggleOpen(start, "b");
    expect([...opened].sort()).toEqual(["a", "b"]);
    expect([...toggleOpen(opened, "a")]).toEqual(["b"]);
    expect([...start]).toEqual(["a"]);
  });
});

describe("Logo", () => {
  it("enforces brand minimum widths", () => {
    expect(resolveLogoWidth("large", 120)).toBe(LOGO_MIN_WIDTH.large);
    expect(resolveLogoWidth("small", 80)).toBe(100);
    expect(resolveLogoWidth("small-no-rules", 40)).toBe(64);
    expect(resolveLogoWidth("large", 200)).toBe(200);
  });
  it("renders the supplied SVG, never retyped text", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Logo variant="small" tone="reversed" width={50} />);
    const img = screen.getByRole("img", { name: "WITCHA MATCHA" });
    expect(img.getAttribute("src")).toBe("/logos/witcha-matcha_small_reversed-ivory-gold.svg");
    expect(img.getAttribute("width")).toBe("100");
  });
});

describe("misc helpers", () => {
  it("maps ratios to CSS aspect-ratio", () => {
    expect(ratioToCss("4:5")).toBe("4 / 5");
    expect(ratioToCss("16:9")).toBe("16 / 9");
  });
  it("link buttons carry no height class", () => {
    expect(buttonClassName({ variant: "link", size: "xl" })).not.toContain("xl");
    expect(buttonClassName({ variant: "primary", size: "md", fullWidth: true })).toContain("full");
  });
  it("generated icons contain no hard-coded colours", () => {
    for (const markup of Object.values(iconMarkup)) expect(markup).not.toMatch(/#[0-9a-f]{3,6}/i);
  });
});

describe("QuantityStepper", () => {
  function Harness({ initial, max }: { initial: number; max: number | null }) {
    const [q, setQ] = useState(initial);
    return <QuantityStepper value={q} max={max} onChange={setQ} />;
  }

  it("disables decrease at 1 and increase at stock", async () => {
    const user = userEvent.setup();
    render(<Harness initial={1} max={2} />);
    const dec = screen.getByRole("button", { name: "Decrease quantity" });
    const inc = screen.getByRole("button", { name: "Increase quantity" });
    expect(isDisabled(dec)).toBe(true);
    await user.click(inc);
    expect(screen.getByRole("status").textContent).toBe("2");
    expect(isDisabled(inc)).toBe(true);
    expect(isDisabled(dec)).toBe(false);
  });
});

describe("OptionPillGroup", () => {
  const options: PillOption[] = [
    { value: "a", label: "30 g", sub: "$[48.00]", available: true },
    { value: "b", label: "100 g", sub: "+$[92.00]", available: false },
  ];
  function Harness() {
    const [v, setV] = useState("a");
    return <OptionPillGroup label="Size" options={options} value={v} onChange={setV} />;
  }

  it("is a radiogroup with arrow-key selection and sold-out labelling", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const [first, second] = screen.getAllByRole("radio");
    if (!first || !second) throw new Error("expected two radios");
    expect(first.getAttribute("aria-checked")).toBe("true");
    expect(second.getAttribute("tabindex")).toBe("-1");
    expect(second.textContent).toContain("Sold out");
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(second.getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(second);
  });
});

describe("Accordion", () => {
  it("toggles aria-expanded and panel visibility", async () => {
    const user = userEvent.setup();
    render(<Accordion items={[{ id: "q1", title: "How do I store it?", content: "Cool and dry." }]} />);
    const trigger = screen.getByRole("button", { name: "How do I store it?" });
    const panel = screen.getByText("Cool and dry.");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hidden).toBe(false);
  });
});
