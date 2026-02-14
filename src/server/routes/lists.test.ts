// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const createDbMock = vi.hoisted(() => vi.fn());

vi.mock("../db", () => ({
	createDb: createDbMock,
}));

import { listsRoute } from "./lists";

function setupDbMock() {
	const selectChain: {
		from: ReturnType<typeof vi.fn>;
		where: ReturnType<typeof vi.fn>;
		orderBy: ReturnType<typeof vi.fn>;
		get: ReturnType<typeof vi.fn>;
	} = {
		from: vi.fn(),
		where: vi.fn(),
		orderBy: vi.fn(),
		get: vi.fn(),
	};

	selectChain.from.mockReturnValue(selectChain);
	selectChain.where.mockReturnValue(selectChain);
	selectChain.orderBy.mockReturnValue(selectChain);

	const insertValues = vi.fn().mockResolvedValue(undefined);
	const updateWhere = vi.fn().mockResolvedValue(undefined);

	const db = {
		select: vi.fn(() => selectChain),
		insert: vi.fn(() => ({ values: insertValues })),
		update: vi.fn(() => ({ set: vi.fn(() => ({ where: updateWhere })) })),
		delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
		transaction: vi.fn(),
	};

	return {
		db,
		selectGet: selectChain.get,
		insertValues,
		updateWhere,
	};
}

function createEnv(overrides?: Partial<Record<string, unknown>>) {
	return {
		DB: {},
		BUCKET: {
			put: vi.fn().mockResolvedValue(undefined),
			delete: vi.fn().mockResolvedValue(undefined),
			...(overrides ?? {}),
		},
	} as unknown as {
		DB: unknown;
		BUCKET: { put: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
	};
}

describe("listsRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("POST /:id/items", () => {
		it("returns 404 when list does not exist", async () => {
			const { db, selectGet } = setupDbMock();
			createDbMock.mockReturnValue(db);
			selectGet.mockResolvedValueOnce(undefined);

			const formData = new FormData();
			formData.append("comment", "test");

			const response = await listsRoute.request(
				"/missing/items",
				{ method: "POST", body: formData },
				createEnv(),
			);

			expect(response.status).toBe(404);
			await expect(response.json()).resolves.toEqual({
				error: "List not found",
			});
		});

		it("rejects non-image uploads", async () => {
			const { db, selectGet, insertValues } = setupDbMock();
			createDbMock.mockReturnValue(db);
			selectGet.mockResolvedValueOnce({ id: "list-1" });
			const env = createEnv();

			const formData = new FormData();
			formData.append("comment", "bad file");
			formData.append(
				"image",
				new File(["hello"], "note.txt", { type: "text/plain" }),
			);

			const response = await listsRoute.request(
				"/list-1/items",
				{ method: "POST", body: formData },
				env,
			);

			expect(response.status).toBe(400);
			await expect(response.json()).resolves.toEqual({
				error: "Invalid file type",
			});
			expect(env.BUCKET.put).not.toHaveBeenCalled();
			expect(insertValues).not.toHaveBeenCalled();
		});

		it("rejects oversized image uploads", async () => {
			const { db, selectGet, insertValues } = setupDbMock();
			createDbMock.mockReturnValue(db);
			selectGet.mockResolvedValueOnce({ id: "list-1" });
			const env = createEnv();

			const tooLarge = new File(
				[new Uint8Array(5 * 1024 * 1024 + 1)],
				"big.jpg",
				{ type: "image/jpeg" },
			);

			const formData = new FormData();
			formData.append("comment", "too big");
			formData.append("image", tooLarge);

			const response = await listsRoute.request(
				"/list-1/items",
				{ method: "POST", body: formData },
				env,
			);

			expect(response.status).toBe(400);
			await expect(response.json()).resolves.toEqual({
				error: "File too large (max 5MB)",
			});
			expect(env.BUCKET.put).not.toHaveBeenCalled();
			expect(insertValues).not.toHaveBeenCalled();
		});

		it("stores image and item when upload is valid", async () => {
			const { db, selectGet, insertValues } = setupDbMock();
			createDbMock.mockReturnValue(db);
			selectGet.mockResolvedValueOnce({ id: "list-1" });
			const env = createEnv();

			const formData = new FormData();
			formData.append("comment", "umbrella");
			formData.append(
				"image",
				new File(["binary"], "photo.png", { type: "image/png" }),
			);

			const response = await listsRoute.request(
				"/list-1/items",
				{ method: "POST", body: formData },
				env,
			);

			expect(response.status).toBe(200);
			const body = (await response.json()) as {
				id: string;
				listId: string;
				comment: string;
				imageUrl?: string;
			};
			expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
			expect(body.listId).toBe("list-1");
			expect(body.comment).toBe("umbrella");
			expect(body.imageUrl).toMatch(
				/^\/api\/images\/list-1\/[0-9a-f-]{36}-photo\.png$/,
			);
			expect(env.BUCKET.put).toHaveBeenCalledTimes(1);
			expect(insertValues).toHaveBeenCalledTimes(1);
		});
	});

	describe("POST /:id/items/:itemId/restore", () => {
		it("returns 404 for unknown item", async () => {
			const { db, selectGet, updateWhere } = setupDbMock();
			createDbMock.mockReturnValue(db);
			selectGet.mockResolvedValueOnce(undefined);

			const response = await listsRoute.request(
				"/list-1/items/item-1/restore",
				{ method: "POST" },
				createEnv(),
			);

			expect(response.status).toBe(404);
			await expect(response.json()).resolves.toEqual({
				error: "Item not found",
			});
			expect(updateWhere).not.toHaveBeenCalled();
		});

		it("returns 400 when item is not deleted", async () => {
			const { db, selectGet, updateWhere } = setupDbMock();
			createDbMock.mockReturnValue(db);
			selectGet.mockResolvedValueOnce({
				id: "item-1",
				listId: "list-1",
				deletedAt: null,
			});

			const response = await listsRoute.request(
				"/list-1/items/item-1/restore",
				{ method: "POST" },
				createEnv(),
			);

			expect(response.status).toBe(400);
			await expect(response.json()).resolves.toEqual({
				error: "Item is not deleted",
			});
			expect(updateWhere).not.toHaveBeenCalled();
		});

		it("restores deleted item", async () => {
			const { db, selectGet, updateWhere } = setupDbMock();
			createDbMock.mockReturnValue(db);
			selectGet.mockResolvedValueOnce({
				id: "item-1",
				listId: "list-1",
				deletedAt: new Date().toISOString(),
			});

			const response = await listsRoute.request(
				"/list-1/items/item-1/restore",
				{ method: "POST" },
				createEnv(),
			);

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toEqual({ success: true });
			expect(updateWhere).toHaveBeenCalledTimes(1);
		});
	});
});
