import { expect, test, type Locator } from "@playwright/test";

/**
 * The home page, seen the way a stranger arriving from Google sees it.
 *
 * Authored content is spelled out rather than imported from the registry, for
 * the same reason it is in the other specs: Playwright's transform has no
 * loader for the `.jpg` imports the registry pulls in.
 */

/**
 * Wait for a photograph to have actually arrived and decoded, rather than for
 * an `img` element to exist. A page that renders every frame and fills none of
 * them passes the second check and shows the visitor nothing.
 */
async function expectLoaded(zdjecie: Locator) {
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
}

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

  // The point of arriving is seeing the event, not reaching an address.
  await expectLoaded(page.getByRole("main").getByRole("img").first());
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
  await expectLoaded(poster);

  /*
   * Eager. Next omits the attribute entirely on a `priority` image and writes
   * `loading="lazy"` on every other one, so this is the assertion that goes
   * red the day someone drops `priority` from the poster — and a poster the
   * browser defers cannot be the thing a visitor sees first.
   */
  expect(await poster.getAttribute("loading")).not.toBe("lazy");

  await expect(page.locator("video")).toHaveCount(0);
  expect(mediaRequests).toEqual([]);
});

test("puts a way of making contact within one click of the first screen", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Napisz do nas" }).click();

  // The hero's call to action now leads to a page rather than to an anchor
  // further down this one, so the heading it lands on is that page's.
  await expect(
    page.getByRole("heading", { name: /Porozmawiajmy/ }),
  ).toBeInViewport();
});

/**
 * The structured data, read off the rendered page.
 *
 * Asserted here rather than in `src/lib/local-business.test.ts` because the
 * two facts worth checking only exist after a build: the photograph's URL,
 * which Vitest cannot see, and the whole block as a search engine receives it.
 *
 * The failure this guards is silent in a way nothing else on the site is. A
 * block naming a residential address, or offering `[DO UZUPEŁNIENIA]` as a
 * phone number, renders as nothing at all — the page looks perfect and only a
 * search engine is misled.
 */
test("describes the business to a search engine without giving away an address", async ({
  page,
  baseURL,
}) => {
  await page.goto("/");

  const surowy = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const firma = JSON.parse(surowy ?? "{}");

  expect(firma["@type"]).toBe("LocalBusiness");
  expect(firma).not.toHaveProperty("address");

  // The service area is the whole point: it is what answers "dekoracje
  // weselne Szczecin" in the absence of a street the business could name.
  expect(firma.areaServed.map((miasto: { name: string }) => miasto.name)).toContain(
    "Szczecin",
  );

  // A crawler fetches these without the page they were found on, so a
  // build-relative path resolves nowhere.
  for (const adres of firma.image ?? []) {
    expect(new URL(adres).origin).toBe(new URL(baseURL!).origin);
  }

  expect(surowy).not.toContain("DO UZUPE");
});
