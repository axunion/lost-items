import { expect, test } from "@playwright/test";

test("API flow: create room → register item → delete → restore → public read-only", async ({
  page,
  request,
}) => {
  // 1. Create room via API
  const roomName = `API Flow ${Date.now()}-${process.pid}`;
  const createRes = await request.post("/api/lists", {
    data: { name: roomName },
  });
  expect(createRes.ok()).toBeTruthy();
  const { id } = (await createRes.json()) as { id: string };

  // 2. Verify room appears on dashboard (SSR)
  await page.goto("/");
  await expect(page).toHaveTitle("Dashboard");
  await expect(
    page.getByTestId("room-name").filter({ hasText: roomName }),
  ).toBeVisible();

  // 3. Register item via API
  const comment = `Lost Item ${Date.now()}`;
  const itemRes = await request.post(`/api/lists/${id}/items`, {
    multipart: { comment },
  });
  expect(itemRes.ok()).toBeTruthy();
  const { id: itemId } = (await itemRes.json()) as { id: string };

  // 4. Verify item appears on register page (SSR)
  await page.goto(`/${id}/register`);
  await expect(
    page.getByTestId("item-card").filter({ hasText: comment }),
  ).toBeVisible();

  // 5. Delete item via API → Deleted badge
  const deleteRes = await request.delete(`/api/lists/${id}/items/${itemId}`);
  expect(deleteRes.ok()).toBeTruthy();

  await page.reload();
  const itemCard = page.getByTestId("item-card").filter({ hasText: comment });
  await expect(itemCard).toBeVisible();
  await expect(itemCard.getByText("Deleted")).toBeVisible();

  // 6. Restore item via API
  const restoreRes = await request.post(
    `/api/lists/${id}/items/${itemId}/restore`,
  );
  expect(restoreRes.ok()).toBeTruthy();

  // 7. Public room page is read-only
  await page.goto(`/${id}/room`);
  await expect(
    page.getByTestId("item-card").filter({ hasText: comment }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete item" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Edit item" })).toHaveCount(0);
});
