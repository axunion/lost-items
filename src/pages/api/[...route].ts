import type { APIRoute } from "astro";
import app from "../../server";
import mockApp from "../../server/mock";

const isDev = import.meta.env.DEV;

export const ALL: APIRoute = (context) => {
	// Use mock server in development mode (no D1/R2 bindings)
	if (isDev) {
		return mockApp.fetch(context.request);
	}

	// Use real server in production with Cloudflare bindings
	return app.fetch(context.request, context.locals.runtime.env);
};
