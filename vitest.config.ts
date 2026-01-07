import { fileURLToPath, URL } from "node:url";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [solid()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
		exclude: ["node_modules", "tests/e2e"],
		server: {
			deps: {
				inline: [/@kobalte\/core/],
			},
		},
		alias: {
			"~": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	resolve: {
		conditions: ["development", "browser"],
	},
});
