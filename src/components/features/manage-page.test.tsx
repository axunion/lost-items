import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/client/api";
import ManagePage from "./manage-page";

vi.mock("~/client/api", () => ({
  updateItemComment: vi.fn(),
  deleteItem: vi.fn(),
  restoreItem: vi.fn(),
}));

vi.mock("~/components/ui/toast", () => ({
  showToast: vi.fn(),
}));

const makeItem = (id: string, comment = `item ${id}`): api.Item => ({
  id,
  listId: "list-1",
  comment,
  imageUrl: null,
  foundAt: null,
  location: null,
  createdAt: "2023-01-01T00:00:00.000Z",
  deletedAt: null,
});

describe("ManagePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial items passed as props", () => {
    const items = [makeItem("a", "Red bag"), makeItem("b", "Blue wallet")];
    render(() => <ManagePage listId="list-1" items={items} />);
    expect(screen.getByText("Red bag")).toBeInTheDocument();
    expect(screen.getByText("Blue wallet")).toBeInTheDocument();
  });

  it("shows empty state when no initial items", () => {
    render(() => <ManagePage listId="list-1" items={[]} />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("marks item as picked up in place on delete without re-fetching", async () => {
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);

    const initialItems = [makeItem("a", "Old item")];
    render(() => <ManagePage listId="list-1" items={initialItems} />);

    // Delete flow updates the item in place: it stays visible with the
    // picked-up icon and a Restore button, no full-list re-fetch.
    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));
    const confirmBtn = await screen.findByRole("button", { name: "Delete" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteItem).toHaveBeenCalledWith("list-1", "a");
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Restore item" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Old item")).toBeInTheDocument();
  });

  it("replaces item comment in place after a successful edit", async () => {
    vi.mocked(api.updateItemComment).mockResolvedValue(
      makeItem("a", "Edited comment"),
    );

    const initialItems = [makeItem("a", "Original comment")];
    render(() => <ManagePage listId="list-1" items={initialItems} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit item" }));
    const textarea = await screen.findByPlaceholderText("Enter comment...");
    fireEvent.input(textarea, { target: { value: "Edited comment" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Edited comment")).toBeInTheDocument();
    });
    expect(screen.queryByText("Original comment")).not.toBeInTheDocument();
  });
});
