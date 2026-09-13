import { expect, test, type Locator, type Page } from "@playwright/test";

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

/**
 * When the poster finished arriving, and when each piece of footage started
 * being fetched, read off the browser's own resource timeline.
 *
 * The timeline is the right witness here rather than Playwright's request
 * events: it is recorded by the browser as the connection actually behaved,
 * at high resolution, instead of being reconstructed from timestamps taken on
 * the test's side of the wire.
 */
async function heroMediaTiming(page: Page, posterSrc: string) {
  return page.evaluate(function readTimeline(src) {
    const entries = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];

    return {
      posterResponseEnd:
        entries.find((entry) => entry.name === src)?.responseEnd ?? null,
      mediaStarts: entries
        .filter((entry) => /\.(mp4|webm|mov)(\?|$)/i.test(entry.name))
        .map((entry) => entry.startTime),
    };
  }, posterSrc);
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

/**
 * The hand-off the whole page is built to make.
 *
 * Four realizations are a sample; the archive is the work. A visitor who never
 * finds the way into it has been shown a quarter of the thing the page exists
 * to sell — which is why the link is the hero's button rather than the small
 * caption it used to be, and why the trip is followed here rather than assumed
 * from the presence of an `href`.
 *
 * Nothing below asserts how the link is drawn. That it is a bordered button is
 * markup, which this suite deliberately does not constrain; that it is visible
 * without hover, tall enough for a thumb and inside the gutter at 320px is a
 * behaviour, and `responsive.spec.ts` is where the site asks it of every page
 * at once.
 */
test("hands the visitor on from the four selected realizations to the whole archive", async ({
  page,
}) => {
  await page.goto("/");

  const wybrane = page.getByRole("region", { name: "Wybrane realizacje" });
  const doArchiwum = wybrane.getByRole("link", {
    name: "Wszystkie realizacje",
  });

  await doArchiwum.click();

  await expect(page).toHaveURL(/\/realizacje$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("opens on a photograph that loads eagerly, and lets it paint before fetching footage", async ({
  page,
}) => {
  /*
   * The hero is built poster-first: the still is the page's
   * largest-contentful-paint candidate, and footage — when `content/hero`
   * carries any — is layered over it and requested only once it has painted.
   * Footage fetched any earlier would compete with the poster for the
   * connection on the one page whose speed the business's entire acquisition
   * channel is graded on.
   *
   * Nothing here asserts whether footage exists; that fact belongs to
   * `content/hero/index.ts` alone. With none, no media is ever requested and
   * the ordering below holds over an empty list, which is the right answer
   * for that state rather than a gap in it.
   */
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

  // Resolved from the rendered element rather than rebuilt from Next's image
  // URL shape, which is an implementation detail this spec has no business
  // knowing.
  const posterSrc = await poster.evaluate(
    (image) => (image as HTMLImageElement).currentSrc,
  );

  /*
   * The mount gate runs a frame after the poster paints, and the request
   * follows the mount, so both trail the assertions above. Wait for them
   * rather than reading the timeline early — a timeline sampled before the
   * request exists would satisfy the ordering by having nothing in it.
   */
  const video = page.locator("video");
  await video
    .waitFor({ state: "attached", timeout: 10_000 })
    .catch(function withoutFootage() {});

  if (await video.count()) {
    await expect
      .poll(
        async () => (await heroMediaTiming(page, posterSrc)).mediaStarts.length,
      )
      .toBeGreaterThan(0);
  }

  const { posterResponseEnd, mediaStarts } = await heroMediaTiming(
    page,
    posterSrc,
  );

  expect(posterResponseEnd).not.toBeNull();
  for (const start of mediaStarts) {
    expect(start).toBeGreaterThanOrEqual(posterResponseEnd!);
  }
});

test("plays the footage layered over the poster", async ({ page }) => {
  /*
   * The one failure on this page that hides itself completely. The hero is
   * built to degrade to the still: the video is held transparent until it
   * reports playing, and a source that 404s or decodes to nothing simply
   * never appears. A renamed file or a bad re-encode would leave the page
   * looking exactly right, so this is the only thing that would notice.
   *
   * Delete this test — deliberately, alongside the `video` entry — if the
   * client's footage is ever withdrawn. Its going red is the point.
   */
  await page.goto("/");

  const video = page.locator("video");
  await video.waitFor({ state: "attached" });

  await expect
    .poll(() =>
      video.evaluate((element) => {
        const footage = element as HTMLVideoElement;
        return !footage.paused && footage.currentTime > 0;
      }),
    )
    .toBe(true);

  // Revealed, not merely running. The fade-in is driven by the same `playing`
  // event, and it is what actually puts the footage in front of the poster.
  await expect(video).toHaveClass(/opacity-100/);
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
  expect(
    firma.areaServed.map((miasto: { name: string }) => miasto.name),
  ).toContain("Szczecin");

  // A crawler fetches these without the page they were found on, so a
  // build-relative path resolves nowhere.
  for (const adres of firma.image ?? []) {
    expect(new URL(adres).origin).toBe(new URL(baseURL!).origin);
  }

  expect(surowy).not.toContain("DO UZUPE");
});
