import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The way on from the bottom of a realization: previous, next, and back to
 * the archive.
 *
 * Three events from the registry as authored today — the first, one in the
 * middle and the last — because the band behaves differently at each: the
 * first has no "previous", the last has no "next", and only the middle shows
 * both. Like `realizacja.spec.ts`, this couples to authored content on
 * purpose: reordering the archive fails here rather than quietly passing
 * against neighbours that no longer neighbour.
 */
const PIERWSZA = { slug: "wesele", nastepna: "Wesele K i M" };
const SRODKOWA = {
  slug: "urodziny-18",
  poprzednia: "Urodziny 30",
  nastepna: "Chrzest i roczek Poli",
};
const OSTATNIA = {
  slug: "otwarcie-salonu-kosmetycznego",
  poprzednia: "Gender reveal nad jeziorem",
};

function band(page: Page): Locator {
  return page.getByRole("navigation", { name: "Inne realizacje" });
}

function previousLink(page: Page): Locator {
  return band(page).getByRole("link", { name: /Poprzednia realizacja/ });
}

function nextLink(page: Page): Locator {
  return band(page).getByRole("link", { name: /Następna realizacja/ });
}

test("sits after the gallery on every realization, with a way back to the archive", async ({
  page,
}) => {
  for (const { slug } of [PIERWSZA, SRODKOWA, OSTATNIA]) {
    await page.goto(`/realizacje/${slug}`);

    const nav = band(page);
    await expect(nav).toBeVisible();

    // After the last photograph, not above the gallery: the band is for the
    // visitor who has seen everything, and the photographs come first.
    const lastPhoto = page.getByRole("main").getByRole("img").last();
    const photoBottom = await lastPhoto.evaluate(
      (image) => image.getBoundingClientRect().bottom + window.scrollY,
    );
    const navTop = await nav.evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    );
    expect(navTop).toBeGreaterThan(photoBottom);

    await expect(
      nav.getByRole("link", { name: "Wszystkie realizacje" }),
    ).toHaveAttribute("href", "/realizacje");
  }

  // Followed once rather than from every event: the archive is the heaviest
  // page on the site, and under a full parallel run three trips to it is what
  // pushes a client transition past the default expectation budget.
  await band(page).getByRole("link", { name: "Wszystkie realizacje" }).click();
  await expect(page).toHaveURL(/\/realizacje$/, { timeout: 15_000 });
});

test("the first realization offers only a next, and it leads to the second", async ({
  page,
}) => {
  await page.goto(`/realizacje/${PIERWSZA.slug}`);

  await expect(previousLink(page)).toHaveCount(0);

  const next = nextLink(page);
  await expect(next).toContainText(PIERWSZA.nastepna);
  await next.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    PIERWSZA.nastepna,
  );
});

test("a middle realization offers both neighbours, each named", async ({
  page,
}) => {
  await page.goto(`/realizacje/${SRODKOWA.slug}`);

  await expect(previousLink(page)).toContainText(SRODKOWA.poprzednia);
  await expect(nextLink(page)).toContainText(SRODKOWA.nastepna);

  await previousLink(page).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    SRODKOWA.poprzednia,
  );
});

test("the last realization offers only a previous — no wrap back to the first", async ({
  page,
}) => {
  await page.goto(`/realizacje/${OSTATNIA.slug}`);

  await expect(nextLink(page)).toHaveCount(0);

  const previous = previousLink(page);
  await expect(previous).toContainText(OSTATNIA.poprzednia);
  await previous.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    OSTATNIA.poprzednia,
  );
});

test("stacks the two neighbours on a phone rather than squeezing them onto one row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/realizacje/${SRODKOWA.slug}`);

  const previous = previousLink(page);
  const next = nextLink(page);
  await previous.scrollIntoViewIfNeeded();

  const [prevBox, nextBox] = await Promise.all([
    previous.boundingBox(),
    next.boundingBox(),
  ]);
  expect(prevBox).not.toBeNull();
  expect(nextBox).not.toBeNull();

  // One below the other, each spanning the column.
  expect(nextBox!.y).toBeGreaterThanOrEqual(prevBox!.y + prevBox!.height - 1);
  expect(prevBox!.width).toBeGreaterThan(390 * 0.8);
  expect(nextBox!.width).toBeGreaterThan(390 * 0.8);
});
