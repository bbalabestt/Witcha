import { expect, test } from "@playwright/test";
import { openProduct, prepare } from "./helpers";

test.beforeEach(async ({ page }) => prepare(page));

test("home states the category, the range and the action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Matcha, With Taste." })).toBeVisible();
  await expect(page.locator("[data-hero-copy]").getByText("Japanese matcha & hojicha")).toBeVisible();
  await expect(page.getByRole("link", { name: "Shop the teas" }).first()).toHaveAttribute("href", "/collections/teas");
  await page.locator("[data-hero-copy]").getByRole("link", { name: "Find your tea" }).click();
  // The hero is a tall scroll scene, so the smooth scroll to the tea selection takes a moment.
  await expect(page.locator("#find-your-tea")).toBeInViewport({ timeout: 10_000 });
});

test("home → Teas → product → add → drawer → checkout handoff", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("main").getByRole("link", { name: "Shop the teas" }).first().click();
  await expect(page).toHaveURL(/\/collections\/teas/);
  await expect(page.getByRole("heading", { level: 1, name: "Japanese matcha and hojicha" })).toBeVisible();

  await page.getByRole("link", { name: /The Professor — Yame Matcha/ }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "The Professor — Yame Matcha" })).toBeVisible();

  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  const drawer = page.getByRole("dialog", { name: /Your cart \(1\)/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("The Professor — Yame Matcha · 30 g")).toBeVisible();
  await expect(drawer.getByText(/free shipping|Subtotal|discount/i)).toHaveCount(0);

  await drawer.getByRole("button", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/dev\/checkout\?cart=/);
  await expect(page.getByText("1 × The Professor — Yame Matcha · 30 g")).toBeVisible();
});

test("Add to cart works on the first tap, with no waiting", async ({ page }) => {
  await page.goto("/products/the-rebel-kagoshima-matcha");
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await expect(page.getByRole("dialog", { name: /Your cart \(1\)/ })).toBeVisible();
});

test("product page follows the client's order", async ({ page }) => {
  await openProduct(page, "the-professor-yame-matcha");
  // Compared in lower case: labels and buttons are uppercased by CSS. Each must follow the one before it.
  const text = (await page.getByRole("main").innerText()).toLowerCase();
  let from = 0;
  for (const part of [
    "okumidori · first harvest · 30 g",
    "tasting words",
    "creamy · umami · macadamia",
    "best for",
    "choose it if",
    "add to cart",
    "our yame matcha",
    "mostly drink lattes?",
    "packed in",
    "how to make it",
    "faq",
    "find your next cup",
  ]) {
    const at = text.indexOf(part, from);
    expect(at, part).toBeGreaterThanOrEqual(0);
    from = at + part.length;
  }
});

test("The Librarian is sold as hojicha, not matcha", async ({ page }) => {
  await openProduct(page, "the-librarian-uji-hojicha");
  await expect(page.getByText("Hojicha · Roasted Japanese green tea · 30 g")).toBeVisible();
  const text = await page.getByRole("main").innerText();
  expect(text).not.toMatch(/Matcha 2 g|Shop Matcha|organic/i);
  await expect(page.getByRole("heading", { name: "How to make it" })).toHaveCount(0);
});

test("held [confirm] blocks stay off The Rebel's page and card", async ({ page }) => {
  await openProduct(page, "the-rebel-kagoshima-matcha");
  const text = await page.getByRole("main").innerText();
  expect(text).not.toMatch(/Chestnut ·|Bold · Rich|Okumidori blend|Cultivar|Harvest/);
  await page.goto("/collections/teas");
  await expect(page.getByText("Bold · Rich · Chestnut")).toHaveCount(0);
});

test("cart survives a reload and the stepper stops at stock", async ({ page }) => {
  await page.goto("/products/the-scholar-japanese-matcha-blend");
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await expect(page.getByRole("dialog", { name: /Your cart \(1\)/ })).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByRole("heading", { level: 1, name: "Your cart (1)" })).toBeVisible();
  // Stock is 3: the stepper stops there.
  const plus = page.getByRole("main").getByRole("button", { name: "Increase quantity" });
  await plus.click();
  await expect(page.getByRole("main").locator("output")).toHaveText("2");
  await plus.click();
  await expect(page.getByRole("main").getByText("Maximum 3")).toBeVisible();
  await expect(plus).toBeDisabled();
});

test("keyboard only: add to cart and reach checkout", async ({ page }) => {
  await page.goto("/products/the-rebel-kagoshima-matcha");
  const add = page.getByRole("button", { name: "Add to cart", exact: true }).first();
  await add.focus();
  await page.keyboard.press("Enter");
  const drawer = page.getByRole("dialog", { name: /Your cart/ });
  await expect(drawer).toBeVisible();
  // Focus is trapped in the drawer; Tab cycles to the checkout button.
  const checkout = drawer.getByRole("button", { name: "Checkout" });
  await expect(checkout).toBeEnabled();
  for (let i = 0; i < 20; i++) {
    if (await checkout.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(checkout).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dev\/checkout/);
});

test("Esc closes the drawer and returns focus to the trigger", async ({ page }) => {
  await page.goto("/");
  const cart = page.getByRole("button", { name: /^Cart/ });
  await cart.click();
  await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Your cart/ })).toHaveCount(0);
  await expect(cart).toBeFocused();
});

test("recipes and FAQ link through", async ({ page }) => {
  await page.goto("/pages/faq");
  await expect(page.getByRole("button", { name: "Do you grow or blend your own tea?" })).toBeVisible();
  await page.goto("/pages/recipes");
  await expect(page.getByRole("heading", { name: "Usucha (classic matcha)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hojicha latte" })).toHaveCount(0);
});

test("search finds teas by category", async ({ page }) => {
  await page.goto("/search?q=hojicha");
  await expect(page.getByRole("link", { name: /The Librarian — Uji Hojicha/ })).toBeVisible();
});
