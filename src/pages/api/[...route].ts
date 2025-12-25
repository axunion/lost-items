import type { APIRoute } from "astro";
import app from "../../server";

export const ALL: APIRoute = (context) => {
	// Use real server with Cloudflare bindings
	// In dev mode, bindings are provided by wrangler/miniflare
	return app.fetch(context.request, context.locals.runtime.env);
};
