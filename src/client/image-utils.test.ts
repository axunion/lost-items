import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressImage } from "./image-utils";

describe("image-utils", () => {
  describe("compressImage", () => {
    let originalImage: typeof Image;

    beforeEach(() => {
      originalImage = global.Image;

      // Default mock: 2000x2000 image
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private _src = "";
        width = 2000;
        height = 2000;

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
    });

    afterEach(() => {
      global.Image = originalImage;
      vi.restoreAllMocks();
    });

    function makeCanvas(
      overrides?: Partial<{ width: number; height: number }>,
    ) {
      const ctx = { drawImage: vi.fn() };
      const canvas = {
        width: overrides?.width ?? 0,
        height: overrides?.height ?? 0,
        getContext: vi.fn(() => ctx),
        toBlob: vi.fn((callback: (b: Blob | null) => void) =>
          callback(new Blob(["mock data"], { type: "image/jpeg" })),
        ),
      };
      return { canvas, ctx };
    }

    it("should compress an image larger than max dimensions", async () => {
      const { canvas, ctx } = makeCanvas();
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "test.png", { type: "image/png" });
      const result = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
      });

      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe("test.jpg");
      expect(result.type).toBe("image/jpeg");
      // 2000x2000 → 1000x1000
      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(1000);
      expect(ctx.drawImage).toHaveBeenCalled();
      expect(canvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        "image/jpeg",
        expect.any(Number),
      );
    });

    it("should maintain aspect ratio for landscape image", async () => {
      global.Image = class {
        onload: (() => void) | null = null;
        private _src = "";
        width = 2000;
        height = 1000;
        set src(v: string) {
          this._src = v;
          setTimeout(() => this.onload?.(), 0);
        }
        get src() {
          return this._src;
        }
      } as unknown as typeof Image;

      const { canvas } = makeCanvas();
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "test.png", { type: "image/png" });
      await compressImage(file, { maxWidth: 1000, maxHeight: 1000 });

      // 2000x1000 → 1000x500 (maxWidth constraint)
      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(500);
    });

    it("should maintain aspect ratio for portrait image", async () => {
      global.Image = class {
        onload: (() => void) | null = null;
        private _src = "";
        width = 1000;
        height = 2000;
        set src(v: string) {
          this._src = v;
          setTimeout(() => this.onload?.(), 0);
        }
        get src() {
          return this._src;
        }
      } as unknown as typeof Image;

      const { canvas } = makeCanvas();
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "portrait.png", { type: "image/png" });
      await compressImage(file, { maxWidth: 1000, maxHeight: 1000 });

      // 1000x2000 → 500x1000 (maxHeight constraint)
      expect(canvas.width).toBe(500);
      expect(canvas.height).toBe(1000);
    });

    it("should not resize an image that fits within max dimensions", async () => {
      global.Image = class {
        onload: (() => void) | null = null;
        private _src = "";
        width = 800;
        height = 600;
        set src(v: string) {
          this._src = v;
          setTimeout(() => this.onload?.(), 0);
        }
        get src() {
          return this._src;
        }
      } as unknown as typeof Image;

      const { canvas } = makeCanvas();
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "small.png", { type: "image/png" });
      await compressImage(file, { maxWidth: 1920, maxHeight: 1920 });

      // 800x600 unchanged (within limits)
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it("should convert extension to .jpg for file without extension", async () => {
      const { canvas } = makeCanvas();
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "photo", { type: "image/png" });
      const result = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
      });

      expect(result.name).toBe("photo.jpg");
    });

    it("should convert only the last extension for files with multiple dots", async () => {
      const { canvas } = makeCanvas();
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "my.photo.heic", { type: "image/heic" });
      const result = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
      });

      expect(result.name).toBe("my.photo.jpg");
    });

    it("should reject when canvas context is unavailable", async () => {
      const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => null),
        toBlob: vi.fn(),
      };
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "test.png", { type: "image/png" });
      await expect(compressImage(file)).rejects.toThrow(
        "Failed to get canvas context",
      );
    });

    it("should reject when blob creation fails", async () => {
      const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({ drawImage: vi.fn() })),
        toBlob: vi.fn((callback: (b: Blob | null) => void) => callback(null)),
      };
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "test.png", { type: "image/png" });
      await expect(compressImage(file)).rejects.toThrow(
        "Failed to create blob",
      );
    });

    it("should reject when image loading fails", async () => {
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      } as unknown as typeof Image;

      const file = new File(["mock"], "test.png", { type: "image/png" });
      await expect(compressImage(file)).rejects.toThrow("Failed to load image");
    });

    it("should revoke the object URL after loading", async () => {
      const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
      const { canvas } = makeCanvas();
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "test.png", { type: "image/png" });
      await compressImage(file, { maxWidth: 1000, maxHeight: 1000 });

      expect(revokeSpy).toHaveBeenCalled();
    });

    it("should apply default options (1280px, quality 0.7) when none provided", async () => {
      // Default Image mock is 2000x2000
      const { canvas } = makeCanvas();
      vi.spyOn(document, "createElement").mockReturnValue(
        canvas as unknown as HTMLElement,
      );

      const file = new File(["mock"], "photo.heic", { type: "image/heic" });
      await compressImage(file);

      // 2000x2000 → 1280x1280 (default 1280px constraint)
      expect(canvas.width).toBe(1280);
      expect(canvas.height).toBe(1280);
      expect(canvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        "image/jpeg",
        0.7,
      );
    });
  });
});
