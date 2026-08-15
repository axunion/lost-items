import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/client/api";
import ItemList from "./item-list";

vi.mock("~/client/api", () => ({
  updateItemComment: vi.fn(),
  deleteItem: vi.fn(),
  restoreItem: vi.fn(),
}));

vi.mock("~/components/ui/toast", () => ({
  showToast: vi.fn(),
}));

import { showToast } from "~/components/ui/toast";

const makeItem = (overrides: Partial<api.Item> = {}): api.Item => ({
  id: "item-1",
  listId: "list-1",
  comment: "A lost phone",
  imageUrl: null,
  foundAt: null,
  location: null,
  createdAt: "2023-01-01T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

describe("ItemList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no items are provided", () => {
    render(() => <ItemList items={[]} listId="list-1" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders items with comment and placeholder image", () => {
    const item = makeItem({ comment: "Blue umbrella", imageUrl: null });
    render(() => <ItemList items={[item]} listId="list-1" />);
    expect(screen.getByText("Blue umbrella")).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/placeholder.svg");
  });

  it("renders item image when imageUrl is provided", () => {
    const item = makeItem({ imageUrl: "https://example.com/photo.jpg" });
    render(() => <ItemList items={[item]} listId="list-1" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("renders location when present", () => {
    const item = makeItem({ location: "Near the west gate" });
    render(() => <ItemList items={[item]} listId="list-1" />);
    expect(screen.getByText("Near the west gate")).toBeInTheDocument();
  });

  it("does not render a location row when location is absent", () => {
    const item = makeItem({ location: null });
    render(() => <ItemList items={[item]} listId="list-1" />);
    expect(screen.queryByTestId("item-location")).toBeNull();
  });

  it("shows the found-time icon and prioritizes foundAt over createdAt", () => {
    const item = makeItem({
      foundAt: "2023-06-01T00:00:00.000Z",
      createdAt: "2023-01-01T00:00:00.000Z",
    });
    render(() => <ItemList items={[item]} listId="list-1" />);
    expect(screen.getByRole("img", { name: "Found time" })).toBeInTheDocument();
  });

  it("hides all action buttons when readonly is true", () => {
    const item = makeItem();
    render(() => <ItemList items={[item]} listId="list-1" readonly={true} />);
    expect(
      screen.queryByRole("button", { name: "Edit item" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete item" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Restore item" }),
    ).not.toBeInTheDocument();
  });

  it("shows picked-up icon and Restore button for deleted items", () => {
    const item = makeItem({ deletedAt: "2023-06-01T00:00:00.000Z" });
    render(() => <ItemList items={[item]} listId="list-1" />);
    expect(screen.getByRole("img", { name: "Picked up" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Restore item" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit item" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete item" }),
    ).not.toBeInTheDocument();
  });

  it("opens edit dialog with existing comment pre-filled", async () => {
    const item = makeItem({ comment: "Red scarf" });
    render(() => <ItemList items={[item]} listId="list-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit item" }));

    const textarea = await screen.findByPlaceholderText("Enter comment...");
    expect(textarea).toHaveValue("Red scarf");
  });

  it("calls updateItemComment and onItemUpdated on successful save", async () => {
    vi.mocked(api.updateItemComment).mockResolvedValue(makeItem());
    const onItemUpdated = vi.fn();
    const item = makeItem({ id: "item-42", comment: "Old comment" });
    render(() => (
      <ItemList items={[item]} listId="list-1" onItemUpdated={onItemUpdated} />
    ));

    fireEvent.click(screen.getByRole("button", { name: "Edit item" }));

    const textarea = await screen.findByPlaceholderText("Enter comment...");
    fireEvent.input(textarea, { target: { value: "New comment" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(api.updateItemComment).toHaveBeenCalledWith(
        "list-1",
        "item-42",
        "New comment",
      );
    });
    await waitFor(() => {
      expect(onItemUpdated).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error toast and keeps dialog open when updateItemComment fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.updateItemComment).mockRejectedValue(
      new Error("network error"),
    );
    const item = makeItem({ comment: "Some comment" });
    render(() => <ItemList items={[item]} listId="list-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit item" }));
    const textarea = await screen.findByPlaceholderText("Enter comment...");
    fireEvent.input(textarea, { target: { value: "Will fail" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Failed to update comment",
        "error",
      );
    });
    // Dialog remains open
    expect(screen.getByPlaceholderText("Enter comment...")).toBeInTheDocument();
  });

  it("disables Save button while submitting", async () => {
    let resolve!: (v: api.Item) => void;
    vi.mocked(api.updateItemComment).mockReturnValue(
      new Promise<api.Item>((r) => {
        resolve = r;
      }),
    );

    const item = makeItem({ comment: "Testing" });
    render(() => <ItemList items={[item]} listId="list-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit item" }));
    await screen.findByPlaceholderText("Enter comment...");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Save button becomes disabled while inflight
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    resolve(makeItem());
    // Save button re-enables after promise resolves
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });
  });

  it("opens ConfirmDialog and calls deleteItem on confirm", async () => {
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);
    const onItemUpdated = vi.fn();
    const item = makeItem({ id: "item-del" });
    render(() => (
      <ItemList items={[item]} listId="list-1" onItemUpdated={onItemUpdated} />
    ));

    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));

    const confirmBtn = await screen.findByRole("button", { name: "Delete" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteItem).toHaveBeenCalledWith("list-1", "item-del");
    });
    await waitFor(() => {
      expect(onItemUpdated).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error toast when deleteItem fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.deleteItem).mockRejectedValue(new Error("delete error"));
    const item = makeItem({ id: "item-x" });
    render(() => <ItemList items={[item]} listId="list-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));
    const confirmBtn = await screen.findByRole("button", { name: "Delete" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Failed to delete", "error");
    });
  });

  it("calls restoreItem and onItemUpdated when Restore is clicked", async () => {
    vi.mocked(api.restoreItem).mockResolvedValue(undefined);
    const onItemUpdated = vi.fn();
    const item = makeItem({
      id: "item-r",
      deletedAt: "2023-06-01T00:00:00.000Z",
    });
    render(() => (
      <ItemList items={[item]} listId="list-1" onItemUpdated={onItemUpdated} />
    ));

    fireEvent.click(screen.getByRole("button", { name: "Restore item" }));

    await waitFor(() => {
      expect(api.restoreItem).toHaveBeenCalledWith("list-1", "item-r");
    });
    await waitFor(() => {
      expect(onItemUpdated).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error toast when restoreItem fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.restoreItem).mockRejectedValue(new Error("restore error"));
    const item = makeItem({ deletedAt: "2023-06-01T00:00:00.000Z" });
    render(() => <ItemList items={[item]} listId="list-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Restore item" }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Failed to restore", "error");
    });
  });
});
