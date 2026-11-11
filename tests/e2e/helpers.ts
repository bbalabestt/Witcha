import type { Page } from "@playwright/test";

/** Pre-accepts cookies so the banner does not cover controls; each test gets a fresh cart cookie jar. */
export async function prepare(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("wm-consent", "all");
    } catch {
      // ignore
    }
  });
}

/** Pages stream in: wait for the last section of a product page before reading its text. */
export async function openProduct(page: Page, handle: string) {
  await page.goto(`/products/${handle}`);
  await page.getByRole("heading", { name: "Find your next cup" }).waitFor();
}

export const TEA_HANDLES = ["the-professor-yame-matcha", "the-scholar-japanese-matcha-blend", "the-rebel-kagoshima-matcha", "the-librarian-uji-hojicha"];

export const LIVE_ROUTES = ["/", "/collections/teas", ...TEA_HANDLES.map((h) => `/products/${h}`), "/pages/recipes", "/pages/academy", "/pages/faq", "/cart", "/search?q=yame"];

export const HELD_ROUTES = [
  "/collections/gifts",
  "/collections/accessories",
  "/pages/our-story",
  "/pages/contact",
  "/pages/shipping-returns",
  "/blogs/brewing-guides",
  "/blogs/brewing-guides/how-to-whisk-matcha",
  "/policies/privacy-policy",
];
