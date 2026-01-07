import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("renders a button", () => {
		render(() => <Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
	});

	it("applies variant classes", () => {
		render(() => <Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button", { name: /delete/i });
		expect(button).toHaveClass("bg-destructive");
	});
});
