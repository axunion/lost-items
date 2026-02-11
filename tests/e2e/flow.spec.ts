import { test, expect } from "@playwright/test";

test("complete user flow", async ({ page }) => {
	// 1. Home Page
	await page.goto("/");
	await expect(page).toHaveTitle(/Dashboard/);

	// 2. Create Room
	const roomName = `Test Room ${Date.now()}`;
	await page.getByPlaceholder("Room Name").fill(roomName);
	await page.getByRole("button", { name: "Create" }).click();

	// Wait for the new room to appear in the "Recent" list
	await expect(page.getByText(roomName)).toBeVisible();

	// Resolve room id via API to keep navigation deterministic
	const listsResponse = await page.request.get("/api/lists");
	const lists = await listsResponse.json();
	const created = lists.find((item: { id: string; name: string | null }) =>
		item.name === roomName,
	);
	expect(created).toBeTruthy();
	if (!created) {
		throw new Error("Room not found in list response");
	}
	await page.goto(`/${created.id}/register`);
	await expect(page).toHaveURL(/\/[0-9a-f-]+\/register/);

	// 3. Register Item
	const comment = `Lost Item ${Date.now()}`;
	await page.getByPlaceholder("Optional info...").fill(comment);
	await page.getByRole("button", { name: "Register" }).click();

	// 4. Verify Item
	await expect(page.getByText(comment)).toBeVisible();

	// 5. Delete Item
	const itemCard = page.locator("div", { hasText: comment }).first();
	await itemCard.getByRole("button", { name: "Delete item" }).click();
	await page.getByRole("button", { name: "Delete" }).click();

	// 6. Verify Deletion
	await expect(page.getByText(comment)).not.toBeVisible();
});
