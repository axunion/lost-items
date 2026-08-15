import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings } from "../bindings";
import { createDb } from "../db";
import { items, lists } from "../db/schema";
import { buildImageKey, withImageUrl } from "../images";
import {
  addItemSchema,
  createListSchema,
  renameListSchema,
  updateCommentSchema,
} from "../schemas/lists";

export const listsRoute = new Hono<{ Bindings: Bindings }>();

// Raster image types only. SVG is excluded on purpose: it can carry inline
// scripts and, served same-origin by imagesRoute, would be a stored XSS vector.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type Db = ReturnType<typeof createDb>;

const findList = (db: Db, id: string) =>
  db.select().from(lists).where(eq(lists.id, id)).get();

const findItem = (db: Db, listId: string, itemId: string) =>
  db
    .select()
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.listId, listId)))
    .get();

// Create a new list
listsRoute.post("/", zValidator("json", createListSchema), async (c) => {
  const { name } = c.req.valid("json");
  const id = crypto.randomUUID();
  const publicId = crypto.randomUUID();
  const db = createDb(c.env.DB);

  await db.insert(lists).values({
    id,
    publicId,
    name: name || null,
    createdAt: new Date(),
  });

  return c.json({ id, publicId });
});

// Get a list by ID
listsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);

  const result = await findList(db, id);

  if (!result) {
    return c.json({ error: "List not found" }, 404);
  }

  return c.json(result);
});

// Update a list name
listsRoute.patch("/:id", zValidator("json", renameListSchema), async (c) => {
  const id = c.req.param("id");
  const { name } = c.req.valid("json");
  const db = createDb(c.env.DB);

  const existing = await findList(db, id);

  if (!existing) {
    return c.json({ error: "List not found" }, 404);
  }

  await db.update(lists).set({ name }).where(eq(lists.id, id));

  return c.json({ id, name });
});

// Delete a list and its items
listsRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);

  // Both queries key on the same id and are independent — run them together.
  const [existing, itemsToDelete] = await Promise.all([
    findList(db, id),
    db.select().from(items).where(eq(items.listId, id)),
  ]);

  if (!existing) {
    return c.json({ error: "List not found" }, 404);
  }

  // Delete images from R2 — failures are logged and non-fatal so the DB batch still runs.
  // Log the specific key on failure so orphaned objects can be identified and cleaned up manually.
  const itemsWithImages = itemsToDelete.filter((item) => item.imageKey);
  const deleteSettled = await Promise.allSettled(
    itemsWithImages.map((item) => c.env.BUCKET.delete(item.imageKey as string)),
  );
  for (const [i, result] of deleteSettled.entries()) {
    if (result.status === "rejected") {
      console.warn(
        `R2 delete failed for key "${itemsWithImages[i].imageKey}":`,
        result.reason,
      );
    }
  }

  // D1 rejects the SQL BEGIN that db.transaction issues; db.batch is the
  // D1-native alternative and executes the statements atomically.
  await db.batch([
    db.delete(items).where(eq(items.listId, id)),
    db.delete(lists).where(eq(lists.id, id)),
  ]);

  return c.json({ success: true });
});

// Get items for a list
listsRoute.get("/:id/items", async (c) => {
  const listId = c.req.param("id");
  const includeDeleted = c.req.query("includeDeleted") === "true";
  const db = createDb(c.env.DB);

  const condition = includeDeleted
    ? eq(items.listId, listId)
    : and(eq(items.listId, listId), isNull(items.deletedAt));

  const result = await db
    .select()
    .from(items)
    .where(condition)
    .orderBy(desc(items.createdAt));

  return c.json(result.map(withImageUrl));
});

// Add item to a list
listsRoute.post("/:id/items", zValidator("form", addItemSchema), async (c) => {
  const listId = c.req.param("id");
  const db = createDb(c.env.DB);
  const { comment, image, foundAt, location } = c.req.valid("form");

  const list = await findList(db, listId);

  if (!list) {
    return c.json({ error: "List not found" }, 404);
  }

  let itemImageKey: string | undefined;

  if (image && image.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return c.json({ error: "Invalid file type" }, 400);
    }
    if (image.size > 5 * 1024 * 1024) {
      return c.json({ error: "File too large (max 5MB)" }, 400);
    }

    const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = buildImageKey(list.publicId, safeName);
    await c.env.BUCKET.put(key, image, {
      httpMetadata: { contentType: image.type },
    });
    itemImageKey = key;
  }

  const id = crypto.randomUUID();
  const newItem = {
    id,
    listId,
    comment: comment || "",
    imageKey: itemImageKey ?? null,
    foundAt: foundAt ? new Date(foundAt) : null,
    location: location || null,
    createdAt: new Date(),
  };

  await db.insert(items).values(newItem);

  return c.json({ ...withImageUrl(newItem), deletedAt: null });
});

// Update item comment
listsRoute.patch(
  "/:id/items/:itemId",
  zValidator("json", updateCommentSchema),
  async (c) => {
    const listId = c.req.param("id");
    const itemId = c.req.param("itemId");
    const { comment } = c.req.valid("json");
    const db = createDb(c.env.DB);

    const existing = await findItem(db, listId, itemId);

    if (!existing) {
      return c.json({ error: "Item not found" }, 404);
    }

    await db.update(items).set({ comment }).where(eq(items.id, itemId));

    return c.json({ ...withImageUrl(existing), comment });
  },
);

// Soft delete an item
listsRoute.delete("/:id/items/:itemId", async (c) => {
  const listId = c.req.param("id");
  const itemId = c.req.param("itemId");
  const db = createDb(c.env.DB);

  const existing = await findItem(db, listId, itemId);

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

  const existing = await findItem(db, listId, itemId);

  if (!existing) {
    return c.json({ error: "Item not found" }, 404);
  }

  if (!existing.deletedAt) {
    return c.json({ error: "Item is not deleted" }, 400);
  }

  await db.update(items).set({ deletedAt: null }).where(eq(items.id, itemId));

  return c.json({ success: true });
});
