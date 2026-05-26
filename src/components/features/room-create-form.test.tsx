import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/client/api";
import { showToast } from "~/components/ui/toast";
import RoomCreateForm from "./room-create-form";

vi.mock("~/client/api", () => ({
	createList: vi.fn(),
}));
vi.mock("~/components/ui/toast", () => ({
	showToast: vi.fn(),
}));

describe("RoomCreateForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the room name input and create button", () => {
		render(() => <RoomCreateForm />);
		expect(screen.getByPlaceholderText("Room Name")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
	});

	it("submits with valid input, calls onCreated, shows success toast, and resets name", async () => {
		vi.mocked(api.createList).mockResolvedValue({ id: "new-room-id" });
		const handleCreated = vi.fn();

		render(() => <RoomCreateForm onCreated={handleCreated} />);

		const input = screen.getByPlaceholderText("Room Name");
		fireEvent.input(input, { target: { value: "My New Room" } });
		fireEvent.click(screen.getByRole("button", { name: /create/i }));

		await waitFor(() => {
			expect(api.createList).toHaveBeenCalledWith("My New Room");
		});

		expect(handleCreated).toHaveBeenCalledWith(
			expect.objectContaining({ id: "new-room-id", name: "My New Room" }),
		);
		expect(showToast).toHaveBeenCalledWith("Room created", "success");

		// Name input should be cleared after success
		await waitFor(() => {
			expect((input as HTMLInputElement).value).toBe("");
		});
	});

	it("does not submit when input is empty or whitespace only", () => {
		render(() => <RoomCreateForm />);

		const input = screen.getByPlaceholderText("Room Name");
		const button = screen.getByRole("button", { name: /create/i });

		// Empty
		fireEvent.click(button);
		expect(api.createList).not.toHaveBeenCalled();

		// Whitespace only
		fireEvent.input(input, { target: { value: "   " } });
		fireEvent.click(button);
		expect(api.createList).not.toHaveBeenCalled();
	});

	it("shows loading overlay and disables input/button while submitting", async () => {
		vi.mocked(api.createList).mockImplementation(
			() =>
				new Promise((resolve) => setTimeout(() => resolve({ id: "x" }), 200)),
		);

		render(() => <RoomCreateForm />);

		fireEvent.input(screen.getByPlaceholderText("Room Name"), {
			target: { value: "Test Room" },
		});
		fireEvent.click(screen.getByRole("button", { name: /create/i }));

		await waitFor(() => {
			expect(screen.getByText("Creating...")).toBeInTheDocument();
		});
		expect(screen.getByPlaceholderText("Room Name")).toBeDisabled();
		expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();

		// Wait for the promise to finish to avoid act() warnings
		await waitFor(() => {
			expect(screen.queryByText("Creating...")).not.toBeInTheDocument();
		});
	});

	it("shows error toast when API fails and preserves the entered name", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(api.createList).mockRejectedValue(new Error("network error"));

		render(() => <RoomCreateForm />);

		const input = screen.getByPlaceholderText("Room Name");
		fireEvent.input(input, { target: { value: "Bad Room" } });
		fireEvent.click(screen.getByRole("button", { name: /create/i }));

		await waitFor(() => {
			expect(showToast).toHaveBeenCalledWith("Failed to create room", "error");
		});

		// Name should NOT be cleared on failure
		expect((input as HTMLInputElement).value).toBe("Bad Room");
	});
});
