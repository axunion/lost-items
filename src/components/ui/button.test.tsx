import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("renders a button", () => {
		render(() => <Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
	});

	it("applies variant class", () => {
		const { container: c1 } = render(() => <Button>Default</Button>);
		const { container: c2 } = render(() => (
			<Button variant="destructive">Delete</Button>
		));
		const defaultCls = c1.querySelector("button")?.className ?? "";
		const destructiveCls = c2.querySelector("button")?.className ?? "";
		expect(destructiveCls).not.toBe(defaultCls);
	});
});
