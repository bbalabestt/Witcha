import { expect, test } from "@playwright/test";
import { prepare } from "./helpers";

/**
 * Screenshot baselines for Home, Teas, a product page and the cart drawer (empty, filled).
 * Opt-in: `pnpm e2e --project=visual --update-snapshots` records them, then compare against the home mock.
 */
test.beforeEach(async ({ page }) => prepare(page));

const shot = { fullPage: true, animations: "disabled" as const, maxDiffPixelRatio: 0.02 };

test("home", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home.png", shot);
});

test("teas", async ({ page }) => {
  await page.goto("/collections/teas");
  await expect(page).toHaveScreenshot("teas.png", shot);
});

test("product page", async ({ page }) => {
  await page.goto("/products/the-professor-yame-matcha");
  await expect(page).toHaveScreenshot("pdp.png", shot);
});

test("cart drawer empty and filled", async ({ page }) => {
  await page.goto("/products/the-rebel-kagoshima-matcha");
  await page.getByRole("button", { name: /^Cart/ }).click();
  await expect(page.getByRole("dialog", { name: /Your cart \(0\)/ })).toHaveScreenshot("drawer-empty.png");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  const drawer = page.getByRole("dialog", { name: /Your cart \(1\)/ });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveScreenshot("drawer-filled.png");
});
