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

		it("should return empty string for all falsy inputs", () => {
			expect(cx(undefined, null, false)).toBe("");
		});

		it("should ignore empty string entries", () => {
			expect(cx("class1", "", "class2")).toBe("class1 class2");
		});
	});

	describe("formatDate", () => {
		it("should include year in output for valid date string", () => {
			const result = formatDate("2023-06-15T00:00:00Z");
			expect(result).toContain("2023");
			expect(result).not.toBe("");
		});

		it("should include year in output for valid Date object", () => {
			const result = formatDate(new Date("2023-12-31T00:00:00Z"));
			expect(result).toContain("2023");
			expect(result).not.toBe("");
		});

		it("should return empty string for invalid date string", () => {
			expect(formatDate("not-a-date")).toBe("");
		});

		it("should return empty string for NaN Date", () => {
			expect(formatDate(new Date(NaN))).toBe("");
		});

		it("should merge options rather than replace defaults", () => {
			const defaultResult = formatDate("2023-06-15T00:00:00Z");
			const longMonthResult = formatDate("2023-06-15T00:00:00Z", {
				month: "long",
			});
			// Options change must produce different output
			expect(longMonthResult).not.toBe(defaultResult);
			// Year must still be present (default year: "numeric" is preserved)
			expect(longMonthResult).toContain("2023");
		});
	});
});
