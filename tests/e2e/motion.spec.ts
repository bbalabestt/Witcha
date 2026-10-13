import { expect, test } from "@playwright/test";

/** Prototype V2 motion with motion allowed: Academy wheel, pixel familiar, route curtain. */
test.describe("motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  test("the Academy wheel turns with scroll", async ({ page }) => {
    await page.goto("/");
    const wheel = page.locator("section[aria-labelledby='wheel-title']");
    await expect(wheel).toBeVisible();
    const count = wheel.getByText(/^Showing\s*01 \//);
    await expect(count).toBeAttached();
    await wheel.evaluate((el: HTMLElement) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + (el.offsetHeight - window.innerHeight));
    });
    await expect(wheel.locator("[aria-live]")).toHaveText(/(\d+) \/ \1$/);
  });

  test("the familiar answers add to cart and can be hidden", async ({ page }) => {
    await page.goto("/products/daily");
    const cat = page.getByRole("button", { name: "The Academy cat", exact: true });
    await expect(cat).toBeVisible();
    await page.getByRole("button", { name: /^Add to cart/ }).first().click();
    await expect(page.getByText("Into the cart it goes.")).toBeAttached();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Hide the Academy cat" }).click();
    await expect(cat).toBeHidden();
  });

  test("the route curtain covers navigation and lifts", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer a[href='/collections/gifts']").first().click();
    await page.waitForURL("**/collections/gifts");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
