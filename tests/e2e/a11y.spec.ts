import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { settle } from "./helpers";

const ROUTES = [
  "/",
  "/collections/matcha",
  "/collections/gifts",
  "/collections/accessories",
  "/products/yame",
  "/products/yame?variant=1001100",
  "/products/two-tin-discovery-set",
  "/cart",
  "/search?q=iced",
  "/blogs/brewing-guides",
  "/blogs/brewing-guides/how-to-whisk-matcha",
  "/pages/academy",
  "/pages/our-story",
  "/pages/faq",
  "/pages/shipping-returns",
  "/pages/contact",
  "/policies/privacy-policy",
  "/this-does-not-exist",
];

for (const route of ROUTES) {
  test(`axe: ${route} has no serious or critical violations`, async ({ page }) => {
    await settle(page);
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")})`)).toEqual([]);
  });
}

test("axe: open cart drawer, menu and search", async ({ page }) => {
  await settle(page);
  await page.goto("/products/daily");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /^Add to cart/ }).click();
  await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
  let r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Search" }).click();
  await page.keyboard.type("yame");
  await expect(page.getByRole("link", { name: /Yame no Mukashi/ })).toBeVisible();
  r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
});
