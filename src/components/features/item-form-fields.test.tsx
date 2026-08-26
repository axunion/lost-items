import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { compressImage } from "~/client/image-utils";
import ItemFormFields from "./item-form-fields";

vi.mock("~/client/image-utils", () => ({
  compressImage: vi.fn(),
}));
vi.mock("~/components/ui/toast", () => ({
  showToast: vi.fn(),
}));

// ItemFormFields is fully controlled — wrap it with local signals so
// changes made via callbacks are reflected back into props, matching how
// register-form.tsx and item-list.tsx's edit dialog actually use it.
function renderFields(existingImageUrl?: string | null) {
  const [comment, setComment] = createSignal("");
  const [foundAtInput, setFoundAtInput] = createSignal("");
  const [location, setLocation] = createSignal("");
  const [imageFile, setImageFile] = createSignal<File | undefined>(undefined);

  render(() => (
    <ItemFormFields
      comment={comment()}
      onCommentChange={setComment}
      foundAtInput={foundAtInput()}
      onFoundAtInputChange={setFoundAtInput}
      location={location()}
      onLocationChange={setLocation}
      imageFile={imageFile()}
      onImageFileChange={setImageFile}
      existingImageUrl={existingImageUrl}
    />
  ));

  return { imageFile };
}

describe("ItemFormFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selecting an image file compresses it and calls onImageFileChange", async () => {
    const compressed = new File(["c"], "c.jpg", { type: "image/jpeg" });
    vi.mocked(compressImage).mockResolvedValue(compressed);

    const { imageFile } = renderFields();

    const original = new File(["raw"], "raw.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Choose a photo"), {
      target: { files: [original] },
    });

    await waitFor(() => {
      expect(compressImage).toHaveBeenCalledWith(original);
    });
    await waitFor(() => {
      expect(imageFile()).toBe(compressed);
    });
  });

  it("photo picker buttons hide once a file is selected", async () => {
    const compressed = new File(["c"], "c.jpg", { type: "image/jpeg" });
    vi.mocked(compressImage).mockResolvedValue(compressed);

    renderFields();

    expect(screen.getByText("Take Photo")).toBeInTheDocument();
    expect(screen.getByText("Choose Photo")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Choose a photo"), {
      target: { files: [new File(["raw"], "raw.png", { type: "image/png" })] },
    });

    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });
    expect(screen.queryByText("Take Photo")).not.toBeInTheDocument();
    expect(screen.queryByText("Choose Photo")).not.toBeInTheDocument();
  });

  it("clicking clear reverts the preview to existingImageUrl, not full removal", async () => {
    const compressed = new File(["c"], "c.jpg", { type: "image/jpeg" });
    vi.mocked(compressImage).mockResolvedValue(compressed);

    const { imageFile } = renderFields("https://example.com/existing.jpg");

    // Existing photo is shown before any new file is picked.
    expect(screen.getByAltText("Preview")).toHaveAttribute(
      "src",
      "https://example.com/existing.jpg",
    );

    fireEvent.change(screen.getByLabelText("Choose a photo"), {
      target: { files: [new File(["raw"], "raw.png", { type: "image/png" })] },
    });

    await waitFor(() => {
      expect(imageFile()).toBe(compressed);
    });
    // A new preview (blob URL) replaces the existing one.
    expect(screen.getByAltText("Preview")).not.toHaveAttribute(
      "src",
      "https://example.com/existing.jpg",
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear image" }));

    await waitFor(() => {
      expect(imageFile()).toBeUndefined();
    });
    // Clearing reverts to the existing photo instead of removing it entirely.
    expect(screen.getByAltText("Preview")).toHaveAttribute(
      "src",
      "https://example.com/existing.jpg",
    );
  });
});
