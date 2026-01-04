import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../bindings";
import { createDb } from "../db";
import { items, lists } from "../db/schema";

export const listsRoute = new Hono<{ Bindings: Bindings }>();

// Get all lists
listsRoute.get("/", async (c) => {
	const db = createDb(c.env.DB);
	const result = await db.select().from(lists).orderBy(desc(lists.createdAt));
	return c.json(result);
});

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

// Update a list name
listsRoute.patch(
	"/:id",
	zValidator(
		"json",
		z.object({
			name: z.string().min(1),
		}),
	),
	async (c) => {
		const id = c.req.param("id");
		const { name } = c.req.valid("json");
		const db = createDb(c.env.DB);

		const existing = await db
			.select()
			.from(lists)
			.where(eq(lists.id, id))
			.get();

		if (!existing) {
			return c.json({ error: "List not found" }, 404);
		}

		await db.update(lists).set({ name }).where(eq(lists.id, id));

		return c.json({ id, name });
	},
);

// Delete a list and its items
listsRoute.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const db = createDb(c.env.DB);

	const existing = await db.select().from(lists).where(eq(lists.id, id)).get();

	if (!existing) {
		return c.json({ error: "List not found" }, 404);
	}

	// Get items to clean up R2 images
	const itemsToDelete = await db
		.select()
		.from(items)
		.where(eq(items.listId, id));

	// Delete images from R2
	for (const item of itemsToDelete) {
		if (item.imageUrl) {
			const key = item.imageUrl.replace("/api/images/", "");
			await c.env.BUCKET.delete(key);
		}
	}

	// Delete from database using transaction
	await db.transaction(async (tx) => {
		await tx.delete(items).where(eq(items.listId, id));
		await tx.delete(lists).where(eq(lists.id, id));
	});

	return c.json({ success: true });
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

		let imageUrl: string | undefined;

		if (image && image.size > 0) {
			// Basic verification
			if (!image.type.startsWith("image/")) {
				return c.json({ error: "Invalid file type" }, 400);
			}
			if (image.size > 5 * 1024 * 1024) {
				return c.json({ error: "File too large (max 5MB)" }, 400);
			}

			const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
			const key = `${listId}/${crypto.randomUUID()}-${safeName}`;
			await c.env.BUCKET.put(key, image, {
				httpMetadata: { contentType: image.type },
			});
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

// Update item comment
listsRoute.patch(
	"/:id/items/:itemId",
	zValidator(
		"json",
		z.object({
			comment: z.string().max(1000),
		}),
	),
	async (c) => {
		const listId = c.req.param("id");
		const itemId = c.req.param("itemId");
		const { comment } = c.req.valid("json");
		const db = createDb(c.env.DB);

		const existing = await db
			.select()
			.from(items)
			.where(and(eq(items.id, itemId), eq(items.listId, listId)))
			.get();

		if (!existing) {
			return c.json({ error: "Item not found" }, 404);
		}

		await db.update(items).set({ comment }).where(eq(items.id, itemId));

		return c.json({ ...existing, comment });
	},
);

// Soft delete an item
listsRoute.delete("/:id/items/:itemId", async (c) => {
	const listId = c.req.param("id");
	const itemId = c.req.param("itemId");
	const db = createDb(c.env.DB);

	const existing = await db
		.select()
		.from(items)
		.where(and(eq(items.id, itemId), eq(items.listId, listId)))
		.get();

	if (!existing) {
		return c.json({ error: "Item not found" }, 404);
	}

	await db
		.update(items)
		.set({ deletedAt: new Date() })
		.where(eq(items.id, itemId));

	return c.json({ success: true });
});

// Restore a deleted item
listsRoute.post("/:id/items/:itemId/restore", async (c) => {
	const listId = c.req.param("id");
	const itemId = c.req.param("itemId");
	const db = createDb(c.env.DB);

	const existing = await db
		.select()
		.from(items)
		.where(and(eq(items.id, itemId), eq(items.listId, listId)))
		.get();

	if (!existing) {
		return c.json({ error: "Item not found" }, 404);
	}

	if (!existing.deletedAt) {
		return c.json({ error: "Item is not deleted" }, 400);
	}

	await db.update(items).set({ deletedAt: null }).where(eq(items.id, itemId));

	return c.json({ success: true });
});
