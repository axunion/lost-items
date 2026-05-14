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
		url: "http://localhost:4321",
		reuseExistingServer: !process.env.CI,
	},
});
