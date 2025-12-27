import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../bindings";
import { createDb } from "../db";
import { items, lists } from "../db/schema";

export const listsRoute = new Hono<{ Bindings: Bindings }>();

// Create a new list
listsRoute.post(
	"/",
	zValidator(
		"json",
		z.object({
			name: z.string().optional(),
		}),
	),
	async (c) => {
		const { name } = c.req.valid("json");
		const id = crypto.randomUUID();
		const db = createDb(c.env.DB);

		await db.insert(lists).values({
			id,
			name: name || null,
			createdAt: new Date(),
		});

		return c.json({ id });
	},
);

// Get a list by ID
listsRoute.get("/:id", async (c) => {
	const id = c.req.param("id");
	const db = createDb(c.env.DB);

	const result = await db.select().from(lists).where(eq(lists.id, id)).get();

	if (!result) {
		return c.json({ error: "List not found" }, 404);
	}

	return c.json(result);
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

// Add item to a list
listsRoute.post(
	"/:id/items",
	zValidator(
		"form",
		z.object({
			comment: z.string().max(1000).optional(),
			image: z.instanceof(File).optional(),
		}),
	),
	async (c) => {
		const listId = c.req.param("id");
		const db = createDb(c.env.DB);
		const { comment, image } = c.req.valid("form");

		// Verify list exists first? Optional but good practice.
		// For now keeping it simple as per original logic, relying on FK constraints if enforced,
		// but D1 doesn't always enforce FKs strictly without PRAGMA foreign_keys = ON;
		// The original code didn't check. Adding a check for robustness could be good but let's stick to the plan.

		let imageUrl: string | undefined;

		if (image && image.size > 0) {
			// Basic verification
			if (!image.type.startsWith("image/")) {
				return c.json({ error: "Invalid file type" }, 400);
			}
			if (image.size > 5 * 1024 * 1024) {
				return c.json({ error: "File too large (max 5MB)" }, 400);
			}

			const key = `${listId}/${crypto.randomUUID()}-${image.name}`;
			await c.env.BUCKET.put(key, image);
			imageUrl = `/api/images/${key}`;
		}

		const newItem = {
			id: crypto.randomUUID(),
			listId,
			comment: comment || "",
			imageUrl,
			createdAt: new Date(),
		};

		await db.insert(items).values(newItem);

		return c.json(newItem);
	},
);
