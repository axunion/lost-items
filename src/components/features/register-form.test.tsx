import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "~/client/api";
import { compressImage } from "~/client/image-utils";
import { showToast } from "~/components/ui/toast";
import RegisterForm from "./register-form";

vi.mock("~/client/api", () => ({
  addItem: vi.fn(),
}));
vi.mock("~/client/image-utils", () => ({
  compressImage: vi.fn(),
}));
vi.mock("~/components/ui/toast", () => ({
  showToast: vi.fn(),
}));

const mockItem = (overrides?: Partial<api.Item>) => ({
  id: "item-1",
  listId: "test-list-id",
  comment: "test",
  imageUrl: null,
  createdAt: new Date(),
  deletedAt: null,
  ...overrides,
});

describe("RegisterForm", () => {
  const listId = "test-list-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders photo section, comment field, and submit button", () => {
    render(() => <RegisterForm listId={listId} />);
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Comment")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i }),
    ).toBeInTheDocument();
  });

  it("submits comment without image and calls onCreated", async () => {
    const mockAddItem = vi.mocked(api.addItem);
    const handleCreated = vi.fn();
    mockAddItem.mockResolvedValue(mockItem({ comment: "Test comment" }));

    render(() => <RegisterForm listId={listId} onCreated={handleCreated} />);

    fireEvent.input(screen.getByPlaceholderText("Optional info..."), {
      target: { value: "Test comment" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(listId, {
        comment: "Test comment",
        image: undefined,
      });
    });
    expect(handleCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item-1" }),
    );
  });

  it("shows success toast and resets form after successful submission", async () => {
    const mockAddItem = vi.mocked(api.addItem);
    mockAddItem.mockResolvedValue(mockItem());

    render(() => <RegisterForm listId={listId} />);

    const textarea = screen.getByPlaceholderText("Optional info...");
    fireEvent.input(textarea, { target: { value: "some comment" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Item registered", "success");
    });
    // Comment field should be cleared
    expect((textarea as HTMLTextAreaElement).value).toBe("");
  });

  it("compresses image file and submits it", async () => {
    const mockAddItem = vi.mocked(api.addItem);
    const mockCompress = vi.mocked(compressImage);
    const compressed = new File(["compressed"], "compressed.jpg", {
      type: "image/jpeg",
    });
    mockCompress.mockResolvedValue(compressed);
    mockAddItem.mockResolvedValue(mockItem({ imageUrl: "/api/images/x" }));

    render(() => <RegisterForm listId={listId} />);

    const fileInput = screen.getByLabelText("Choose a photo");
    const original = new File(["raw"], "raw.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [original] } });

    await waitFor(() => {
      expect(mockCompress).toHaveBeenCalledWith(original);
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(listId, {
        comment: "",
        image: compressed,
      });
    });
  });

  it("uses camera input when Take Photo is triggered", async () => {
    const mockCompress = vi.mocked(compressImage);
    const compressed = new File(["c"], "c.jpg", { type: "image/jpeg" });
    mockCompress.mockResolvedValue(compressed);
    vi.mocked(api.addItem).mockResolvedValue(mockItem());

    render(() => <RegisterForm listId={listId} />);

    const cameraInput = screen.getByLabelText("Take a photo");
    const file = new File(["cam"], "cam.jpg", { type: "image/jpeg" });
    fireEvent.change(cameraInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockCompress).toHaveBeenCalledWith(file);
    });
  });

  it("shows image preview after selecting a file", async () => {
    const mockCompress = vi.mocked(compressImage);
    const compressed = new File(["c"], "c.jpg", { type: "image/jpeg" });
    mockCompress.mockResolvedValue(compressed);
    vi.mocked(api.addItem).mockResolvedValue(mockItem());

    render(() => <RegisterForm listId={listId} />);

    fireEvent.change(screen.getByLabelText("Choose a photo"), {
      target: { files: [new File(["raw"], "raw.png", { type: "image/png" })] },
    });

    await waitFor(() => {
      // Preview image should be rendered
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });
    // Photo buttons should be hidden once preview is shown
    expect(screen.queryByText("Take Photo")).not.toBeInTheDocument();
  });

  it("clears image preview and shows photo buttons after clicking clear", async () => {
    const mockCompress = vi.mocked(compressImage);
    const compressed = new File(["c"], "c.jpg", { type: "image/jpeg" });
    mockCompress.mockResolvedValue(compressed);

    render(() => <RegisterForm listId={listId} />);

    fireEvent.change(screen.getByLabelText("Choose a photo"), {
      target: { files: [new File(["raw"], "raw.png", { type: "image/png" })] },
    });

    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });

    // Click the clear (X) button
    fireEvent.click(screen.getByRole("button", { name: "Clear image" }));

    await waitFor(() => {
      expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
      expect(screen.getByText("Take Photo")).toBeInTheDocument();
    });
  });

  it("disables submit button while submitting", async () => {
    vi.mocked(api.addItem).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockItem()), 200)),
    );

    render(() => <RegisterForm listId={listId} />);
    const submitButton = screen.getByRole("button", { name: /register/i });

    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("shows error toast when image compression fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(compressImage).mockRejectedValue(new Error("compress failed"));
    vi.mocked(api.addItem).mockResolvedValue(mockItem());

    render(() => <RegisterForm listId={listId} />);
    fireEvent.change(screen.getByLabelText("Take a photo"), {
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
  });

  it("shows error toast when registration API fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.addItem).mockRejectedValue(new Error("api failed"));

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
