import { expect, test } from "@playwright/test";

test("shows recoverable topology, conflict lineage, and offline state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("SYNTHETIC / NO EXTERNAL ACTIONS")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Two records need deliberate recovery." })).toBeVisible();
  await expect(page.getByText("Automatic merge refused")).toBeVisible();
  await page.getByRole("button", { name: "offline", exact: true }).click();
  await expect(page.getByRole("heading", { name: "The field keeps working without the network." })).toBeVisible();
  await page.getByRole("button", { name: "empty", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No active field shift" })).toBeVisible();
});

test("is keyboard reachable and has no page-level overflow", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to network map" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
});
