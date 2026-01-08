import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/lib/api";
import RoomCreateForm from "./room-create-form";

// Mock the API
vi.mock("~/lib/api", () => ({
	createList: vi.fn(),
}));

describe("RoomCreateForm", () => {
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
		render(() => <RoomCreateForm />);
		expect(screen.getByPlaceholderText("Room Name")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
	});

	it("submits the form with valid input", async () => {
		const mockCreateList = vi.mocked(api.createList);
		mockCreateList.mockResolvedValue({ id: "new-room-id" });

		// Mock window.location using Object.defineProperty
		Object.defineProperty(window, "location", {
			value: { href: "" },
			writable: true,
			configurable: true,
		});

		render(() => <RoomCreateForm />);

		const input = screen.getByPlaceholderText("Room Name");
		const button = screen.getByRole("button", { name: /create/i });

		fireEvent.input(input, { target: { value: "My New Room" } });
		fireEvent.click(button);

		await waitFor(() => {
			expect(mockCreateList).toHaveBeenCalledWith("My New Room");
		});

		expect(window.location.href).toBe("/new-room-id");
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
