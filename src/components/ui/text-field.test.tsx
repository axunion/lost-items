import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { TextField, TextFieldInput } from "./text-field";

describe("TextField", () => {
  it("does not force-write the input value while an IME composition is in progress", () => {
    const { container } = render(() => (
      <TextField value="" onChange={() => {}}>
        <TextFieldInput />
      </TextField>
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    input.value = "に";

    const valueSetter = vi.spyOn(
      Object.getPrototypeOf(input) as HTMLInputElement,
      "value",
      "set",
    );

    input.dispatchEvent(
      new InputEvent("input", { bubbles: true, isComposing: true }),
    );

    // Kobalte's TextFieldRoot must skip its `target.value = ...` sync while
    // composing, otherwise the browser interrupts the IME composition session
    // (visible as candidate-window flicker on every keystroke of Japanese input).
    expect(valueSetter).not.toHaveBeenCalled();
  });
});
