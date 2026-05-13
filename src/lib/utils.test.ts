import { describe, expect, it } from "vitest";
import { cx, formatDate } from "./utils";

describe("utils", () => {
	describe("cx", () => {
		it("should merge class names", () => {
			expect(cx("class1", "class2")).toBe("class1 class2");
		});

		it("should handle conditional classes", () => {
			expect(cx("class1", true && "class2", false && "class3")).toBe(
				"class1 class2",
			);
		});

		it("should filter falsy values", () => {
			expect(cx("class1", undefined, null, false, "class2")).toBe(
				"class1 class2",
			);
		});
	});

	describe("formatDate", () => {
		it("should format date string correctly", () => {
			const date = "2023-01-01T12:00:00Z";
			const expected = new Intl.DateTimeFormat(undefined, {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}).format(new Date(date));
			expect(formatDate(date)).toBe(expected);
		});

		it("should format Date object correctly", () => {
			const date = new Date("2023-12-31T00:00:00Z");
			const expected = new Intl.DateTimeFormat(undefined, {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}).format(date);
			expect(formatDate(date)).toBe(expected);
		});
	});
});
