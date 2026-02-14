import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { showToast } from "~/components/ui/toast";
import * as api from "~/lib/api";
import { compressImage } from "~/lib/image-utils";
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

	it("uploads image, compresses it, and submits with compressed file", async () => {
		const mockAddItem = vi.mocked(api.addItem);
		const mockCompressImage = vi.mocked(compressImage);
		const compressed = new File(["compressed"], "compressed.jpg", {
			type: "image/jpeg",
		});
		mockCompressImage.mockResolvedValue(compressed);
		mockAddItem.mockResolvedValue({
			id: "item-2",
			listId,
			comment: "With image",
			imageUrl: "/api/images/test",
			createdAt: new Date(),
			deletedAt: null,
		});

		const { container } = render(() => <RegisterForm listId={listId} />);
		const fileInput = container.querySelectorAll(
			'input[type="file"]',
		)[1] as HTMLInputElement;
		const original = new File(["raw"], "raw.png", { type: "image/png" });

		fireEvent.change(fileInput, { target: { files: [original] } });
		await waitFor(() => {
			expect(mockCompressImage).toHaveBeenCalledWith(original);
		});

		fireEvent.input(screen.getByPlaceholderText("Optional info..."), {
			target: { value: "With image" },
		});
		fireEvent.click(screen.getByRole("button", { name: /register/i }));

		await waitFor(() => {
			expect(mockAddItem).toHaveBeenCalledWith(listId, {
				comment: "With image",
				image: compressed,
			});
		});
	});

	it("shows an error toast when image compression fails", async () => {
		const mockCompressImage = vi.mocked(compressImage);
		const mockAddItem = vi.mocked(api.addItem);
		mockCompressImage.mockRejectedValue(new Error("compress failed"));
		mockAddItem.mockResolvedValue({
			id: "item-3",
			listId,
			comment: "no image",
			imageUrl: null,
			createdAt: new Date(),
			deletedAt: null,
		});

		const { container } = render(() => <RegisterForm listId={listId} />);
		const fileInput = container.querySelectorAll(
			'input[type="file"]',
		)[0] as HTMLInputElement;

		fireEvent.change(fileInput, {
			target: {
				files: [new File(["broken"], "broken.png", { type: "image/png" })],
			},
		});

		await waitFor(() => {
			expect(showToast).toHaveBeenCalledWith(
				"Failed to process image",
				"error",
			);
		});

		fireEvent.input(screen.getByPlaceholderText("Optional info..."), {
			target: { value: "no image" },
		});
		fireEvent.click(screen.getByRole("button", { name: /register/i }));

		await waitFor(() => {
			expect(mockAddItem).toHaveBeenCalledWith(listId, {
				comment: "no image",
				image: undefined,
			});
		});
	});

	it("shows an error toast when registration API fails", async () => {
		const mockAddItem = vi.mocked(api.addItem);
		mockAddItem.mockRejectedValue(new Error("api failed"));

		render(() => <RegisterForm listId={listId} />);

		fireEvent.input(screen.getByPlaceholderText("Optional info..."), {
			target: { value: "broken submit" },
		});
		fireEvent.click(screen.getByRole("button", { name: /register/i }));

		await waitFor(() => {
			expect(showToast).toHaveBeenCalledWith("Failed to register", "error");
		});
	});
});
