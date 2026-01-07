import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
	await page.goto("/");

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Lost Items|Dashboard/);
});

test("dashboard heading", async ({ page }) => {
	await page.goto("/");

	// Expects page to have a heading with the name of Dashboard.
	await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
