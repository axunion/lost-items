import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

// .dev.vars is gitignored and holds the local ADMIN_TOKEN secret that the dev
// server (miniflare) reads directly; parse it here so the test knows the
// same value without committing it.
const devVars = readFileSync(
  path.resolve(import.meta.dirname, "../../.dev.vars"),
  "utf-8",
);
const adminToken = devVars.match(/^ADMIN_TOKEN=(.+)$/m)?.[1];
if (!adminToken) {
  throw new Error("ADMIN_TOKEN not found in .dev.vars");
}

test("dashboard renders primary UI sections", async ({ page }) => {
  await page.goto(`/${adminToken}/dashboard`);
  await expect(page).toHaveTitle("Dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("New Room")).toBeVisible();
  await expect(page.getByPlaceholder("Room Name")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
  await expect(page.getByText("Recent")).toBeVisible();
  await expect(page.getByRole("link", { name: "All" })).toHaveAttribute(
    "href",
    `/${adminToken}/history`,
  );
});

test("public room page hides edit and delete buttons when items exist", async ({
  page,
  request,
}) => {
  const roomName = `Public Room ${Date.now()}-${process.pid}`;
  const createRes = await request.post("/api/lists", {
    data: { name: roomName },
  });
  expect(createRes.ok()).toBeTruthy();
  const { id, publicId } = (await createRes.json()) as {
    id: string;
    publicId: string;
  };

  const itemRes = await request.post(`/api/lists/${id}/items`, {
    multipart: { comment: "smoke item" },
  });
  expect(itemRes.ok()).toBeTruthy();

  await page.goto(`/${publicId}/room`);
  await expect(page.getByTestId("item-card")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit item" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete item" })).toHaveCount(
    0,
  );
});
