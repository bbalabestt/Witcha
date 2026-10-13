import { expect, test } from "@playwright/test";
import { CHECKOUT_ORIGIN, stubCheckout } from "./helpers";

test.describe("purchase path", () => {
  test("home → collection → PDP → change size → add to cart → drawer → checkout", async ({ page }) => {
    await stubCheckout(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Shop the matcha" }).first().click();
    await expect(page).toHaveURL(/\/collections\/matcha$/);
    await expect(page.getByRole("heading", { level: 1, name: "Which Matcha Today?" })).toBeVisible();

    await page.getByRole("link", { name: "Yame no Mukashi", exact: true }).first().click();
    await expect(page).toHaveURL(/\/products\/yame/);

    // Sold-out size: Notify me, never Add to cart.
    await page.getByRole("radio", { name: /100 g/ }).click();
    await expect(page).toHaveURL(/variant=1001100/);
    await expect(page.getByText("Sold out in 100 g.")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Add to cart/ })).toHaveCount(0);

    // Back to the 30 g tin, two of them.
    await page.getByRole("radio", { name: /30 g/ }).click();
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await page.getByRole("button", { name: "Add to cart · $[96.00]" }).click();

    const drawer = page.getByRole("dialog", { name: /Your cart/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("heading", { name: "Your cart (2)" })).toBeVisible();
    await expect(drawer.getByText("Free shipping unlocked.")).toBeVisible();
    const checkout = drawer.getByRole("link", { name: "Checkout" });
    await expect(checkout).toHaveAttribute("href", new RegExp(`^${CHECKOUT_ORIGIN}/cart/c/`));

    await checkout.click();
    await expect(page).toHaveURL(new RegExp(`^${CHECKOUT_ORIGIN}/cart/c/`));
  });

  test("cart persists across reloads and updates quantities", async ({ page }) => {
    await page.goto("/products/daily");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /^Add to cart/ }).click();
    await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1, name: "Your cart" })).toBeVisible();
    const plus = page.getByRole("button", { name: /Increase quantity of \[Daily tea name\]/i });
    await plus.click();
    await expect(page.getByRole("group", { name: /Quantity of \[Daily tea name\]/i }).getByRole("status")).toHaveText(/2|3/);
    await page.reload();
    await expect(page.getByRole("complementary", { name: "Order summary" })).toContainText("Subtotal");
    await page.getByRole("button", { name: /Remove \[Daily tea name\]/ }).click();
    await expect(page.locator("#main").getByText("Your cart is empty. Which matcha today?")).toBeVisible();
  });

  test("keyboard only: add to cart and reach checkout", async ({ page }) => {
    await stubCheckout(page);
    await page.goto("/products/daily");
    await page.waitForLoadState("networkidle");
    const add = page.getByRole("button", { name: /^Add to cart/ });
    // Tab until the Add to cart button has focus (bounded).
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press("Tab");
      if (await add.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(add).toBeFocused();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: /Your cart/ });
    await expect(drawer).toBeVisible();
    // Focus is trapped in the drawer; tab to Checkout and press Enter.
    const checkout = drawer.getByRole("link", { name: "Checkout" });
    await expect(checkout).toBeVisible();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      if (await checkout.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(checkout).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`^${CHECKOUT_ORIGIN}/`));
  });

  test("Escape closes the drawer and returns focus", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const cartButton = page.getByRole("button", { name: /^Cart, / });
    await cartButton.click();
    await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeHidden();
    await expect(cartButton).toBeFocused();
  });
});
