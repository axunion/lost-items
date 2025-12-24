import { Hono } from "hono";
import type { Bindings } from "../bindings";

export const imagesRoute = new Hono<{ Bindings: Bindings }>();

// Serve image from R2
imagesRoute.get("/*", async (c) => {
	const key = c.req.path.replace("/api/images/", "");

	if (!key) {
		return c.json({ error: "Key is required" }, 400);
	}

	const object = await c.env.BUCKET.get(key);

	if (!object) {
		return c.json({ error: "Image not found" }, 404);
	}

	const headers = new Headers();
	headers.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg");
	headers.set("Cache-Control", "public, max-age=31536000");

	return new Response(object.body, { headers });
});
