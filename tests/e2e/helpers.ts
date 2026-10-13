import type { Page } from "@playwright/test";

export const CHECKOUT_ORIGIN = "https://checkout.fixtures.invalid";

/** Fixture checkout URLs point at an .invalid host; answer them so navigation can be asserted. */
export async function stubCheckout(page: Page) {
  await page.route(`${CHECKOUT_ORIGIN}/**`, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Shopify checkout (stub)</h1>" }));
}

/** Freeze motion so screenshots are stable. */
export async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
}
