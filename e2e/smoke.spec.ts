import { expect, test } from "@playwright/test";

test("the home page serves the branded shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("banner").getByRole("link", { name: "twoja dekoracja" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Szczecin",
  );
  await expect(page.getByRole("contentinfo")).toBeVisible();
});
