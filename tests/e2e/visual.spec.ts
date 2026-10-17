import { expect, test } from "@playwright/test";
import { prepare } from "./helpers";

/**
 * Screenshot baselines for Home, Collection, PDP (default, sold out), cart drawer (empty, filled) and mobile PDP.
 * Opt-in: `pnpm e2e --project=visual --update-snapshots` records them, then compare against Prototype V4.
 */
test.beforeEach(async ({ page }) => prepare(page));

const shot = { fullPage: true, animations: "disabled" as const, maxDiffPixelRatio: 0.02 };

test("home", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home.png", shot);
});

test("collection", async ({ page }) => {
  await page.goto("/collections/matcha");
  await expect(page).toHaveScreenshot("collection.png", shot);
});

test("pdp default and sold-out size", async ({ page }) => {
  await page.goto("/products/yame-no-mukashi");
  await expect(page).toHaveScreenshot("pdp.png", shot);
  await page.goto("/products/yame-no-mukashi?variant=y100");
  await expect(page.getByRole("button", { name: "Notify me" })).toBeVisible();
  await expect(page).toHaveScreenshot("pdp-sold-out.png", shot);
});

test("cart drawer empty and filled", async ({ page }) => {
  await page.goto("/collections/matcha");
  await page.getByRole("button", { name: /^Cart/ }).click();
  await expect(page.getByRole("dialog", { name: /Your cart \(0\)/ })).toHaveScreenshot("drawer-empty.png");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Add to cart: The Charmer" }).click();
  const drawer = page.getByRole("dialog", { name: /Your cart \(1\)/ });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveScreenshot("drawer-filled.png");
});
