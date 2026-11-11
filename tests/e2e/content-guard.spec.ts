import { expect, test } from "@playwright/test";
import { HELD_ROUTES, LIVE_ROUTES, prepare } from "./helpers";

test.beforeEach(async ({ page }) => prepare(page));

for (const route of LIVE_ROUTES) {
  test(`${route} is clean and fits the screen`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/\[[^\]]*\]|PENDING|SAMPLE DATA|CONFIRM DETAIL|Shopify-hosted|reviews/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

for (const route of HELD_ROUTES) {
  test(`${route} stays hidden`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "This page has wandered off." })).toBeVisible();
  });
}

test("retired handles land on the not-found page", async ({ page }) => {
  await page.goto("/collections/matcha");
  await expect(page.getByRole("heading", { level: 1, name: "This page has wandered off." })).toBeVisible();
});

test("no live page links to a hidden or missing page", async ({ page, request }) => {
  await page.addInitScript(() => window.localStorage.removeItem("wm-consent"));
  const seen = new Set<string>();
  for (const route of LIVE_ROUTES) {
    await page.goto(route);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) seen.add(href.split("#")[0]!);
  }
  const broken: string[] = [];
  for (const href of seen) {
    if (href.startsWith("/dev/")) continue;
    if ((await request.get(href)).status() >= 400) broken.push(href);
  }
  expect(broken).toEqual([]);
});

test("the sitemap lists live routes only", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/products/the-professor-yame-matcha");
  for (const route of HELD_ROUTES) expect(xml).not.toContain(`${route}<`);
});

test("text is readable on arrival, with no hidden or blurred reveal", async ({ page }) => {
  await page.goto("/pages/faq");
  const heading = page.getByRole("heading", { level: 1, name: "FAQ" });
  const style = await heading.evaluate((el) => {
    const s = getComputedStyle(el);
    return { opacity: s.opacity, filter: s.filter };
  });
  expect(style).toEqual({ opacity: "1", filter: "none" });
});

test("the drawings are alive, the pause control stops every loop, and the choice is kept", async ({ page }) => {
  await page.goto("/");
  await page.locator("#find-your-tea").scrollIntoViewIfNeeded();
  const running = () =>
    page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && (a.effect as KeyframeEffect).getTiming().iterations === Infinity).length);
  await expect.poll(running).toBeGreaterThan(5);

  await page.getByRole("button", { name: "Pause animation" }).first().click();
  await expect.poll(running).toBe(0);
  await page.reload();
  await expect.poll(running).toBe(0);
  await page.getByRole("button", { name: "Play animation" }).first().click();
  await expect.poll(running).toBeGreaterThan(5);
});

test("the hero bowl is made on arrival, the cat peeks, and the pointer whisks it", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const canvas = page.locator("[data-arch] canvas");
  await expect(canvas).toBeVisible();
  // Matcha green in the middle of the bowl once the powder, water and whisking have played (about 3.5 s).
  const green = () =>
    canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext("2d")!;
      const [r, g, b] = ctx.getImageData(el.width / 2, el.height * 0.6, 1, 1).data;
      return g! > r! && g! > b! && g! - b! > 30;
    });
  await expect.poll(green, { timeout: 8_000 }).toBe(true);
  await expect(page.locator("[data-arch] svg[class*='cat']")).toBeVisible();

  const box = (await canvas.boundingBox())!;
  const before = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL());
  for (let i = 0; i < 12; i++) await page.mouse.move(box.x + box.width / 2 + Math.sin(i) * 60, box.y + box.height * 0.6);
  await expect.poll(() => canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL())).not.toBe(before);
});

test("reduced motion stops every loop and hides the pause control", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const looping = await page.evaluate(() => document.getAnimations().filter((a) => (a.effect as KeyframeEffect).getTiming().iterations === Infinity).length);
  expect(looping).toBe(0);
  await expect(page.getByRole("button", { name: "Pause animation" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Matcha, With Taste." })).toBeVisible();
});

test("scrolling grows the arch over the screen, whisks the bowl and fades the hero words", async ({ page }) => {
  await page.goto("/");
  const state = () =>
    page.evaluate(() => {
      const arch = document.querySelector("[data-arch]") as HTMLElement;
      const copy = document.querySelector("[data-hero-copy]") as HTMLElement;
      const foam = document.querySelector("[data-foam]") as HTMLElement;
      return {
        width: arch.getBoundingClientRect().width,
        copy: Number(getComputedStyle(copy).opacity),
        foam: Number(getComputedStyle(foam).opacity),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
  await expect.poll(async () => (await state()).width).toBeGreaterThan(0);
  const start = await state();
  expect(start.copy).toBe(1);
  await expect(page.getByRole("link", { name: "Shop the teas" }).first()).toBeVisible();

  const hero = await page.locator("section").first().evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo({ top: y * 0.6, behavior: "instant" }), hero);
  await expect.poll(async () => (await state()).width).toBeGreaterThan(start.width * 1.5);
  // The live bowl hands over to the full-screen foam at about 45% of the scene.
  await expect.poll(async () => (await state()).foam).toBe(1);
  const end = await state();
  expect(end).toMatchObject({ copy: 0, overflow: false });
});

test("reduced motion keeps a still hero, with the badge and bowl in plain view", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const height = await page.locator("section").first().evaluate((el) => el.getBoundingClientRect().height);
  expect(height).toBeLessThan(1500);
  await expect(page.locator("[data-spin]")).toBeVisible();
  await expect(page.locator("[data-arch]")).toBeVisible();
});

test("the client's words type in with the scroll, unlit first, and are readable before they do", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const letter = page.locator("[data-w]").filter({ hasText: "memorable." }).locator("[data-c]").first();
  const colour = () => letter.evaluate((el) => getComputedStyle(el).color);
  const body = page.locator("section[aria-labelledby='wm-why-title'] p");
  await body.evaluate((el) => el.closest("section")!.scrollIntoView({ block: "start", behavior: "instant" }));
  const unlit = await colour();
  expect(unlit).not.toBe("rgb(56, 56, 50)");
  await page.evaluate(() => window.scrollBy({ top: 900, behavior: "instant" }));
  await expect.poll(colour, { timeout: 10_000 }).toBe("rgb(56, 56, 50)");
  await expect(body).toContainText("Our co-founder Wichita tasted more than 40 Japanese tea samples");
});

test("past the header, the floating MENU arch sits top-left and TOP returns to the top", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("banner")).toBeVisible();

  await page.evaluate(() => window.scrollTo({ top: 1600, behavior: "instant" }));
  const menu = page.locator('[class*="archMenu"]');
  await expect(menu).toBeVisible();
  await expect.poll(async () => (await menu.boundingBox())?.y).toBeLessThan(24);
  expect((await menu.boundingBox())!.x).toBeLessThan(24);
  await menu.click();
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.locator('[class*="archTop"]').click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
});

test("the product page has its full set of sections, each from approved copy", async ({ page }) => {
  await page.goto("/products/the-professor-yame-matcha");
  const nav = page.getByRole("navigation", { name: "On this page" });
  for (const name of ["Description", "How to make it", "FAQ"]) await expect(nav.getByRole("link", { name })).toBeVisible();
  await expect(page.getByRole("radio", { name: /30 g/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Usucha (classic matcha)" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: "Do your teas contain caffeine?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find your next cup" })).toBeVisible();
  await page.getByRole("button", { name: "Show image 2" }).click();
});
