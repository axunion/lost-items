import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import {
	addItem,
	createList,
	deleteItem,
	deleteList,
	restoreItem,
	updateItemComment,
	updateList,
} from "./api";

describe("api", () => {
	let fetchSpy: Mock;

	beforeEach(() => {
		fetchSpy = vi.fn();
		vi.stubGlobal("fetch", fetchSpy);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("createList", () => {
		it("should create a list successfully", async () => {
			const mockResponse = { id: "list-123" };
			fetchSpy.mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await createList("New Room");

			expect(fetchSpy).toHaveBeenCalledWith("/api/lists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "New Room" }),
			});
			expect(result).toEqual(mockResponse);
		});

		it("should throw error on failure", async () => {
			fetchSpy.mockResolvedValue({
				ok: false,
				status: 500,
			});

			await expect(createList("Fail Room")).rejects.toThrow(
				"Failed to create list: 500",
			);
		});
	});

	describe("addItem", () => {
		it("should add an item with comment only", async () => {
			const mockResponse = { id: "item-1", comment: "hello" };
			fetchSpy.mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await addItem("list-1", { comment: "hello" });

			expect(fetchSpy).toHaveBeenCalledWith(
				"/api/lists/list-1/items",
				expect.any(Object),
			);
			const [url, options] = fetchSpy.mock.calls[0];
			expect(url).toBe("/api/lists/list-1/items");
			expect(options.method).toBe("POST");
			expect(options.body).toBeInstanceOf(FormData);
			expect(result).toEqual(mockResponse);
		});

		it("should add an item with image", async () => {
			const mockResponse = { id: "item-2", comment: "pic" };
			fetchSpy.mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			});

			const file = new File([""], "test.jpg", { type: "image/jpeg" });
			await addItem("list-1", { comment: "pic", image: file });

			expect(fetchSpy).toHaveBeenCalled();
			const [, options] = fetchSpy.mock.calls[0];
			expect(options.body).toBeInstanceOf(FormData);
		});

		it("should throw error on failure", async () => {
			fetchSpy.mockResolvedValue({
				ok: false,
				status: 400,
			});

			await expect(addItem("list-1", { comment: "test" })).rejects.toThrow(
				"Failed to add item: 400",
			);
		});
	});

	describe("updateList", () => {
		it("should call PATCH with correct data", async () => {
			fetchSpy.mockResolvedValue({ ok: true });
			await updateList("list-1", { name: "Updated" });
			expect(fetchSpy).toHaveBeenCalledWith(
				"/api/lists/list-1",
				expect.objectContaining({ method: "PATCH" }),
			);
		});

		it("should throw error on failure", async () => {
			fetchSpy.mockResolvedValue({ ok: false, status: 404 });
			await expect(updateList("list-1", { name: "Fail" })).rejects.toThrow(
				"Failed to update list: 404",
			);
		});
	});

	describe("deleteList", () => {
		it("should call DELETE", async () => {
			fetchSpy.mockResolvedValue({ ok: true });
			await deleteList("list-1");
			expect(fetchSpy).toHaveBeenCalledWith(
				"/api/lists/list-1",
				expect.objectContaining({ method: "DELETE" }),
			);
		});

		it("should throw error on failure", async () => {
			fetchSpy.mockResolvedValue({ ok: false, status: 500 });
			await expect(deleteList("list-1")).rejects.toThrow(
				"Failed to delete list: 500",
			);
		});
	});

	describe("updateItemComment", () => {
		it("should call PATCH with comment", async () => {
			const mockResponse = {
				id: "item-1",
				listId: "list-1",
				comment: "updated",
				imageUrl: null,
				createdAt: new Date().toISOString(),
				deletedAt: null,
			};
			fetchSpy.mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await updateItemComment("list-1", "item-1", "updated");

			expect(fetchSpy).toHaveBeenCalledWith("/api/lists/list-1/items/item-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ comment: "updated" }),
			});
			expect(result).toEqual(mockResponse);
		});

		it("should throw error on failure", async () => {
			fetchSpy.mockResolvedValue({ ok: false, status: 404 });
			await expect(
				updateItemComment("list-1", "item-1", "fail"),
			).rejects.toThrow("Failed to update item: 404");
		});
	});

	describe("deleteItem", () => {
		it("should call DELETE on item endpoint", async () => {
			fetchSpy.mockResolvedValue({ ok: true });
			await deleteItem("list-1", "item-1");
			expect(fetchSpy).toHaveBeenCalledWith("/api/lists/list-1/items/item-1", {
				method: "DELETE",
			});
		});

		it("should throw error on failure", async () => {
			fetchSpy.mockResolvedValue({ ok: false, status: 500 });
			await expect(deleteItem("list-1", "item-1")).rejects.toThrow(
				"Failed to delete item: 500",
			);
		});
	});

	describe("restoreItem", () => {
		it("should call POST on restore endpoint", async () => {
			fetchSpy.mockResolvedValue({ ok: true });
			await restoreItem("list-1", "item-1");
			expect(fetchSpy).toHaveBeenCalledWith(
				"/api/lists/list-1/items/item-1/restore",
				{
					method: "POST",
				},
			);
		});

		it("should throw error on failure", async () => {
			fetchSpy.mockResolvedValue({ ok: false, status: 404 });
			await expect(restoreItem("list-1", "item-1")).rejects.toThrow(
				"Failed to restore item: 404",
			);
		});
	});
});
