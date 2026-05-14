import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";
import styles from "./button.module.css";

describe("Button", () => {
	it("renders a button", () => {
		render(() => <Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
	});

	describe("variant prop", () => {
		it("applies default variant class", () => {
			const { container } = render(() => <Button>Default</Button>);
			const button = container.querySelector("button")!;
			expect(button.className).toContain(styles.variantDefault);
		});

		it("applies destructive variant class", () => {
			const { container } = render(() => (
				<Button variant="destructive">Delete</Button>
			));
			const button = container.querySelector("button")!;
			expect(button.className).toContain(styles.variantDestructive);
		});

		it("applies outline variant class", () => {
			const { container } = render(() => (
				<Button variant="outline">Outline</Button>
			));
			expect(container.querySelector("button")!.className).toContain(
				styles.variantOutline,
			);
		});

		it("applies ghost variant class", () => {
			const { container } = render(() => (
				<Button variant="ghost">Ghost</Button>
			));
			expect(container.querySelector("button")!.className).toContain(
				styles.variantGhost,
			);
		});
	});

	describe("size prop", () => {
		it("applies default size class", () => {
			const { container } = render(() => <Button>Default</Button>);
			expect(container.querySelector("button")!.className).toContain(
				styles.sizeDefault,
			);
		});

		it("applies sm size class", () => {
			const { container } = render(() => <Button size="sm">Small</Button>);
			expect(container.querySelector("button")!.className).toContain(
				styles.sizeSm,
			);
		});

		it("applies xl size class", () => {
			const { container } = render(() => <Button size="xl">XL</Button>);
			expect(container.querySelector("button")!.className).toContain(
				styles.sizeXl,
			);
		});

		it("applies icon size class", () => {
			const { container } = render(() => <Button size="icon">i</Button>);
			expect(container.querySelector("button")!.className).toContain(
				styles.sizeIcon,
			);
		});
	});

	describe("class prop", () => {
		it("merges custom class with built-in classes", () => {
			const { container } = render(() => (
				<Button class="custom-class">Merge</Button>
			));
			const className = container.querySelector("button")!.className;
			expect(className).toContain("custom-class");
			expect(className).toContain(styles.variantDefault);
		});
	});

	describe("disabled prop", () => {
		it("renders as disabled when disabled is true", () => {
			render(() => <Button disabled>Disabled</Button>);
			const button = screen.getByRole("button", { name: /disabled/i });
			expect(button).toBeDisabled();
		});

		it("does not call onClick when disabled", () => {
			const handleClick = vi.fn();
			render(() => (
				<Button disabled onClick={handleClick}>
					Disabled
				</Button>
			));
			fireEvent.click(screen.getByRole("button", { name: /disabled/i }));
			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe("polymorphic as prop", () => {
		it("renders as an anchor tag when as='a'", () => {
			render(() => (
				<Button as="a" href="/example">
					Link
				</Button>
			));
			const link = screen.getByRole("link", { name: /link/i });
			expect(link.tagName.toLowerCase()).toBe("a");
			expect(link).toHaveAttribute("href", "/example");
		});
	});
});
