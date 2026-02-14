// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { imagesRoute } from "./images";

function createEnv() {
	return {
		DB: {},
		BUCKET: {
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		},
	} as unknown as {
		DB: unknown;
		BUCKET: {
			get: ReturnType<typeof vi.fn>;
			put: ReturnType<typeof vi.fn>;
			delete: ReturnType<typeof vi.fn>;
		};
	};
}

describe("imagesRoute", () => {
	it("returns 400 for invalid key format", async () => {
		const env = createEnv();

		const response = await imagesRoute.request(
			"/invalid-path",
			{ method: "GET" },
			env,
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: "Invalid key format",
		});
		expect(env.BUCKET.get).not.toHaveBeenCalled();
	});

	it("returns 404 when image is missing", async () => {
		const env = createEnv();
		const key =
			"11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222-photo.jpg";
		env.BUCKET.get.mockResolvedValueOnce(null);

		const response = await imagesRoute.request(
			`/${key}`,
			{ method: "GET" },
			env,
		);

		expect(env.BUCKET.get).toHaveBeenCalledWith(key);
		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			error: "Image not found",
		});
	});

	it("returns image body with cache headers", async () => {
		const env = createEnv();
		const key =
			"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb-item.png";
		env.BUCKET.get.mockResolvedValueOnce({
			body: "mock-image",
			httpMetadata: { contentType: "image/png" },
		});

		const response = await imagesRoute.request(
			`/${key}`,
			{ method: "GET" },
			env,
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("image/png");
		expect(response.headers.get("Cache-Control")).toBe(
			"public, max-age=31536000",
		);
		await expect(response.text()).resolves.toBe("mock-image");
	});
});
