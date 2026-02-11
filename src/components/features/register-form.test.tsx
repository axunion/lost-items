import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/lib/api";
import RegisterForm from "./register-form";

// Mock dependencies
vi.mock("~/lib/api", () => ({
	addItem: vi.fn(),
}));
vi.mock("~/lib/image-utils", () => ({
	compressImage: vi.fn(),
}));
vi.mock("~/components/ui/toast", () => ({
	showToast: vi.fn(),
}));

describe("RegisterForm", () => {
	const listId = "test-list-id";
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders correctly", () => {
		render(() => <RegisterForm listId={listId} />);
		expect(screen.getByText("Photo")).toBeInTheDocument();
		expect(screen.getByText("Comment")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /register/i }),
		).toBeInTheDocument();
	});

	it("handles comment input and submission", async () => {
		const mockAddItem = vi.mocked(api.addItem);
		const handleCreated = vi.fn();
		mockAddItem.mockResolvedValue({
			id: "item-1",
			listId,
			comment: "Test comment",
			imageUrl: null,
			createdAt: new Date(),
			deletedAt: null,
		});

		render(() => <RegisterForm listId={listId} onCreated={handleCreated} />);

		const commentInput = screen.getByPlaceholderText("Optional info...");
		fireEvent.input(commentInput, { target: { value: "Test comment" } });

		const submitButton = screen.getByRole("button", { name: /register/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockAddItem).toHaveBeenCalledWith(listId, {
				comment: "Test comment",
				image: undefined,
			});
		});

		expect(handleCreated).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "item-1",
				listId,
				comment: "Test comment",
			}),
		);
	});
});
