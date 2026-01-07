import { describe, expect, it } from "vitest";
import { cn, formatDate } from "./utils";

describe("utils", () => {
	describe("cn", () => {
		it("should merge class names", () => {
			expect(cn("class1", "class2")).toBe("class1 class2");
		});

		it("should handle conditional classes", () => {
			expect(cn("class1", true && "class2", false && "class3")).toBe(
				"class1 class2",
			);
		});

		it("should merge tailwind classes", () => {
			expect(cn("p-2", "p-4")).toBe("p-4");
		});
	});

	describe("formatDate", () => {
		it("should format date string correctly", () => {
			const date = "2023-01-01T12:00:00Z";
			expect(formatDate(date)).toBe("2023-01-01");
		});

		it("should format Date object correctly", () => {
			const date = new Date("2023-12-31T00:00:00Z");
			expect(formatDate(date)).toBe("2023-12-31");
		});
	});
});
