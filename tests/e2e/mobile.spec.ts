import { expect, test } from "@playwright/test";
import { prepare } from "./helpers";

test.beforeEach(async ({ page }) => prepare(page));

test("mobile product page: the buy decision comes first and the buy bar pins once the button scrolls away", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/products/the-scholar-japanese-matcha-blend");
  await expect(page.getByRole("heading", { level: 1, name: "The Scholar — Japanese Matcha Blend" })).toBeVisible();
  await expect(page.getByText("Toasty · Balanced · Nutty")).toBeInViewport();
  await expect(page.getByText("Choose it if")).toBeInViewport();

  const bar = page.getByRole("button", { name: "Add to cart", exact: true }).last();
  // Scroll the way a thumb does, in steps, until the main button has left the screen.
  await expect(async () => {
    await page.evaluate(() => window.scrollBy(0, 400));
    await expect(page.getByRole("button", { name: "Add to cart", exact: true })).toHaveCount(2, { timeout: 500 });
  }).toPass({ timeout: 10_000 });
  await bar.click();
  await expect(page.getByRole("dialog", { name: /Your cart \(1\)/ })).toBeVisible();
});

test("mobile menu opens from the floating arch and lists live pages only", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.locator('[class*="archMenu"]').click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  for (const name of ["Shop the teas", "Witcha Academy", "FAQ"]) await expect(menu.getByRole("link", { name })).toBeVisible();
  for (const name of ["Gifts", "Brewing Guides", "Our Story"]) await expect(menu.getByRole("link", { name })).toHaveCount(0);
});

test("no floating control covers the hero headline", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/");
  const box = await page.getByRole("heading", { level: 1 }).boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && box.x + box.width <= viewport.width).toBe(true);
});
