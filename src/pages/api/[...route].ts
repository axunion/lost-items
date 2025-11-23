import type { APIRoute } from "astro";
import app from "../../server";

export const ALL: APIRoute = (context) => {
	return app.fetch(context.request, context.locals.runtime.env);
};
