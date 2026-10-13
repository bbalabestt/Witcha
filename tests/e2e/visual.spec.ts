import { expect, test } from "@playwright/test";
import { settle } from "./helpers";

/**
 * Screenshot regression tests. Baselines are this build's own renders (reviewed against Prototype V2
 * by eye); they catch unintended visual change from here on.
 */
const PAGES: Array<[string, string]> = [
  ["home", "/"],
  ["collection", "/collections/matcha"],
  ["pdp-default", "/products/yame"],
  ["pdp-sold-out", "/products/yame?variant=1001100"],
];

test.describe("visual", () => {
  for (const [name, url] of PAGES) {
    test(`${name} @mobile`, async ({ page }) => {
      await settle(page);
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: false });
    });
  }

  test("cart drawer: empty, filled, threshold reached @mobile", async ({ page }) => {
    await settle(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /^Cart, / }).click();
    const drawer = page.getByRole("dialog", { name: /Your cart/ });
    await expect(drawer.getByText("Your cart is empty. Which matcha today?")).toBeVisible();
    await expect(page).toHaveScreenshot("drawer-empty.png");
    await page.keyboard.press("Escape");

    await page.goto("/products/daily");

    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /^Add to cart/ }).click();
    await expect(drawer.getByText(/away from free shipping/)).toBeVisible();
    await expect(page).toHaveScreenshot("drawer-filled.png");

    await drawer.getByRole("button", { name: /Increase quantity of/ }).click();
    await drawer.getByRole("button", { name: /Increase quantity of/ }).click();
    await expect(drawer.getByText("Free shipping unlocked.")).toBeVisible();
    await expect(page).toHaveScreenshot("drawer-threshold.png");
  });

  test("mobile PDP with sticky bar @mobile", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile only");
    await settle(page);
    await page.goto("/products/yame");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 2400));
    await expect(page.locator("[data-visible]").filter({ hasText: "Add to cart" })).toBeVisible();
    await expect(page).toHaveScreenshot("pdp-sticky-mobile.png");
  });
});
