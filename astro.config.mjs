import { fileURLToPath, URL } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";
import icon from "astro-icon";

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
  integrations: [solidJs(), icon()],

  vite: {
    css: {
      transformer: "lightningcss",
    },
    plugins: [mockDebugPlugin()],
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
