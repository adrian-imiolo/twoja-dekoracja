import { expect, test } from "@playwright/test";

/**
 * The realizations index — one page, one unified grid.
 *
 * Like `realizacja.spec.ts`, the events below are authored content spelled out
 * rather than imported from the registry: Playwright's transform has no loader
 * for the `.jpg` imports the registry pulls in, and a test that agreed with the
 * registry by construction could not disagree with a page that mislabelled a
 * card's category. Replacing a launch realization means editing these.
 */
const WESELE = { slug: "wesele", title: "Wesele", badge: "Wesele" };
const IMPREZA = {
  slug: "urodziny-30",
  title: "Urodziny 30",
  badge: "Impreza",
};

test("shows every realization in one grid, each carrying its category as a badge", async ({
  page,
}) => {
  await page.goto("/realizacje");

  for (const realizacja of [WESELE, IMPREZA]) {
    const card = page.getByRole("link", {
      name: new RegExp(realizacja.title),
    });
    await expect(card).toBeVisible();
    await expect(card).toContainText(realizacja.badge);
  }
});

test("leads from a card to that event", async ({ page }) => {
  await page.goto("/realizacje");

  await page
    .getByRole("link", { name: new RegExp(WESELE.title) })
    .click();

  await expect(page).toHaveURL(new RegExp(`/realizacje/${WESELE.slug}$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    WESELE.title,
  );
});
