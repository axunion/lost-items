// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const createDbMock = vi.hoisted(() => vi.fn());

vi.mock("../db", () => ({
  createDb: createDbMock,
}));

import { listsRoute } from "./lists";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// ─── DB Mock ─────────────────────────────────────────────────────────────────
//
// Handles three query patterns:
//   (1) .select().from(...).where(...).get()    → resolves single item
//   (2) await .select().from(...).where(...)    → resolves array (thenable)
//   (3) await .select().from(...).orderBy(...)  → resolves array
//
// Each query call dequeues from getQueue (single) or allQueue (array).
// Enqueue return values before each test:
//   enqueueOne(val)     — for .get() calls
//   enqueueMany(arr)    — for direct-await or .orderBy() calls

function setupDbMock() {
  const getQueue: (unknown | undefined)[] = [];
  const allQueue: unknown[][] = [];

  const enqueueOne = (val: unknown) => getQueue.push(val);
  const enqueueMany = (val: unknown[]) => allQueue.push(val);

  const resolveOne = () => Promise.resolve(getQueue.shift());
  const resolveMany = () => Promise.resolve(allQueue.shift() ?? []);

  const whereResult = {
    get: vi.fn().mockImplementation(resolveOne),
    orderBy: vi.fn().mockImplementation(resolveMany),
    // biome-ignore lint/suspicious/noThenProperty: intentional thenable for `await db.select().from().where()`
    then: (
      onFulfilled: (v: unknown) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) => resolveMany().then(onFulfilled, onRejected),
  };

  const fromResult = {
    where: vi.fn().mockReturnValue(whereResult),
    orderBy: vi.fn().mockImplementation(resolveMany),
    get: vi.fn().mockImplementation(resolveOne),
    // biome-ignore lint/suspicious/noThenProperty: intentional thenable for `await db.select().from()`
    then: (
      onFulfilled: (v: unknown) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) => resolveMany().then(onFulfilled, onRejected),
  };

  const insertValues = vi.fn().mockResolvedValue(undefined);
  const setFn = vi.fn();
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  setFn.mockReturnValue({ where: updateWhere });

  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const batchFn = vi.fn().mockResolvedValue([]);

  const db = {
    select: vi.fn(() => ({ from: vi.fn().mockReturnValue(fromResult) })),
    insert: vi.fn(() => ({ values: insertValues })),
    update: vi.fn(() => ({ set: setFn })),
    delete: vi.fn(() => ({ where: deleteWhere })),
    batch: batchFn,
  };

  return {
    db,
    enqueueOne,
    enqueueMany,
    fromResult,
    whereResult,
    insertValues,
    setFn,
    updateWhere,
    deleteWhere,
    batchFn,
  };
}

function createEnv(
  overrides?: Partial<{
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  }>,
) {
  return {
    DB: {},
    BUCKET: {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    },
  } as unknown as {
    DB: unknown;
    BUCKET: {
      put: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
}

describe("listsRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── POST / ──────────────────────────────────────────────────────────────

  describe("POST /", () => {
    it("creates a list with a name and returns a UUID id", async () => {
      const { db, insertValues } = setupDbMock();
      createDbMock.mockReturnValue(db);

      const res = await listsRoute.request(
        "/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test Room" }),
        },
        createEnv(),
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as { id: string; publicId: string };
      expect(body.id).toMatch(UUID_PATTERN);
      // publicId is a distinct token from the admin id (finding: access separation)
      expect(body.publicId).toMatch(UUID_PATTERN);
      expect(body.publicId).not.toBe(body.id);
      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Test Room", publicId: body.publicId }),
      );
    });

    it("creates a list with null name when name is omitted", async () => {
      const { db, insertValues } = setupDbMock();
      createDbMock.mockReturnValue(db);

      await listsRoute.request(
        "/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
        createEnv(),
      );

      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ name: null }),
      );
    });
  });

  // ─── GET /:id ─────────────────────────────────────────────────────────────

  describe("GET /:id", () => {
    it("returns the list when it exists", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      const list = {
        id: "list-1",
        name: "Room",
        createdAt: "2023-01-01T00:00:00.000Z",
      };
      enqueueOne(list);

      const res = await listsRoute.request(
        "/list-1",
        { method: "GET" },
        createEnv(),
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual(list);
    });

    it("returns 404 when list does not exist", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne(undefined);

      const res = await listsRoute.request(
        "/no-such-id",
        { method: "GET" },
        createEnv(),
      );

      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ error: "List not found" });
    });
  });

  // ─── PATCH /:id ──────────────────────────────────────────────────────────

  describe("PATCH /:id", () => {
    it("renames a list and returns the new name", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "list-1", name: "Old" });

      const res = await listsRoute.request(
        "/list-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "New Name" }),
        },
        createEnv(),
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        id: "list-1",
        name: "New Name",
      });
    });

    it("returns 404 when list does not exist", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne(undefined);

      const res = await listsRoute.request(
        "/missing",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "X" }),
        },
        createEnv(),
      );

      expect(res.status).toBe(404);
    });

    it("returns 400 when name is empty (Zod min(1) violation)", async () => {
      const { db } = setupDbMock();
      createDbMock.mockReturnValue(db);

      const res = await listsRoute.request(
        "/list-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "" }),
        },
        createEnv(),
      );

      expect(res.status).toBe(400);
    });
  });

  // ─── DELETE /:id ──────────────────────────────────────────────────────────

  describe("DELETE /:id", () => {
    it("returns 404 when list does not exist", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne(undefined);

      const res = await listsRoute.request(
        "/no-such-list",
        { method: "DELETE" },
        createEnv(),
      );

      expect(res.status).toBe(404);
    });

    it("deletes R2 images for items that have imageKey", async () => {
      const { db, enqueueOne, enqueueMany, batchFn } = setupDbMock();
      createDbMock.mockReturnValue(db);
      const env = createEnv();

      // First: list lookup
      enqueueOne({ id: "list-1" });
      // Second: items for R2 cleanup (direct await on .where())
      enqueueMany([
        { id: "i1", imageKey: "list-1/uuid-a.jpg" },
        { id: "i2", imageKey: null },
        { id: "i3", imageKey: "list-1/uuid-b.png" },
      ]);

      const res = await listsRoute.request(
        "/list-1",
        { method: "DELETE" },
        env,
      );

      expect(res.status).toBe(200);
      expect(env.BUCKET.delete).toHaveBeenCalledTimes(2);
      expect(env.BUCKET.delete).toHaveBeenCalledWith("list-1/uuid-a.jpg");
      expect(env.BUCKET.delete).toHaveBeenCalledWith("list-1/uuid-b.png");
      expect(batchFn).toHaveBeenCalledTimes(1);
      // Items delete + list delete run in one atomic batch
      expect(batchFn.mock.calls[0][0]).toHaveLength(2);
    });

    it("continues DB deletion even when some R2 deletes fail", async () => {
      const { db, enqueueOne, enqueueMany, batchFn } = setupDbMock();
      createDbMock.mockReturnValue(db);

      const deleteMock = vi
        .fn()
        .mockRejectedValueOnce(new Error("R2 error"))
        .mockResolvedValue(undefined);
      const env = createEnv({ delete: deleteMock });

      enqueueOne({ id: "list-1" });
      enqueueMany([
        { id: "i1", imageKey: "list-1/a.jpg" },
        { id: "i2", imageKey: "list-1/b.jpg" },
      ]);

      const res = await listsRoute.request(
        "/list-1",
        { method: "DELETE" },
        env,
      );

      expect(res.status).toBe(200);
      expect(deleteMock).toHaveBeenCalledTimes(2);
      expect(batchFn).toHaveBeenCalledTimes(1);
    });

    it("succeeds with no R2 calls when list has no items with images", async () => {
      const { db, enqueueOne, enqueueMany, batchFn } = setupDbMock();
      createDbMock.mockReturnValue(db);
      const env = createEnv();

      enqueueOne({ id: "list-1" });
      enqueueMany([]);

      const res = await listsRoute.request(
        "/list-1",
        { method: "DELETE" },
        env,
      );

      expect(res.status).toBe(200);
      expect(env.BUCKET.delete).not.toHaveBeenCalled();
      expect(batchFn).toHaveBeenCalledTimes(1);
    });
  });

  // ─── GET /:id/items ──────────────────────────────────────────────────────

  describe("GET /:id/items", () => {
    it("returns items for the list with computed imageUrl", async () => {
      const { db, enqueueMany } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueMany([
        {
          id: "item-1",
          listId: "list-1",
          comment: "hello",
          imageKey: "list-1/uuid.jpg",
        },
      ]);

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "GET" },
        createEnv(),
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual([
        {
          id: "item-1",
          listId: "list-1",
          comment: "hello",
          imageUrl: "/api/images/list-1/uuid.jpg",
        },
      ]);
    });

    it("returns empty array when no items exist", async () => {
      const { db, enqueueMany } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueMany([]);

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "GET" },
        createEnv(),
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual([]);
    });

    it("returns all items including deleted when includeDeleted=true", async () => {
      const { db, enqueueMany } = setupDbMock();
      createDbMock.mockReturnValue(db);
      const deletedAt = new Date().toISOString();
      enqueueMany([
        {
          id: "item-1",
          listId: "list-1",
          comment: "kept",
          imageKey: null,
          deletedAt: null,
        },
        {
          id: "item-2",
          listId: "list-1",
          comment: "deleted",
          imageKey: null,
          deletedAt,
        },
      ]);

      const res = await listsRoute.request(
        "/list-1/items?includeDeleted=true",
        { method: "GET" },
        createEnv(),
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual([
        {
          id: "item-1",
          listId: "list-1",
          comment: "kept",
          imageUrl: null,
          deletedAt: null,
        },
        {
          id: "item-2",
          listId: "list-1",
          comment: "deleted",
          imageUrl: null,
          deletedAt,
        },
      ]);
    });

    it("passes a compound condition to where() by default (excludes deleted)", async () => {
      const { db, enqueueMany, fromResult } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueMany([]);

      await listsRoute.request("/list-1/items", { method: "GET" }, createEnv());

      const condition = fromResult.where.mock.calls[0][0];
      // and(..., isNull(...)) produces a compound object; a plain eq() is a leaf node
      expect(condition).toHaveProperty("queryChunks");
      expect(
        (condition as { queryChunks: unknown[] }).queryChunks.length,
      ).toBeGreaterThan(1);
    });
  });

  // ─── POST /:id/items ──────────────────────────────────────────────────────

  describe("POST /:id/items", () => {
    it("returns 404 when list does not exist", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne(undefined);

      const formData = new FormData();
      formData.append("comment", "test");

      const res = await listsRoute.request(
        "/missing/items",
        { method: "POST", body: formData },
        createEnv(),
      );

      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ error: "List not found" });
    });

    it("rejects non-image uploads with 400", async () => {
      const { db, enqueueOne, insertValues } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "list-1" });
      const env = createEnv();

      const formData = new FormData();
      formData.append("comment", "bad file");
      formData.append(
        "image",
        new File(["hello"], "note.txt", { type: "text/plain" }),
      );

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "POST", body: formData },
        env,
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({ error: "Invalid file type" });
      expect(env.BUCKET.put).not.toHaveBeenCalled();
      expect(insertValues).not.toHaveBeenCalled();
    });

    it("rejects SVG uploads with 400 (stored XSS vector)", async () => {
      const { db, enqueueOne, insertValues } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "list-1" });
      const env = createEnv();

      const formData = new FormData();
      formData.append(
        "image",
        new File(["<svg onload=alert(1)>"], "x.svg", {
          type: "image/svg+xml",
        }),
      );

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "POST", body: formData },
        env,
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({ error: "Invalid file type" });
      expect(env.BUCKET.put).not.toHaveBeenCalled();
      expect(insertValues).not.toHaveBeenCalled();
    });

    it("rejects oversized images with 400", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "list-1" });
      const env = createEnv();

      const formData = new FormData();
      formData.append(
        "image",
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.jpg", {
          type: "image/jpeg",
        }),
      );

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "POST", body: formData },
        env,
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: "File too large (max 5MB)",
      });
    });

    it("stores image in R2 and returns item with proper imageUrl", async () => {
      const { db, enqueueOne, insertValues } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "list-1", publicId: "pub-1" });
      const env = createEnv();

      const formData = new FormData();
      formData.append("comment", "umbrella");
      formData.append(
        "image",
        new File(["binary"], "photo.png", { type: "image/png" }),
      );

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "POST", body: formData },
        env,
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        id: string;
        listId: string;
        comment: string;
        imageUrl: string;
        deletedAt: unknown;
      };
      expect(body.id).toMatch(UUID_PATTERN);
      expect(body.listId).toBe("list-1");
      expect(body.comment).toBe("umbrella");
      expect(body.imageUrl).toMatch(
        /^\/api\/images\/pub-1\/[0-9a-f-]+-photo\.png$/,
      );
      expect(body.deletedAt).toBeNull();

      expect(env.BUCKET.put).toHaveBeenCalledTimes(1);
      const [putKey, , putOpts] = env.BUCKET.put.mock.calls[0];
      expect(putKey).toMatch(/^pub-1\/.+-photo\.png$/);
      // The key is exposed in public image URLs — it must never leak the admin id.
      expect(putKey).not.toContain("list-1");
      expect(putOpts.httpMetadata.contentType).toBe("image/png");
      expect(insertValues).toHaveBeenCalledTimes(1);
    });

    it("stores item without image when no file is provided", async () => {
      const { db, enqueueOne, insertValues } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "list-1" });
      const env = createEnv();

      const formData = new FormData();
      formData.append("comment", "no picture");

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "POST", body: formData },
        env,
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        imageUrl: unknown;
        comment: string;
        deletedAt: unknown;
      };
      expect(body.imageUrl).toBeNull();
      expect(body.comment).toBe("no picture");
      expect(body.deletedAt).toBeNull();
      expect(env.BUCKET.put).not.toHaveBeenCalled();
      expect(insertValues).toHaveBeenCalledTimes(1);
    });

    it("uses empty string for comment when comment is omitted", async () => {
      const { db, enqueueOne, insertValues } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "list-1" });

      const formData = new FormData();

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "POST", body: formData },
        createEnv(),
      );

      expect(res.status).toBe(200);
      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ comment: "" }),
      );
    });

    it("sanitizes non-safe filename characters in R2 key", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "list-1", publicId: "pub-1" });
      const env = createEnv();

      const formData = new FormData();
      formData.append(
        "image",
        new File(["x"], "日本語ファイル.jpg", { type: "image/jpeg" }),
      );

      await listsRoute.request(
        "/list-1/items",
        { method: "POST", body: formData },
        env,
      );

      const [putKey] = env.BUCKET.put.mock.calls[0];
      // All non-safe chars replaced with _
      expect(putKey).toMatch(/^pub-1\//);
      // Only ASCII-safe chars remain after sanitization
      expect(putKey).toMatch(/^[a-zA-Z0-9/_.-]+$/);
    });

    it("returns 400 when comment exceeds 1000 characters", async () => {
      const { db } = setupDbMock();
      createDbMock.mockReturnValue(db);

      const formData = new FormData();
      formData.append("comment", "a".repeat(1001));

      const res = await listsRoute.request(
        "/list-1/items",
        { method: "POST", body: formData },
        createEnv(),
      );

      expect(res.status).toBe(400);
    });
  });

  // ─── PATCH /:id/items/:itemId ─────────────────────────────────────────────

  describe("PATCH /:id/items/:itemId", () => {
    it("updates item comment and returns updated item", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      const existing = {
        id: "item-1",
        listId: "list-1",
        comment: "old",
        imageUrl: null,
        createdAt: "2023-01-01T00:00:00.000Z",
        deletedAt: null,
      };
      enqueueOne(existing);

      const res = await listsRoute.request(
        "/list-1/items/item-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: "updated" }),
        },
        createEnv(),
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as { comment: string };
      expect(body.comment).toBe("updated");
    });

    it("returns 404 when item does not exist", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne(undefined);

      const res = await listsRoute.request(
        "/list-1/items/no-such-item",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: "x" }),
        },
        createEnv(),
      );

      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ error: "Item not found" });
    });

    it("returns 400 when comment exceeds 1000 characters", async () => {
      const { db } = setupDbMock();
      createDbMock.mockReturnValue(db);

      const res = await listsRoute.request(
        "/list-1/items/item-1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: "x".repeat(1001) }),
        },
        createEnv(),
      );

      expect(res.status).toBe(400);
    });
  });

  // ─── DELETE /:id/items/:itemId ────────────────────────────────────────────

  describe("DELETE /:id/items/:itemId", () => {
    it("soft-deletes item by setting deletedAt to a Date", async () => {
      const { db, enqueueOne, setFn } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "item-1", listId: "list-1", deletedAt: null });

      const res = await listsRoute.request(
        "/list-1/items/item-1",
        { method: "DELETE" },
        createEnv(),
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ success: true });
      expect(setFn).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
    });

    it("returns 404 when item does not exist", async () => {
      const { db, enqueueOne } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne(undefined);

      const res = await listsRoute.request(
        "/list-1/items/no-item",
        { method: "DELETE" },
        createEnv(),
      );

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /:id/items/:itemId/restore ─────────────────────────────────────

  describe("POST /:id/items/:itemId/restore", () => {
    it("returns 404 for unknown item", async () => {
      const { db, enqueueOne, updateWhere } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne(undefined);

      const res = await listsRoute.request(
        "/list-1/items/item-1/restore",
        { method: "POST" },
        createEnv(),
      );

      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ error: "Item not found" });
      expect(updateWhere).not.toHaveBeenCalled();
    });

    it("returns 400 when item is not deleted", async () => {
      const { db, enqueueOne, updateWhere } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({ id: "item-1", listId: "list-1", deletedAt: null });

      const res = await listsRoute.request(
        "/list-1/items/item-1/restore",
        { method: "POST" },
        createEnv(),
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: "Item is not deleted",
      });
      expect(updateWhere).not.toHaveBeenCalled();
    });

    it("restores deleted item and sets deletedAt to null", async () => {
      const { db, enqueueOne, setFn, updateWhere } = setupDbMock();
      createDbMock.mockReturnValue(db);
      enqueueOne({
        id: "item-1",
        listId: "list-1",
        deletedAt: new Date().toISOString(),
      });

      const res = await listsRoute.request(
        "/list-1/items/item-1/restore",
        { method: "POST" },
        createEnv(),
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ success: true });
      expect(setFn).toHaveBeenCalledWith({ deletedAt: null });
      expect(updateWhere).toHaveBeenCalledTimes(1);
    });
  });
});
