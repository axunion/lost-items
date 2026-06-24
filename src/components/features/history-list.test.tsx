import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/client/api";
import HistoryList from "./history-list";

vi.mock("~/client/api", () => ({
  updateList: vi.fn(),
  deleteList: vi.fn(),
}));

const makeList = (
  id: string,
  name: string | null = `Room ${id}`,
): api.List => ({
  id,
  name,
  createdAt: "2023-01-01T00:00:00.000Z",
});

// Kobalte DropdownMenu opens via onPointerDown on the trigger (not click).
// Menu items fire onSelect via onPointerUp.
const openDropdown = (trigger: HTMLElement) => {
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
};

const selectMenuItem = (item: HTMLElement) => {
  fireEvent.pointerUp(item, { button: 0 });
};

describe("HistoryList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no lists are provided", () => {
    render(() => <HistoryList lists={[]} origin="http://localhost:4321" />);
    expect(screen.getByText("No rooms found.")).toBeInTheDocument();
  });

  it("renders a list of rooms", () => {
    const lists = [makeList("a", "Alpha"), makeList("b", "Beta")];
    render(() => <HistoryList lists={lists} origin="http://localhost:4321" />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows Untitled Room when name is null", () => {
    render(() => (
      <HistoryList
        lists={[makeList("x", null)]}
        origin="http://localhost:4321"
      />
    ));
    expect(screen.getByText("Untitled Room")).toBeInTheDocument();
  });

  it("limits displayed items when maxItems is set", () => {
    const lists = [makeList("a", "A"), makeList("b", "B"), makeList("c", "C")];
    render(() => (
      <HistoryList lists={lists} maxItems={2} origin="http://localhost:4321" />
    ));
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();
  });

  it("prepends newList and deduplicates existing entries", async () => {
    const lists = [makeList("a", "Existing"), makeList("b", "Other")];
    const newList = makeList("new", "Brand New");

    const [currentNewList, setCurrentNewList] = createSignal<api.List | null>(
      null,
    );

    render(() => (
      <HistoryList
        lists={lists}
        newList={currentNewList()}
        origin="http://localhost:4321"
      />
    ));

    expect(screen.queryByText("Brand New")).not.toBeInTheDocument();

    setCurrentNewList(newList);

    await waitFor(() => {
      expect(screen.getByText("Brand New")).toBeInTheDocument();
    });
    // Deduplication: "Existing" should appear only once
    expect(screen.getAllByText("Existing")).toHaveLength(1);
  });

  it("calls updateList and updates displayed name on rename", async () => {
    vi.mocked(api.updateList).mockResolvedValue(undefined);
    const lists = [makeList("a", "Old Name")];
    render(() => <HistoryList lists={lists} origin="http://localhost:4321" />);

    // Open dropdown
    const trigger = screen.getAllByRole("button")[0];
    openDropdown(trigger);

    // Click Rename
    const renameItem = await screen.findByText("Rename");
    selectMenuItem(renameItem);

    // Fill in new name and save
    const input = await screen.findByPlaceholderText("Name");
    fireEvent.input(input, { target: { value: "New Name" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(api.updateList).toHaveBeenCalledWith("a", { name: "New Name" });
    });

    await waitFor(() => {
      expect(screen.getByText("New Name")).toBeInTheDocument();
    });
  });

  it("does not call updateList and closes dialog when name is blank on rename", async () => {
    const lists = [makeList("a", "Room A")];
    render(() => <HistoryList lists={lists} origin="http://localhost:4321" />);

    const trigger = screen.getAllByRole("button")[0];
    openDropdown(trigger);

    const renameItem = await screen.findByText("Rename");
    selectMenuItem(renameItem);

    const input = await screen.findByPlaceholderText("Name");
    fireEvent.input(input, { target: { value: "   " } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect(api.updateList).not.toHaveBeenCalled();

    // Dialog should be closed (input gone)
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
    });
  });

  it("logs error and closes dialog when updateList fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.updateList).mockRejectedValue(new Error("network error"));
    const lists = [makeList("a", "Room A")];
    render(() => <HistoryList lists={lists} origin="http://localhost:4321" />);

    const trigger = screen.getAllByRole("button")[0];
    openDropdown(trigger);

    const renameItem = await screen.findByText("Rename");
    selectMenuItem(renameItem);

    const input = await screen.findByPlaceholderText("Name");
    fireEvent.input(input, { target: { value: "Fail Name" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    // Dialog should close even on error
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
    });
  });

  it("calls deleteList and removes room from the list on delete confirm", async () => {
    vi.mocked(api.deleteList).mockResolvedValue(undefined);
    const lists = [makeList("del", "To Delete"), makeList("keep", "Keep Me")];
    render(() => <HistoryList lists={lists} origin="http://localhost:4321" />);

    // Open dropdown for first room
    const triggers = screen.getAllByRole("button");
    openDropdown(triggers[0]);

    const deleteMenuItem = await screen.findByText("Delete");
    selectMenuItem(deleteMenuItem);

    // Confirm deletion in dialog
    const confirmBtn = await screen.findByRole("button", { name: "Delete" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteList).toHaveBeenCalledWith("del");
    });

    await waitFor(() => {
      expect(screen.queryByText("To Delete")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Keep Me")).toBeInTheDocument();
  });

  it("calls window.open with noopener,noreferrer when Open Page is selected", async () => {
    const openMock = vi.fn();
    vi.stubGlobal("open", openMock);
    const lists = [makeList("a")];
    render(() => <HistoryList lists={lists} origin="http://localhost:4321" />);

    const trigger = screen.getAllByRole("button")[0];
    openDropdown(trigger);

    const openPageItems = await screen.findAllByText("Open Page");
    selectMenuItem(openPageItems[0]);

    expect(openMock).toHaveBeenCalledWith(
      expect.stringContaining("/a/"),
      "_blank",
      "noopener,noreferrer",
    );

    vi.unstubAllGlobals();
  });
});
