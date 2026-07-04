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

    expect(env.BUCKET.get).toHaveBeenCalledWith(key, {
      onlyIf: expect.anything(),
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Image not found",
    });
  });

  it("returns image/jpeg as default content-type when httpMetadata is absent", async () => {
    const env = createEnv();
    const key =
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb-item.png";
    env.BUCKET.get.mockResolvedValueOnce({
      body: "mock-image",
      httpMetadata: undefined,
    });

    const response = await imagesRoute.request(
      `/${key}`,
      { method: "GET" },
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
  });

  it("rejects uppercase UUID keys (crypto.randomUUID always returns lowercase)", async () => {
    const env = createEnv();
    const key =
      "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA/BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB-item.jpg";

    const response = await imagesRoute.request(
      `/${key}`,
      { method: "GET" },
      env,
    );

    expect(response.status).toBe(400);
  });

  it("rejects path-traversal style keys with 400", async () => {
    const env = createEnv();

    const response = await imagesRoute.request(
      "/../etc/passwd",
      { method: "GET" },
      env,
    );

    expect(response.status).toBe(400);
    expect(env.BUCKET.get).not.toHaveBeenCalled();
  });

  it("returns image body with cache headers", async () => {
    const env = createEnv();
    const key =
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb-item.png";
    env.BUCKET.get.mockResolvedValueOnce({
      body: "mock-image",
      httpMetadata: { contentType: "image/png" },
      httpEtag: '"abc123"',
    });

    const response = await imagesRoute.request(
      `/${key}`,
      { method: "GET" },
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("ETag")).toBe('"abc123"');
    await expect(response.text()).resolves.toBe("mock-image");
  });

  it("returns 304 with no body when the conditional precondition fails", async () => {
    const env = createEnv();
    const key =
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb-item.png";
    // R2 returns an R2Object without a body when onlyIf precondition is not met.
    env.BUCKET.get.mockResolvedValueOnce({
      httpMetadata: { contentType: "image/png" },
      httpEtag: '"abc123"',
    });

    const response = await imagesRoute.request(
      `/${key}`,
      { method: "GET", headers: { "If-None-Match": '"abc123"' } },
      env,
    );

    expect(response.status).toBe(304);
    expect(response.headers.get("ETag")).toBe('"abc123"');
    await expect(response.text()).resolves.toBe("");
  });
});
