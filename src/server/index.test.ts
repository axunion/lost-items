// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

// Make createDb throw so listsRoute propagates to the onError handler
vi.mock("./db", () => ({
  createDb: vi.fn(() => {
    throw new Error("DB unavailable");
  }),
}));

import app from "./index";

describe("app onError handler", () => {
  it("returns 500 JSON when a route handler throws", async () => {
    const res = await app.request("/api/lists", { method: "GET" });

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
  });
});

describe("CSRF guard", () => {
  // csrf() applies only to form-content types (multipart, urlencoded, text/plain)
  // JSON POSTs are already CORS-protected and excluded by the middleware by design
  it("returns 403 when multipart form request has no Origin header", async () => {
    const formData = new FormData();
    formData.append("comment", "x");

    const res = await app.request("/api/lists/dummy-id/items", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(403);
  });
});
