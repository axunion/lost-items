import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import type { Bindings } from "~/server/bindings";
import app from "../../server";

export const ALL: APIRoute = (context) => {
  // Use real server with Cloudflare bindings
  // In dev mode, bindings are provided by wrangler/miniflare
  return app.fetch(context.request, env as Bindings);
};
