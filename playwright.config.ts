import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // Sequential: concurrent requests cause miniflare (workerd local) to hang
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
    extraHTTPHeaders: { origin: "http://localhost:4321" },
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    // `url` readiness checks require a 2xx-3xx response, but this app has no page at "/"
    // (routes are all under dynamic segments like /:token/dashboard) so root always 404s.
    // `port` only waits for the TCP listener, which matches what we actually need here.
    port: 4321,
    reuseExistingServer: !process.env.CI,
    // Astro auto-detects AI coding agent environments (e.g. Claude Code) and daemonizes
    // `astro dev` in the background, causing the spawned process to exit immediately and
    // Playwright to report "Process from config.webServer exited early". This opts out of
    // that auto-detection so the dev server stays in the foreground as Playwright expects.
    env: { ASTRO_DEV_BACKGROUND: "1" },
  },
});
