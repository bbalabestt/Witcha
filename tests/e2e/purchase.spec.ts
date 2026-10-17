import { expect, test } from "@playwright/test";
import { prepare } from "./helpers";

test.beforeEach(async ({ page }) => prepare(page));

test("home → collection → PDP → size → add → drawer → Shopify checkout handoff", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Shop the matcha" }).first().click();
  await expect(page).toHaveURL(/\/collections\/matcha/);
  await expect(page.getByRole("heading", { level: 1, name: "Which Matcha Today?" })).toBeVisible();

  await page.getByRole("link", { name: /Yame no Mukashi/ }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Yame no Mukashi" })).toBeVisible();

  // The 100 g size is sold out: the button becomes Notify me, never an active Add to cart.
  await page.getByRole("radio", { name: /100 g/ }).click();
  await expect(page.getByText("Sold out in 100 g.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Add to cart ·/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Notify me" })).toBeVisible();

  await page.getByRole("radio", { name: /30 g/ }).click();
  await expect(page).toHaveURL(/variant=y30/);
  await page.getByRole("button", { name: /Add to cart · \$\[48\.00\]/ }).click();

  const drawer = page.getByRole("dialog", { name: /Your cart \(1\)/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Yame no Mukashi")).toBeVisible();
  await expect(drawer.getByText(/away from free shipping/)).toBeVisible();

  await drawer.getByRole("button", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/dev\/checkout\?cart=/);
  await expect(page.getByText("Shopify-hosted · layout not custom · brand settings only")).toBeVisible();
});

test("cart survives a reload and the page shows the same lines", async ({ page }) => {
  await page.goto("/collections/matcha");
  await page.getByRole("button", { name: "Add to cart: Kosen Daily Matcha" }).click();
  await expect(page.getByRole("dialog", { name: /Your cart \(1\)/ })).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByRole("heading", { level: 1, name: "Your cart (1)" })).toBeVisible();
  // Stock is 3: the stepper stops there.
  const plus = page.getByRole("main").getByRole("button", { name: "Increase quantity" });
  await plus.click();
  await plus.click();
  await expect(page.getByRole("main").getByText("Only 3 available")).toBeVisible();
  await expect(plus).toBeDisabled();
});

test("keyboard only: add to cart and reach checkout", async ({ page }) => {
  await page.goto("/products/the-charmer");
  const add = page.getByRole("button", { name: /Add to cart · / });
  await add.focus();
  await page.keyboard.press("Enter");
  const drawer = page.getByRole("dialog", { name: /Your cart/ });
  await expect(drawer).toBeVisible();
  // Focus is trapped in the drawer; Tab cycles to the checkout button.
  for (let i = 0; i < 20; i++) {
    if (await drawer.getByRole("button", { name: "Checkout" }).evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(drawer.getByRole("button", { name: "Checkout" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dev\/checkout/);
});

test("Esc closes the drawer and returns focus to the trigger", async ({ page }) => {
  await page.goto("/");
  const cart = page.getByRole("button", { name: /^Cart/ });
  await cart.click();
  await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeHidden();
  await expect(cart).toBeFocused();
});
