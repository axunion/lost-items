import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/lib/api";
import RegisterForm from "./register-form";

// Mock dependencies
vi.mock("~/lib/api", () => ({
	addItem: vi.fn(),
}));
vi.mock("~/lib/image-utils", () => ({
	compressImage: vi.fn(),
}));

describe("RegisterForm", () => {
	const listId = "test-list-id";
	let originalLocation: Location;

	beforeEach(() => {
		vi.clearAllMocks();
		originalLocation = window.location;
	});

	afterEach(() => {
		Object.defineProperty(window, "location", {
			value: originalLocation,
			writable: true,
			configurable: true,
		});
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
		mockAddItem.mockResolvedValue({
			id: "item-1",
			listId,
			comment: "Test comment",
			imageUrl: null,
			createdAt: new Date(),
			deletedAt: null,
		});

		// Mock window.location using Object.defineProperty
		Object.defineProperty(window, "location", {
			value: { href: "" },
			writable: true,
			configurable: true,
		});

		render(() => <RegisterForm listId={listId} />);

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

		expect(window.location.href).toBe(`/${listId}`);
	});
});
