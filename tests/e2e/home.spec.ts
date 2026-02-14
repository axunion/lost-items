import { expect, test } from "@playwright/test";

test("dashboard renders primary UI sections", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/Lost Items|Dashboard/);
	await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "New Room" })).toBeVisible();
	await expect(page.getByPlaceholder("Room Name")).toBeVisible();
	await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
	await expect(page.getByText("Recent")).toBeVisible();
	await expect(page.getByRole("link", { name: "All" })).toHaveAttribute(
		"href",
		"/history",
	);
});

test("dashboard can navigate to history and show persisted room", async ({
	page,
	request,
}) => {
	const roomName = `History Room ${Date.now()}`;
	const createResponse = await request.post("/api/lists", {
		data: { name: roomName },
	});
	expect(createResponse.ok()).toBeTruthy();

	await page.goto("/");
	await page.getByRole("link", { name: "All" }).click();
	await expect(page).toHaveURL(/\/history$/);
	await expect(page.locator("#header-title")).toHaveText("History");
	await expect(page.locator("main span", { hasText: roomName }).first()).toBeVisible();
});

test("created room pages are reachable", async ({ page, request }) => {
	const roomName = `Route Room ${Date.now()}`;
	const createResponse = await request.post("/api/lists", {
		data: { name: roomName },
	});
	expect(createResponse.ok()).toBeTruthy();
	const created = (await createResponse.json()) as { id: string };

	await page.goto(`/${created.id}/register`);
	await expect(page.getByRole("heading", { name: roomName })).toBeVisible();
	await expect(page.getByRole("button", { name: "Register" })).toBeVisible();

	await page.goto(`/${created.id}/room`);
	await expect(page.getByRole("heading", { name: roomName })).toBeVisible();
	await expect(page.getByRole("button", { name: "Delete item" })).toHaveCount(0);
});
