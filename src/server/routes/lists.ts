import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { items, lists } from "../db/schema";
import type { Bindings } from "../bindings";

export const listsRoute = new Hono<{ Bindings: Bindings }>();

// Create a new list
listsRoute.post("/", async (c) => {
	const id = crypto.randomUUID();
	const db = createDb(c.env.DB);

	await db.insert(lists).values({
		id,
		createdAt: new Date(),
	});

	return c.json({ id });
});

// Get items for a list
listsRoute.get("/:id/items", async (c) => {
	const listId = c.req.param("id");
	const db = createDb(c.env.DB);

	const result = await db
		.select()
		.from(items)
		.where(eq(items.listId, listId))
		.orderBy(desc(items.createdAt));

	return c.json(result);
});

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Add item to a list (Multipart form data for image)
// listsRoute.post(
// 	"/:id/items",
// 	zValidator(
// 		"form",
// 		z.object({
// 			comment: z.string(),
// 			image: z.instanceof(File).optional().or(z.string().optional()), // Hono sometimes parses empty file input as empty string
// 		}),
// 	),
// 	async (c) => {
// 		const listId = c.req.param("id");
// 		const db = createDb(c.env.DB);

// 		const { comment, image } = c.req.valid("form");

// 		let imageUrl: string | undefined;

// 		if (image && image instanceof File) {
// 			const key = `${listId}/${crypto.randomUUID()}-${image.name}`;
// 			await c.env.BUCKET.put(key, image);
// 			// In development (local), R2 URLs might need special handling or a proxy.
// 			// For now, we assume standard public access or signed URL pattern.
// 			// Since we don't have a custom domain set up, we might need to serve it via an API endpoint or assume public bucket.
// 			// For simplicity in this "mock-to-real" phase, let's store the key and serve via a proxy endpoint if needed,
// 			// OR just assume we can construct a URL.
// 			// Let's assume we will serve it via a proxy endpoint `/api/images/:key` for simplicity in local dev.
// 			imageUrl = `/api/images/${key}`;
// 		}

// 		const newItem = {
// 			id: crypto.randomUUID(),
// 			listId,
// 			comment,
// 			imageUrl,
// 			createdAt: new Date(),
// 		};

// 		await db.insert(items).values(newItem);

// 		return c.json(newItem);
// 	},
// );
