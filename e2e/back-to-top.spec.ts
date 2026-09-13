import { expect, test, type Locator, type Page } from "./test";

/**
 * The floating way back to the top, bottom-right.
 *
 * Its own spec because `responsive.spec.ts` measures every page scrolled to the
 * bottom, where the footer is on screen and this button is not rendered, so
 * that suite never sees it.
 *
 * The longest gallery on a phone, where the header is furthest away and the
 * button matters most.
 */
const GALERIA = "/realizacje/chrzest-i-roczek";
const TELEFON = { width: 390, height: 844 };

function button(page: Page): Locator {
  return page.getByRole("button", { name: "Wróć na górę" });
}

function homeLink(page: Page): Locator {
  return page.getByRole("banner").locator("#header-home-link");
}

/** Scrolls to just past the point where the header is a full screen away. */
async function scrollPastHeader(page: Page) {
  await page.evaluate(() => {
    const header = document.querySelector("header")!;
    const headerBottom = header.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo(0, headerBottom + window.innerHeight + 100);
  });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(TELEFON);
});

test("is not rendered at the top of a page", async ({ page }) => {
  await page.goto(GALERIA);

  await expect(homeLink(page)).toBeVisible();
  await expect(button(page)).toHaveCount(0);
});

test("appears one screen past the header, a full tap target in the bottom-right corner", async ({
  page,
}) => {
  await page.goto(GALERIA);
  await scrollPastHeader(page);

  const target = button(page);
  await expect(target).toBeVisible();

  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);

  // Inside the viewport, and in its bottom-right quarter.
  expect(box!.x).toBeGreaterThan(TELEFON.width / 2);
  expect(box!.y).toBeGreaterThan(TELEFON.height / 2);
  expect(box!.x + box!.width).toBeLessThanOrEqual(TELEFON.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(TELEFON.height);
});

test("returns to the top and hands focus to the header's home link", async ({
  page,
}) => {
  await page.goto(GALERIA);
  await scrollPastHeader(page);

  await button(page).click();

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(homeLink(page)).toBeFocused();
  await expect(button(page)).toHaveCount(0);
});

test("jumps instantly for a visitor who asked for less motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(GALERIA);
  await scrollPastHeader(page);

  await button(page).click();

  // Read once, not polled: a smooth scroll would still be under way.
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("is not rendered while the footer is on screen", async ({ page }) => {
  await page.goto(GALERIA);
  await scrollPastHeader(page);
  await expect(button(page)).toBeVisible();

  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

  await expect(button(page)).toHaveCount(0);
});
