import { Hono } from "hono";

// In-memory storage for local development
const mockLists = new Map<string, { id: string; createdAt: Date }>();
const mockItems = new Map<
	string,
	{
		id: string;
		listId: string;
		comment: string;
		imageUrl?: string;
		createdAt: Date;
	}
>();
const mockImages = new Map<string, { data: ArrayBuffer; type: string }>();

export const mockApp = new Hono();

// Create a new list
mockApp.post("/api/lists", async (c) => {
	const id = crypto.randomUUID();
	mockLists.set(id, { id, createdAt: new Date() });
	return c.json({ id });
});

// Get items for a list
mockApp.get("/api/lists/:id/items", async (c) => {
	const listId = c.req.param("id");
	const items = Array.from(mockItems.values())
		.filter((item) => item.listId === listId)
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	return c.json(items);
});

// Add item to a list
mockApp.post("/api/lists/:id/items", async (c) => {
	const listId = c.req.param("id");
	const formData = await c.req.formData();
	const comment = formData.get("comment") as string | null;
	const image = formData.get("image") as File | null;

	let imageUrl: string | undefined;

	if (image && image.size > 0) {
		const key = `${listId}/${crypto.randomUUID()}-${image.name}`;
		const arrayBuffer = await image.arrayBuffer();
		mockImages.set(key, { data: arrayBuffer, type: image.type });
		imageUrl = `/api/images/${key}`;
	}

	const newItem = {
		id: crypto.randomUUID(),
		listId,
		comment: comment || "",
		imageUrl,
		createdAt: new Date(),
	};

	mockItems.set(newItem.id, newItem);
	return c.json(newItem);
});

// Serve image
mockApp.get("/api/images/*", async (c) => {
	const key = c.req.path.replace("/api/images/", "");

	if (!key) {
		return c.json({ error: "Key is required" }, 400);
	}

	const image = mockImages.get(key);

	if (!image) {
		return c.json({ error: "Image not found" }, 404);
	}

	return new Response(image.data, {
		headers: {
			"Content-Type": image.type || "image/jpeg",
			"Cache-Control": "public, max-age=31536000",
		},
	});
});

export default mockApp;
