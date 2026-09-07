import { expect, test } from "@playwright/test";

/**
 * The realizations index — one page, a section per category.
 *
 * Like `realizacja.spec.ts`, the events below are authored content spelled out
 * rather than imported from the registry: Playwright's transform has no loader
 * for the `.jpg` imports the registry pulls in, and a test that agreed with the
 * registry by construction could not disagree with a page that filed a wedding
 * under Imprezy. Replacing the placeholder events means editing these.
 */
const WESELA = {
  heading: "Wesela",
  anchor: "wesela",
  slug: "wesele-anny-i-piotra",
  title: "Wesele Anny i Piotra",
};

const IMPREZY = {
  heading: "Imprezy",
  anchor: "imprezy",
  slug: "czterdzieste-urodziny-marty",
  title: "Czterdzieste urodziny Marty",
};

const KATEGORIE = [WESELA, IMPREZY];

test("shows a section per category, each holding that category's work", async ({
  page,
}) => {
  await page.goto("/realizacje");

  for (const kategoria of KATEGORIE) {
    const section = page.getByRole("region", { name: kategoria.heading });
    await expect(section).toBeVisible();

    // Its own work is inside it …
    await expect(
      section.getByRole("link", { name: new RegExp(kategoria.title) }),
    ).toBeVisible();

    // … and only its own. A page that listed every realization under both
    // headings would satisfy the assertion above and be useless.
    for (const other of KATEGORIE.filter((entry) => entry !== kategoria)) {
      await expect(
        section.getByRole("link", { name: new RegExp(other.title) }),
      ).toHaveCount(0);
    }
  }
});

test("gives each section an address the owner can send someone to", async ({
  page,
}) => {
  // The second section is the one worth asserting: it starts below the fold,
  // so reaching it means the anchor actually resolved rather than the page
  // merely having loaded at the top.
  await page.goto(`/realizacje#${IMPREZY.anchor}`);

  await expect(
    page.getByRole("heading", { name: IMPREZY.heading }),
  ).toBeInViewport();
  await expect(
    page.getByRole("heading", { name: WESELA.heading }),
  ).not.toBeInViewport();
});

test("leads from a card to that event", async ({ page }) => {
  await page.goto("/realizacje");

  await page
    .getByRole("region", { name: WESELA.heading })
    .getByRole("link", { name: new RegExp(WESELA.title) })
    .click();

  await expect(page).toHaveURL(new RegExp(`/realizacje/${WESELA.slug}$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    WESELA.title,
  );
});
