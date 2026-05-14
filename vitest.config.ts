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
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"**/*.test.*",
				"**/*.module.css",
				"src/env.d.ts",
				"src/server/bindings.ts",
				"src/server/db/schema.ts",
				"src/pages/**/*.astro",
			],
		},
		server: {
			deps: {
				inline: [/@kobalte\/core/, "lucide-solid"],
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
