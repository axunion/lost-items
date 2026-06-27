import { fileURLToPath, URL } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";

// Prevent "module is not defined" error from the debug package in workerd runtime.
// The debug package uses CJS `module.exports` which is not available in workerd.
function mockDebugPlugin() {
  return {
    name: "mock-debug",
    enforce: "pre",
    resolveId(id) {
      if (id === "debug" || id.endsWith("/debug/src/index.js")) {
        return "\0mock-debug";
      }
    },
    load(id) {
      if (id === "\0mock-debug") {
        return "export default function debug() { return function() {}; }; debug.enable = () => {}; debug.disable = () => {};";
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "compile",
  }),
  integrations: [solidJs()],

  vite: {
    css: {
      transformer: "lightningcss",
    },
    plugins: [mockDebugPlugin()],
    // @astrojs/cloudflare@14.0.1 merges these into SSR/astro environments via its
    // own configEnvironment hook (called eagerly by Astro — no "config changed"
    // re-optimization, unlike plugins that call configEnvironment from vite.plugins).
    optimizeDeps: {
      include: [
        // Discovered late during the first SSR page render
        "@astrojs/cloudflare/entrypoints/server",
        "drizzle-orm",
        // Discovered late when API routes are first hit
        "hono",
        "zod",
        "@hono/zod-validator",
      ],
      // lucide-solid and @kobalte/core ship JSX via the "solid" export condition.
      // Rolldown cannot transform JSX during pre-bundling, so they are excluded.
      // vite-plugin-solid handles the JSX transform at request time instead.
      exclude: ["lucide-solid", "@kobalte/core"],
    },
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      warmup: {
        clientFiles: ["./src/components/features/**/*.tsx"],
      },
    },
  },
});
