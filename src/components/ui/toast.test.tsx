import { render, screen } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showToast, ToastRegion } from "./toast";

// The module-level `toasts` signal persists between tests.
// Each test cleans up by advancing time past the 4s auto-dismiss.

describe("toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    // Drain all pending timers (auto-dismiss, etc.)
    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it("shows a toast when showToast is called", async () => {
    render(() => <ToastRegion />);

    showToast("Hello world", "success");
    // SolidJS signal updates are synchronous — no waitFor needed
    expect(screen.getByText("Hello world")).toBeInTheDocument();

    await vi.runAllTimersAsync();
  });

  it("removes a toast automatically after 4 seconds", async () => {
    render(() => <ToastRegion />);

    showToast("Auto dismiss", "info");
    expect(screen.getByText("Auto dismiss")).toBeInTheDocument();

    // Advance past the 4000ms setTimeout inside showToast
    vi.advanceTimersByTime(4001);
    await vi.runAllTimersAsync();

    expect(screen.queryByText("Auto dismiss")).not.toBeInTheDocument();
  });

  it("renders multiple concurrent toasts with distinct titles", async () => {
    render(() => <ToastRegion />);

    showToast("Toast A", "success");
    showToast("Toast B", "error");
    showToast("Toast C", "info");

    expect(screen.getByText("Toast A")).toBeInTheDocument();
    expect(screen.getByText("Toast B")).toBeInTheDocument();
    expect(screen.getByText("Toast C")).toBeInTheDocument();

    await vi.runAllTimersAsync();
  });

  it("applies success CSS class to success toasts", async () => {
    render(() => <ToastRegion />);

    showToast("Success msg", "success");

    // Portal renders into document.body, not into the test container
    expect(screen.getByText("Success msg")).toBeInTheDocument();
    const toastEl = document.body.querySelector("[class*='success']");
    expect(toastEl).toBeInTheDocument();

    await vi.runAllTimersAsync();
  });

  it("applies error CSS class to error toasts", async () => {
    render(() => <ToastRegion />);

    showToast("Error msg", "error");

    expect(screen.getByText("Error msg")).toBeInTheDocument();
    const toastEl = document.body.querySelector("[class*='error']");
    expect(toastEl).toBeInTheDocument();

    await vi.runAllTimersAsync();
  });

  it("renders optional description when provided", async () => {
    render(() => <ToastRegion />);

    showToast("Title here", "info", "Detail here");

    expect(screen.getByText("Title here")).toBeInTheDocument();
    expect(screen.getByText("Detail here")).toBeInTheDocument();

    await vi.runAllTimersAsync();
  });
});
