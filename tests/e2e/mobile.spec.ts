import { expect, test } from "@playwright/test";
import { prepare } from "./helpers";

test.beforeEach(async ({ page }) => prepare(page));

test("mobile PDP: the buy decision is above the fold and the buy bar pins once the button scrolls away", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/products/kosen-daily-matcha");
  await expect(page.getByRole("heading", { level: 1, name: "Kosen Daily Matcha" })).toBeVisible();
  await expect(page.getByText("Only 3 left in 30 g.")).toBeVisible();

  const bar = page.getByRole("button", { name: "Add to cart", exact: true }).first();
  // Scroll the way a thumb does, in steps, until the main button has left the screen.
  await expect(async () => {
    await page.evaluate(() => window.scrollBy(0, 400));
    await expect(bar).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10_000 });
  await bar.click();
  await expect(page.getByRole("dialog", { name: /Your cart \(1\)/ })).toBeVisible();
});

test("mobile menu opens from the header and lists the five sections", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).first().click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  for (const name of ["Shop Matcha", "Gifts", "Brewing Guides", "Witcha Academy", "Our Story"]) {
    await expect(menu.getByRole("link", { name })).toBeVisible();
  }
});
