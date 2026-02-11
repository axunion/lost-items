import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/lib/api";
import RoomCreateForm from "./room-create-form";

// Mock the API
vi.mock("~/lib/api", () => ({
	createList: vi.fn(),
}));
vi.mock("~/components/ui/toast", () => ({
	showToast: vi.fn(),
}));

describe("RoomCreateForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders correctly", () => {
		render(() => <RoomCreateForm />);
		expect(screen.getByPlaceholderText("Room Name")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
	});

	it("submits the form with valid input", async () => {
		const mockCreateList = vi.mocked(api.createList);
		mockCreateList.mockResolvedValue({ id: "new-room-id" });
		const handleCreated = vi.fn();

		render(() => <RoomCreateForm onCreated={handleCreated} />);

		const input = screen.getByPlaceholderText("Room Name");
		const button = screen.getByRole("button", { name: /create/i });

		fireEvent.input(input, { target: { value: "My New Room" } });
		fireEvent.click(button);

		await waitFor(() => {
			expect(mockCreateList).toHaveBeenCalledWith("My New Room");
		});

		expect(handleCreated).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "new-room-id",
				name: "My New Room",
			}),
		);
	});

	it("shows loading state during submission", async () => {
		const mockCreateList = vi.mocked(api.createList);
		mockCreateList.mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(() => resolve({ id: "test" }), 100),
				),
		);

		render(() => <RoomCreateForm />);

		const input = screen.getByPlaceholderText("Room Name");
		const button = screen.getByRole("button", { name: /create/i });

		fireEvent.input(input, { target: { value: "Test Room" } });
		fireEvent.click(button);

		expect(screen.getByText("Creating...")).toBeInTheDocument();
	});
});
