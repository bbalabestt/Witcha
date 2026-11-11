import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { LIVE_ROUTES, prepare } from "./helpers";

const ROUTES = [...LIVE_ROUTES, "/this-page-does-not-exist"];

test.beforeEach(async ({ page }) => prepare(page));

for (const route of ROUTES) {
  test(`no serious or critical axe violations: ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}
