import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressImage } from "./image-utils";

describe("image-utils", () => {
	describe("compressImage", () => {
		let originalImage: typeof Image;
		let originalDocument: typeof document;
		let originalFileReader: typeof FileReader;

		beforeEach(() => {
			originalImage = global.Image;
			originalDocument = global.document;
			originalFileReader = global.FileReader;

			// Mock Image
			global.Image = class {
				onload: (() => void) | null = null;
				onerror: (() => void) | null = null;
				private _src = "";
				width = 2000;
				height = 2000;

				set src(value: string) {
					this._src = value;
					// Simulate async image loading
					setTimeout(() => {
						if (this.onload) this.onload();
					}, 0);
				}
				get src() {
					return this._src;
				}
			} as unknown as typeof Image;

			// Mock FileReader
			global.FileReader = class {
				onload: ((e: { target: { result: string } }) => void) | null = null;
				readAsDataURL() {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: { result: "data:image/png;base64,mock" } });
						}
					}, 0);
				}
			} as unknown as typeof FileReader;
		});

		afterEach(() => {
			global.Image = originalImage;
			global.document = originalDocument;
			global.FileReader = originalFileReader;
			vi.restoreAllMocks();
		});

		it("should compress an image larger than max dimensions", async () => {
			// Mock Canvas and Context
			const mockContext = {
				drawImage: vi.fn(),
			};
			const mockCanvas = {
				width: 0,
				height: 0,
				getContext: vi.fn(() => mockContext),
				toBlob: vi.fn((callback) =>
					callback(new Blob(["mock data"], { type: "image/jpeg" })),
				),
			};

			vi.spyOn(document, "createElement").mockReturnValue(
				mockCanvas as unknown as HTMLElement,
			);

			const file = new File(["mock"], "test.png", { type: "image/png" });
			const result = await compressImage(file, {
				maxWidth: 1000,
				maxHeight: 1000,
			});

			expect(result).toBeInstanceOf(File);
			expect(result.name).toBe("test.jpg");
			expect(result.type).toBe("image/jpeg");

			// Verify resize logic (2000x2000 -> 1000x1000)
			expect(mockCanvas.width).toBe(1000);
			expect(mockCanvas.height).toBe(1000);
			expect(mockContext.drawImage).toHaveBeenCalled();
		});

		it("should maintain aspect ratio", async () => {
			// Mock Image with specific dimensions
			const MockImage = class {
				onload: (() => void) | null = null;
				private _src = "";
				width = 2000;
				height = 1000;
				set src(value: string) {
					this._src = value;
					setTimeout(() => {
						if (this.onload) this.onload();
					}, 0);
				}
				get src() {
					return this._src;
				}
			} as unknown as typeof Image;
			global.Image = MockImage;

			// Mock Canvas
			const mockCanvas = {
				width: 0,
				height: 0,
				getContext: vi.fn(() => ({ drawImage: vi.fn() })),
				toBlob: vi.fn((callback) =>
					callback(new Blob(["mock"], { type: "image/jpeg" })),
				),
			};
			vi.spyOn(document, "createElement").mockReturnValue(
				mockCanvas as unknown as HTMLElement,
			);

			const file = new File(["mock"], "test.png", { type: "image/png" });
			await compressImage(file, { maxWidth: 1000, maxHeight: 1000 });

			// 2000x1000 -> 1000x500 (maxWidth 1000 applied)
			expect(mockCanvas.width).toBe(1000);
			expect(mockCanvas.height).toBe(500);
		});
	});
});
