import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings } from "../bindings";
import { createDb } from "../db";
import { items, lists } from "../db/schema";
import { buildImageKey, withImageUrl } from "../images";
import {
  createListSchema,
  itemFormSchema,
  renameListSchema,
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

// Real usage is a handful of items per event; this is headroom against
// runaway spam, not a realistic capacity ceiling.
const MAX_ITEMS_PER_LIST = 100;

type Db = ReturnType<typeof createDb>;

const findList = (db: Db, id: string) =>
  db.select().from(lists).where(eq(lists.id, id)).get();

const findItem = (db: Db, listId: string, itemId: string) =>
  db
    .select()
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.listId, listId)))
    .get();

// Cheap, no-I/O checks — run before any DB/R2 call so a bad upload is
// rejected without paying for a list lookup or a store round-trip.
const validateItemImage = (image: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    return "Invalid file type";
  }
  if (image.size > 5 * 1024 * 1024) {
    return "File too large (max 5MB)";
  }
  return null;
};

// Stores an already-validated item photo in R2. Shared by item create and
// item update so the key-naming convention stays in one place.
const storeItemImage = async (
  bucket: R2Bucket,
  publicId: string,
  image: File,
): Promise<string> => {
  const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = buildImageKey(publicId, safeName);
  await bucket.put(key, image, {
    httpMetadata: { contentType: image.type },
  });
  return key;
};

// Create a new list — only the dashboard (gated by ADMIN_TOKEN) is meant to
// call this; unlike every other mutating route, it needs no admin id or
// item id to reach, so it's the one write endpoint that needs its own gate.
listsRoute.post("/", zValidator("json", createListSchema), async (c) => {
  // Explicit ADMIN_TOKEN check (not just !==) so an unset secret fails
  // closed instead of letting a header-less request match undefined.
  if (
    !c.env.ADMIN_TOKEN ||
    c.req.header("x-admin-token") !== c.env.ADMIN_TOKEN
  ) {
    return c.json({ error: "Forbidden" }, 403);
  }

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
listsRoute.post("/:id/items", zValidator("form", itemFormSchema), async (c) => {
  const listId = c.req.param("id");
  const db = createDb(c.env.DB);
  const { comment, image, foundAt, location } = c.req.valid("form");

  const list = await findList(db, listId);

  if (!list) {
    return c.json({ error: "List not found" }, 404);
  }

  const activeItemCount = await db
    .select({ count: count() })
    .from(items)
    .where(and(eq(items.listId, listId), isNull(items.deletedAt)))
    .get();

  if ((activeItemCount?.count ?? 0) >= MAX_ITEMS_PER_LIST) {
    return c.json(
      { error: `List is full (max ${MAX_ITEMS_PER_LIST} items)` },
      400,
    );
  }

  let itemImageKey: string | undefined;

  if (image && image.size > 0) {
    const validationError = validateItemImage(image);
    if (validationError) {
      return c.json({ error: validationError }, 400);
    }
    itemImageKey = await storeItemImage(c.env.BUCKET, list.publicId, image);
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

// Update an item
listsRoute.patch(
  "/:id/items/:itemId",
  zValidator("form", itemFormSchema),
  async (c) => {
    const listId = c.req.param("id");
    const itemId = c.req.param("itemId");
    const { comment, image, foundAt, location } = c.req.valid("form");
    const db = createDb(c.env.DB);

    const existing = await findItem(db, listId, itemId);

    if (!existing) {
      return c.json({ error: "Item not found" }, 404);
    }

    let itemImageKey = existing.imageKey;

    if (image && image.size > 0) {
      const validationError = validateItemImage(image);
      if (validationError) {
        return c.json({ error: validationError }, 400);
      }

      const list = await findList(db, listId);
      if (!list) {
        return c.json({ error: "List not found" }, 404);
      }

      itemImageKey = await storeItemImage(c.env.BUCKET, list.publicId, image);
    }

    const updated = {
      comment: comment || "",
      imageKey: itemImageKey,
      foundAt: foundAt ? new Date(foundAt) : null,
      location: location || null,
    };

    await db.update(items).set(updated).where(eq(items.id, itemId));

    // Delete the replaced photo only after the DB row points at the new one —
    // if the DB write above had failed, the old (still-referenced) photo must survive.
    if (image && image.size > 0 && existing.imageKey) {
      try {
        await c.env.BUCKET.delete(existing.imageKey);
      } catch (error) {
        console.warn(`R2 delete failed for key "${existing.imageKey}":`, error);
      }
    }

    return c.json(withImageUrl({ ...existing, ...updated }));
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
