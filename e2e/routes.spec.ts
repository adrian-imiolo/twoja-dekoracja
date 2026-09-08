import { expect, test, type Page } from "@playwright/test";

/**
 * Every address the site offers a visitor, followed and checked.
 *
 * The portfolio spec's testing decisions exclude static pages — the about
 * page, the FAQ and the privacy policy are copy, and a test over copy restates
 * it. Reachability is not copy. A page that exists but is linked from nowhere,
 * or a link that points at an address the site does not serve, is a hole a
 * visitor falls into, and neither shows up in a build or a type check.
 *
 * The routes are crawled rather than listed, so the check is over what the
 * site actually offers rather than over a list that has to be remembered. A
 * hand-maintained list would go stale exactly when a page is added — which is
 * the moment the check is worth having. The list below is the floor beneath
 * the crawl: it names the routes the site must offer, so a navigation that
 * quietly stops linking somewhere fails here rather than passing on an empty
 * crawl.
 */

/**
 * The pages that exist regardless of what content is in the registry, in the
 * order a visitor meets them. Realization details are not here — they come and
 * go with the archive, and the crawl asserts their shape instead.
 */
const TRASY_STALE = [
  "/",
  "/o-nas",
  "/realizacje",
  "/faq",
  "/kontakt",
  "/polityka-prywatnosci",
] as const;

/**
 * Where a crawl starting at the home page can get to, and what each address
 * answered with.
 *
 * Keyed by path rather than by full URL so the assertions read as routes. Only
 * same-origin links are followed: `tel:`, `mailto:` and the Instagram profile
 * are not this site's to answer for.
 */
async function przejdzCalyServis(
  page: Page,
  baseURL: string,
): Promise<Map<string, number>> {
  const odwiedzone = new Map<string, number>();
  const kolejka = ["/"];

  while (kolejka.length > 0) {
    const sciezka = kolejka.shift()!;
    if (odwiedzone.has(sciezka)) continue;

    const odpowiedz = await page.goto(sciezka);
    odwiedzone.set(sciezka, odpowiedz?.status() ?? 0);

    const adresy = await page
      .locator("a[href]")
      .evaluateAll((kotwice) =>
        kotwice.map((kotwica) => (kotwica as HTMLAnchorElement).href),
      );

    for (const adres of adresy) {
      const url = new URL(adres, baseURL);
      if (url.origin !== new URL(baseURL).origin) continue;

      // An in-page anchor is the same document; following it would crawl the
      // same page once per section heading.
      const kolejnaSciezka = url.pathname;
      if (!odwiedzone.has(kolejnaSciezka)) kolejka.push(kolejnaSciezka);
    }
  }

  return odwiedzone;
}

test("every navigable route responds successfully", async ({
  page,
  baseURL,
}) => {
  // A crawl of a dozen static pages against a production build, one full
  // navigation each — comfortably past the default per-test budget.
  test.setTimeout(120_000);

  const odwiedzone = await przejdzCalyServis(page, baseURL!);

  const niedzialajace = [...odwiedzone].filter(([, status]) => status !== 200);
  expect(niedzialajace).toEqual([]);

  // The crawl is only evidence if it actually got everywhere: a footer that
  // stops linking to the privacy policy would otherwise pass by never being
  // asked about it.
  expect([...odwiedzone.keys()]).toEqual(
    expect.arrayContaining([...TRASY_STALE]),
  );

  // The archive's own pages are reachable from navigation too, whatever is in
  // it — the one route whose addresses this file cannot name in advance.
  expect(
    [...odwiedzone.keys()].filter((sciezka) =>
      /^\/realizacje\/.+/.test(sciezka),
    ).length,
  ).toBeGreaterThan(0);
});

/**
 * The sitemap, checked against what the site actually offers.
 *
 * The spec excludes sitemap output from testing as framework wiring, and for
 * the file's shape that is right. Its *coverage* is not wiring: half the list
 * is generated from the registry and half is written by hand, and the hand-written
 * half goes stale exactly when it matters — a route is added, every page still
 * renders, and the one page nobody links to yet is the one that never gets
 * crawled. Nothing but this says so.
 *
 * Cheap on purpose. The realization pages come from `/realizacje` rather than
 * from a second crawl, and the static routes from the list above, so the two
 * tests in this file cannot disagree about what the site publishes.
 */
test("the sitemap names every page the site publishes", async ({
  page,
  request,
  baseURL,
}) => {
  await page.goto("/realizacje");
  const trasyRealizacji = await page
    .locator('a[href^="/realizacje/"]')
    .evaluateAll((kotwice) =>
      kotwice.map((kotwica) => kotwica.getAttribute("href") ?? ""),
    );

  expect(trasyRealizacji.length).toBeGreaterThan(0);

  const odpowiedz = await request.get("/sitemap.xml");
  expect(odpowiedz.status()).toBe(200);

  const adresy = [...(await odpowiedz.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((dopasowanie) => dopasowanie[1])
    .map((adres) => new URL(adres));

  // Absolute and this site's own. A sitemap is fetched on its own, without the
  // page it describes, so a relative entry names nothing — and one pointing at
  // another origin is ignored outright.
  for (const adres of adresy) {
    expect(adres.origin).toBe(new URL(baseURL!).origin);
  }

  expect(adresy.map((adres) => adres.pathname)).toEqual(
    expect.arrayContaining([...TRASY_STALE, ...new Set(trasyRealizacji)]),
  );
});
