import { Hono } from "hono";
import type { Bindings } from "../bindings";

export const imagesRoute = new Hono<{ Bindings: Bindings }>();

// Key format: {listId}/{uuid}-{filename}
const KEY_PATTERN = /^[a-f0-9-]{36}\/[a-f0-9-]{36}-[\w.-]+$/i;

// Serve image from R2
imagesRoute.get("/:key{.+}", async (c) => {
	const key = c.req.param("key");

	if (!key || !KEY_PATTERN.test(key)) {
		return c.json({ error: "Invalid key format" }, 400);
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
