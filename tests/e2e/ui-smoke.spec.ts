import { expect, test } from "@playwright/test";

test("dashboard renders primary UI sections", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("New Room")).toBeVisible();
  await expect(page.getByPlaceholder("Room Name")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
  await expect(page.getByText("Recent")).toBeVisible();
  await expect(page.getByRole("link", { name: "All" })).toHaveAttribute(
    "href",
    "/history",
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
  const { id } = (await createRes.json()) as { id: string };

  const itemRes = await request.post(`/api/lists/${id}/items`, {
    multipart: { comment: "smoke item" },
  });
  expect(itemRes.ok()).toBeTruthy();

  await page.goto(`/${id}/room`);
  await expect(page.getByTestId("item-card")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit item" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete item" })).toHaveCount(
    0,
  );
});
