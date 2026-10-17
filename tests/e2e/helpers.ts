import type { Page } from "@playwright/test";

/** Pre-accepts cookies so the banner does not cover controls; each test gets a fresh cart cookie jar. */
export async function prepare(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("wm-consent", "all");
      window.sessionStorage.setItem("wm-promo-seen", "1");
    } catch {
      // ignore
    }
  });
}
