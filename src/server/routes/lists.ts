import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings } from "../bindings";
import { createDb } from "../db";
import { items, lists } from "../db/schema";

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

// Add item to a list
listsRoute.post("/:id/items", async (c) => {
	const listId = c.req.param("id");
	const db = createDb(c.env.DB);

	const formData = await c.req.formData();
	const comment = formData.get("comment") as string | null;
	const image = formData.get("image") as File | null;

	let imageUrl: string | undefined;

	if (image && image.size > 0) {
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
});
