import { expect, test } from "@playwright/test";

/**
 * The 404 page's copy and layout are static content, which the portfolio
 * spec's testing decisions exclude, and its shell is already asserted by
 * `smoke.spec.ts` against the same root layout. Two things here are neither.
 *
 * An unknown top-level address had no coverage at all. `realizacja.spec.ts`
 * watches the status of an unpublished slug (the other road to this page), and
 * nothing watched this one. A soft 404 is what that guards against: a 200 that
 * looks like a 404 is reported by Google as a soft 404
 * (https://developers.google.com/search/docs/crawling-indexing/http-network-errors#soft-404-errors),
 * and nothing in the browser looks wrong.
 *
 * The onward route is the second. Without it the page is an apology, which is
 * the thing it was built to stop being.
 */

const UNKNOWN_ADDRESS = "/oferta-ktorej-nie-ma";
const UNPUBLISHED_REALIZATION = "/realizacje/wesele-ktorego-nie-bylo";

test("answers 404 for an address the site does not publish", async ({
  page,
}) => {
  const response = await page.goto(UNKNOWN_ADDRESS);

  expect(response?.status()).toBe(404);
});

test("offers the work rather than only a link home", async ({ page }) => {
  await page.goto(UNPUBLISHED_REALIZATION);

  // The first link on the page, not any link somewhere on it: a 404 that
  // leads with "go home" is the dead end this one exists to replace.
  await page.getByRole("main").getByRole("link").first().click();

  await expect(page).toHaveURL(/\/realizacje\/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
