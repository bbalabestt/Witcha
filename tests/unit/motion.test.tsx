import { describe, expect, it, vi } from "vitest";
import { wheelFalloff, wheelIndex } from "@/components/home/AcademyWheel";
import { curtainTarget } from "@/components/layout/RouteCurtain";
import { cueFamiliar, onFamiliarCue } from "@/lib/familiar";

vi.mock("@/lib/cart/actions", () => ({ addToCart: vi.fn(), fetchCart: vi.fn(async () => null), updateCartLine: vi.fn(), removeCartLine: vi.fn(), updateGift: vi.fn() }));

describe("Academy wheel", () => {
  it("is sharpest under the pointer and fully dimmed from 30°", () => {
    expect(wheelFalloff(0)).toEqual({ opacity: 1, blur: 0, scale: 1.06 });
    const half = wheelFalloff(-15);
    expect(half.opacity).toBeCloseTo(0.675);
    expect(half.blur).toBeCloseTo(1);
    expect(wheelFalloff(30)).toEqual(wheelFalloff(90));
    expect(wheelFalloff(45).opacity).toBeCloseTo(0.35);
  });

  it("maps scroll progress to the card under the pointer", () => {
    expect(wheelIndex(0, 5)).toBe(0);
    expect(wheelIndex(0.5, 5)).toBe(2);
    expect(wheelIndex(1, 5)).toBe(4);
    expect(wheelIndex(-0.2, 5)).toBe(0);
    expect(wheelIndex(1.4, 5)).toBe(4);
  });
});

describe("route curtain", () => {
  const origin = window.location.origin;
  function click(html: string, init: MouseEventInit = {}) {
    document.body.innerHTML = html;
    const a = document.body.querySelector("a")!;
    const e = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
    Object.defineProperty(e, "target", { value: a });
    return e;
  }

  it("covers internal page changes", () => {
    expect(curtainTarget(click('<a href="/collections/gifts?sort=new#top">x</a>'), origin, "/")).toBe("/collections/gifts?sort=new#top");
  });

  it("stays out of the way of everything else", () => {
    expect(curtainTarget(click('<a href="/">x</a>'), origin, "/")).toBeNull();
    expect(curtainTarget(click('<a href="/cart">x</a>'), origin, "/")).toBeNull();
    expect(curtainTarget(click('<a href="/search?q=a">x</a>'), origin, "/")).toBeNull();
    expect(curtainTarget(click('<a href="https://example.com/x">x</a>'), origin, "/")).toBeNull();
    expect(curtainTarget(click('<a href="/x" target="_blank">x</a>'), origin, "/")).toBeNull();
    expect(curtainTarget(click('<a href="/x" download>x</a>'), origin, "/")).toBeNull();
    expect(curtainTarget(click('<a href="/x" data-no-curtain>x</a>'), origin, "/")).toBeNull();
    expect(curtainTarget(click('<a href="/x">x</a>', { metaKey: true }), origin, "/")).toBeNull();
    expect(curtainTarget(click('<a href="/x">x</a>', { button: 1 }), origin, "/")).toBeNull();
  });
});

describe("familiar cues", () => {
  it("delivers cues to listeners and unsubscribes", () => {
    const seen: string[] = [];
    const off = onFamiliarCue((c) => seen.push(c.say ?? ""));
    cueFamiliar({ say: "Into the cart it goes.", run: "cart" });
    off();
    cueFamiliar({ say: "ignored" });
    expect(seen).toEqual(["Into the cart it goes."]);
  });
});
