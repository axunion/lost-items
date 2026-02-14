import { test, expect } from "@playwright/test";

test("complete user flow", async ({ page, request }) => {
	// 1. Home Page
	await page.goto("/");
	await expect(page).toHaveTitle(/Dashboard/);

	// 2. Prepare Room via API
	const roomName = `Test Room ${Date.now()}`;
	const createResponse = await request.post("/api/lists", {
		data: { name: roomName },
	});
	expect(createResponse.ok()).toBeTruthy();
	const created = (await createResponse.json()) as { id: string };
	expect(created.id).toMatch(/^[0-9a-f-]{36}$/);

	// Verify room appears on dashboard (SSR)
	await page.goto("/");
	await expect(page.locator("main span", { hasText: roomName }).first()).toBeVisible();

	// Navigate deterministically using created id
	await page.goto(`/${created.id}/register`);
	await expect(page).toHaveURL(/\/[0-9a-f-]+\/register/);

	// 3. Register Item via API
	const comment = `Lost Item ${Date.now()}`;
	const registerResponse = await request.post(`/api/lists/${created.id}/items`, {
		multipart: {
			comment,
		},
	});
	expect(registerResponse.ok()).toBeTruthy();
	const registered = (await registerResponse.json()) as { id: string };

	// 4. Verify Item on register page
	await page.reload();
	const commentText = page.locator("main p", { hasText: comment }).first();
	await expect(commentText).toBeVisible();

	// 5. Delete Item via API
	const itemCard = page.locator("main div", { hasText: comment }).first();
	const deleteResponse = await request.delete(
		`/api/lists/${created.id}/items/${registered.id}`,
	);
	expect(deleteResponse.ok()).toBeTruthy();

	// 6. Verify soft deletion state
	await page.reload();
	await expect(itemCard.getByText(comment)).toBeVisible();
	await expect(itemCard.getByText("Deleted")).toBeVisible();

	// 7. Restore and verify public page
	const restoreResponse = await request.post(
		`/api/lists/${created.id}/items/${registered.id}/restore`,
	);
	expect(restoreResponse.ok()).toBeTruthy();

	await page.goto(`/${created.id}/room`);
	await expect(page.locator("main p", { hasText: comment }).first()).toBeVisible();
	await expect(page.getByRole("button", { name: "Delete item" })).toHaveCount(0);
});
