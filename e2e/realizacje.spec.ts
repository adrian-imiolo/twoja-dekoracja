import { expect, type Page, test } from "./test";

/**
 * The realizations index: one page, one unified grid.
 *
 * Like `realizacja.spec.ts`, the events below are authored content spelled out
 * rather than imported from the registry: Playwright's transform has no loader
 * for the `.jpg` imports the registry pulls in, and a test that agreed with the
 * registry by construction could not disagree with a page that mislabelled a
 * card's category. Replacing a launch realization means editing these.
 */
const WESELE = { slug: "wesele", title: "Wesele w ogrodzie", badge: "Wesele" };
const IMPREZA = {
  slug: "urodziny-30",
  title: "Urodziny 30",
  badge: "Impreza",
};

/**
 * A card's own accessible name is its badge, title and description run
 * together. `/Wesele/` alone stopped being unique the moment a second
 * wesele-category realization joined the registry. Its `h2` title is the one
 * part of that name authored to be unique, so the card is found by an exact
 * match on that instead of loosely matching the whole thing.
 */
function realizationCard(page: Page, title: string) {
  return page.getByRole("link").filter({
    has: page.getByRole("heading", { name: title, exact: true, level: 2 }),
  });
}

test("shows every realization in one grid, each carrying its category as a badge", async ({
  page,
}) => {
  await page.goto("/realizacje");

  for (const realizacja of [WESELE, IMPREZA]) {
    const card = realizationCard(page, realizacja.title);
    await expect(card).toBeVisible();
    await expect(card).toContainText(realizacja.badge);
  }
});

test("leads from a card to that event", async ({ page }) => {
  await page.goto("/realizacje");

  await realizationCard(page, WESELE.title).click();

  await expect(page).toHaveURL(new RegExp(`/realizacje/${WESELE.slug}$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    WESELE.title,
  );
});

test("ends the grid with an invitation that leads to the contact page", async ({
  page,
}) => {
  await page.goto("/realizacje");

  const grid = page
    .getByRole("list")
    .filter({ has: realizationCard(page, WESELE.title) });
  const invitation = grid.locator(":scope > li").last();

  await expect(
    invitation.getByRole("heading", {
      name: "Planujecie wesele albo przyjęcie?",
      level: 2,
    }),
  ).toBeVisible();
  await expect(invitation).toContainText(
    "Napiszcie, co i kiedy - odpiszemy, czy termin jest wolny.",
  );

  await invitation.getByRole("link", { name: "Napisz do nas" }).click();

  await expect(page).toHaveURL(/\/kontakt$/);
});
