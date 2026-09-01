import { expect, test } from "@playwright/test";

test("shows recoverable topology, conflict lineage, and offline state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("SYNTHETIC / NO EXTERNAL ACTIONS")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Two records need deliberate recovery." })).toBeVisible();
  await expect(page.getByText("Automatic merge refused")).toBeVisible();
  await expect(page.getByRole("button", { name: /FIELD-03 West crossing CONFLICT/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /FIELD-07 North culvert SYNCED/ }).click();
  await expect(page.getByRole("button", { name: /FIELD-07 North culvert SYNCED/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "online", exact: true }).click();
  await expect(page.getByText("All routes are carrying evidence.")).toBeVisible();
  await expect(page.getByText("Automatic merge refused")).toHaveCount(0);
  await expect(page.locator(".device-bank .state-offline")).toHaveCount(0);
  await expect(page.locator(".device-bank .state-conflict")).toHaveCount(0);
  await page.getByRole("button", { name: "offline", exact: true }).click();
  await expect(page.getByRole("heading", { name: "The field keeps working without the network." })).toBeVisible();
  await expect(page.getByText("Record sealed in local queue")).toBeVisible();
  await page.getByRole("button", { name: "empty", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No active field shift" })).toBeVisible();
});

test("is keyboard reachable and has no page-level overflow", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to network map" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
});

test("keeps selected recovery near the mobile device bank", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  const heading = await page.getByRole("heading", { name: "Two edits share one sequence." }).boundingBox();
  expect(heading).not.toBeNull();
  expect(heading!.y).toBeLessThan(844);
});
