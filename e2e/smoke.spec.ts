import { expect, test } from "@playwright/test";

test("the home page serves the branded shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("banner").getByRole("link", { name: "twoja dekoracja" }),
  ).toBeVisible();
  // Locative, because "w Szczecin" reads as broken Polish.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "w Szczecinie",
  );
  await expect(page.getByRole("contentinfo")).toBeVisible();
});
