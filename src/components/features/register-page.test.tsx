import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/lib/api";
import RegisterPage from "./register-page";

vi.mock("~/lib/api", () => ({
	getItems: vi.fn(),
	addItem: vi.fn(),
	updateItemComment: vi.fn(),
	deleteItem: vi.fn(),
	restoreItem: vi.fn(),
}));

vi.mock("~/components/ui/toast", () => ({
	showToast: vi.fn(),
}));

vi.mock("~/lib/image-utils", () => ({
	compressImage: vi.fn(),
}));

import { showToast } from "~/components/ui/toast";

const makeItem = (id: string, comment = "item " + id): api.Item => ({
	id,
	listId: "list-1",
	comment,
	imageUrl: null,
	createdAt: "2023-01-01T00:00:00.000Z",
	deletedAt: null,
});

describe("RegisterPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders initial items passed as props", () => {
		const items = [makeItem("a", "Red bag"), makeItem("b", "Blue wallet")];
		render(() => <RegisterPage listId="list-1" items={items} />);
		expect(screen.getByText("Red bag")).toBeInTheDocument();
		expect(screen.getByText("Blue wallet")).toBeInTheDocument();
	});

	it("shows empty state when no initial items", () => {
		render(() => <RegisterPage listId="list-1" items={[]} />);
		expect(screen.getByText("No items found")).toBeInTheDocument();
	});

	it("prepends new item to the list when handleCreated is called via RegisterForm", async () => {
		vi.mocked(api.addItem).mockResolvedValue(makeItem("new", "Brand new item"));
		const initialItems = [makeItem("a", "Existing item")];
		render(() => <RegisterPage listId="list-1" items={initialItems} />);

		// Submit the register form with a comment
		const commentInput = screen.getByPlaceholderText("Optional info...");
		fireEvent.input(commentInput, { target: { value: "Brand new item" } });
		const submitBtn = screen.getByRole("button", { name: "Register" });
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(screen.getByText("Brand new item")).toBeInTheDocument();
		});
		// Existing item is still displayed
		expect(screen.getByText("Existing item")).toBeInTheDocument();
	});

	it("calls getItems and replaces state on refreshItems (onItemUpdated)", async () => {
		vi.mocked(api.getItems).mockResolvedValue([
			makeItem("fresh", "Fresh item"),
		]);
		vi.mocked(api.deleteItem).mockResolvedValue(undefined);

		const initialItems = [makeItem("a", "Old item")];
		render(() => <RegisterPage listId="list-1" items={initialItems} />);

		// Trigger onItemUpdated via the delete flow
		fireEvent.click(screen.getByRole("button", { name: "Delete item" }));
		const confirmBtn = await screen.findByRole("button", { name: "Delete" });
		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(api.getItems).toHaveBeenCalledWith("list-1", {
				includeDeleted: true,
			});
		});
		await waitFor(() => {
			expect(screen.getByText("Fresh item")).toBeInTheDocument();
		});
	});

	it("shows error toast and keeps items unchanged when getItems fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(api.getItems).mockRejectedValue(new Error("network error"));
		vi.mocked(api.deleteItem).mockResolvedValue(undefined);

		const initialItems = [makeItem("a", "Keep me")];
		render(() => <RegisterPage listId="list-1" items={initialItems} />);

		fireEvent.click(screen.getByRole("button", { name: "Delete item" }));
		const confirmBtn = await screen.findByRole("button", { name: "Delete" });
		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(showToast).toHaveBeenCalledWith(
				"Failed to refresh items",
				"error",
			);
		});
		// Previous items remain visible
		expect(screen.getByText("Keep me")).toBeInTheDocument();
	});
});
