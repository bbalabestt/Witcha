import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3200);

/**
 * e2e runs against a production build on fixtures (no Shopify credentials). `pnpm e2e` builds and starts it;
 * set E2E_BASE_URL to test an already-running server. Visual snapshots are opt-in: `pnpm e2e --project=visual`.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, testIgnore: /visual/ },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } }, testMatch: /mobile|a11y/ },
    { name: "visual", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, contextOptions: { reducedMotion: "reduce" } }, testMatch: /visual/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm build && pnpm start --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        env: { COMMERCE_SOURCE: "fixtures" },
      },
});
