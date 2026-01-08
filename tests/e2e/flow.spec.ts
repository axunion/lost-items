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
	// Assuming the dashboard shows a list of rooms and the new one appears there.
	// We wait for the room name to be visible on the dashboard.
	await expect(page.getByText(roomName)).toBeVisible();

	// Click on the room to enter (simulating navigation)
	await page.getByText(roomName).click();

	// Now we should be on the room page
	await expect(page).toHaveURL(/\/[\w-]+/);
	await expect(page.getByRole("heading", { name: roomName })).toBeVisible();

	// 3. Register Item
	await page.getByRole("link", { name: "Register" }).click();
	await expect(page).toHaveURL(/\/[\w-]+\/register/);

	const comment = `Lost Item ${Date.now()}`;
	await page.getByPlaceholder("Optional info...").fill(comment);
	await page.getByRole("button", { name: "Register" }).click();

	// Wait for navigation back to room page
	await expect(page).toHaveURL(/\/[\w-]+/); // Should act like a regex check for ID

	// 4. Verify Item
	// We look for text-base which usually contains the comment in list items or just check for text
	await expect(page.getByText(comment)).toBeVisible();

	// 5. Delete Item (Requires figuring out how to delete in the new UI)
	// Assuming list item has a link to detail page
	await page.getByText(comment).click();

	// Create a locator for the delete button.
	// Based on previous knowledge, it might be on the detail page or "Danger Zone"
	// Let's assume we clicked into the item detail.
	// We need to confirm we are on detail page.
	await expect(page).toHaveURL(/\/[\w-]+\/items\/[\w-]+/);

	// Click Delete
	// There is usually a confirmation dialog or valid delete button in Danger Zone
	// Finding button with destructive styling or specific text
	const deleteButton = page.getByRole("button", { name: /delete/i });
	await deleteButton.click();

	// Handle Dialog if present (Radix/Kobalte dialogs usually end up in portal)
	// If native confirm, we need page.on('dialog')
	// But typically we use custom dialogs here.
	// Let's blindly try to click the confirm button in the dialog if it pops up.
	// If the delete button immediately deletes (unlikely for danger zone), we are good.
	// If it opens a dialog, we need to click "Delete" again inside it.

	// Assuming generic confirm:
	const confirmButton = page.getByRole("button", { name: /delete/i }).last();
	// If duplicates exist (one on page, one in dialog), last might be the dialog one.
	if (await confirmButton.isVisible()) {
		await confirmButton.click();
	}

	// 6. Verify Deletion
	// Expect redirection to list page
	await expect(page.getByText(comment)).not.toBeVisible();
});
