import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import styles from "./button.module.css";
import { ConfirmDialog } from "./confirm-dialog";

function renderDialog(
  props: Partial<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    variant: "default" | "destructive";
    onConfirm: () => void;
    onOpenChange: (v: boolean) => void;
  }> = {},
) {
  const [open, setOpen] = createSignal(props.open ?? true);
  const onOpenChange = props.onOpenChange ?? ((v: boolean) => setOpen(v));
  const onConfirm = props.onConfirm ?? vi.fn();

  render(() => (
    <ConfirmDialog
      open={open()}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={props.title ?? "Confirm Action"}
      description={props.description}
      confirmLabel={props.confirmLabel}
      cancelLabel={props.cancelLabel}
      variant={props.variant}
    />
  ));

  return { onConfirm, onOpenChange };
}

describe("ConfirmDialog", () => {
  it("renders title and default button labels", () => {
    renderDialog({ title: "Delete Item" });
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders custom confirm and cancel labels", () => {
    renderDialog({ confirmLabel: "Yes, delete", cancelLabel: "No, keep" });
    expect(
      screen.getByRole("button", { name: "Yes, delete" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "No, keep" }),
    ).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    renderDialog({ description: "This cannot be undone." });
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("does not render description element when description is omitted", () => {
    renderDialog({ title: "No desc" });
    // Only the title should be rendered; no extra paragraph
    const bodyText = screen.queryByText(
      (_, el) =>
        el?.tagName === "P" && el?.className?.includes?.("description"),
    );
    expect(bodyText).not.toBeInTheDocument();
  });

  it("calls onConfirm and then onOpenChange(false) when confirm is clicked", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    renderDialog({ onConfirm, onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // onOpenChange(false) must be called AFTER onConfirm
    const confirmOrder = onConfirm.mock.invocationCallOrder[0];
    const closeOrder = onOpenChange.mock.invocationCallOrder[0];
    expect(confirmOrder).toBeLessThan(closeOrder);
  });

  it("calls onOpenChange(false) and NOT onConfirm when cancel is clicked", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    renderDialog({ onConfirm, onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies destructive variant class to confirm button", () => {
    renderDialog({ variant: "destructive" });
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton.className).toContain(styles.variantDestructive);
  });

  it("applies default variant class to confirm button when variant is omitted", () => {
    renderDialog();
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton.className).toContain(styles.variantDefault);
  });
});
