import { fileURLToPath, URL } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: cloudflare({
		imageService: "compile",
		cloudflareModules: true,
	}),
	integrations: [solidJs(), icon()],
	image: {
		service: { entrypoint: "astro/assets/services/noop" },
	},

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"~": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
	},
});
