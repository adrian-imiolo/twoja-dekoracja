import { expect, test } from "@playwright/test";

/**
 * The home page, seen the way a stranger arriving from Google sees it.
 *
 * Authored content is spelled out rather than imported from the registry, for
 * the same reason it is in the other specs: Playwright's transform has no
 * loader for the `.jpg` imports the registry pulls in, and a test that agreed
 * with the content by construction could not disagree with a page that put a
 * wedding behind the birthdays link.
 */
const WESELA = {
  heading: "Dekoracje weselne",
  section: "Wesela",
  anchor: "wesela",
};

const IMPREZY = {
  heading: "Dekoracje urodzinowe i okolicznościowe",
  section: "Imprezy",
  anchor: "imprezy",
};

test("leads from the home page into a realization and its photographs", async ({
  page,
}) => {
  await page.goto("/");

  const wybrane = page.getByRole("region", { name: "Wybrane realizacje" });
  const pierwsza = wybrane.getByRole("link").first();
  const tytul = await pierwsza.getByRole("heading").innerText();

  await pierwsza.click();

  await expect(page).toHaveURL(/\/realizacje\/[a-z0-9-]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(tytul);

  // The point of arriving is seeing the event, so the assertion is that a
  // photograph is actually on screen and decoded — not merely that an `img`
  // element exists.
  const zdjecie = page.getByRole("main").getByRole("img").first();
  await expect(zdjecie).toBeVisible();
  await expect
    .poll(() =>
      zdjecie.evaluate(
        (image) =>
          (image as HTMLImageElement).complete &&
          (image as HTMLImageElement).naturalWidth > 0,
      ),
    )
    .toBe(true);
});

test("opens on a photograph that loads eagerly, and asks for no video", async ({
  page,
}) => {
  /*
   * The hero is built poster-first: the still is the page's
   * largest-contentful-paint candidate and a video, when the client supplies
   * one, is layered over it and requested only after that paint. At launch
   * there is no footage at all, and this is what keeps it that way — a video
   * dropped in eagerly would compete with the poster for the connection on
   * the one page whose speed the business's entire acquisition channel is
   * graded on.
   */
  const mediaRequests: string[] = [];
  page.on("request", function recordMedia(request) {
    if (/\.(mp4|webm|mov)(\?|$)/i.test(request.url())) {
      mediaRequests.push(request.url());
    }
  });

  await page.goto("/");

  const poster = page.getByRole("main").getByRole("img").first();
  await expect(poster).toBeVisible();

  // Above the fold and eager. A poster the browser defers cannot be the thing
  // a visitor sees first.
  expect(await poster.getAttribute("loading")).not.toBe("lazy");
  await expect
    .poll(() =>
      poster.evaluate(
        (image) =>
          (image as HTMLImageElement).complete &&
          (image as HTMLImageElement).naturalWidth > 0,
      ),
    )
    .toBe(true);

  await expect(page.locator("video")).toHaveCount(0);
  expect(mediaRequests).toEqual([]);
});

test("sends each of the two search intents to its own part of the archive", async ({
  page,
}) => {
  for (const kategoria of [WESELA, IMPREZY]) {
    await page.goto("/");

    await page
      .getByRole("link", { name: new RegExp(kategoria.heading) })
      .click();

    await expect(page).toHaveURL(
      new RegExp(`/realizacje#${kategoria.anchor}$`),
    );
    await expect(
      page.getByRole("heading", { name: kategoria.section, exact: true }),
    ).toBeInViewport();
  }
});

test("puts a way of making contact within one click of the first screen", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Napisz do nas" }).click();

  await expect(
    page.getByRole("heading", { name: /Porozmawiajmy/ }),
  ).toBeInViewport();
});
