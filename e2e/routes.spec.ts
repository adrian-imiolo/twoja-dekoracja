import { expect, test } from "@playwright/test";

import { site } from "../src/lib/site";
import { przejdzCalyServis, TRASY_STALE } from "./crawl";

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
 * the moment the check is worth having. `TRASY_STALE` is the floor beneath
 * the crawl: it names the routes the site must offer, so a navigation that
 * quietly stops linking somewhere fails here rather than passing on an empty
 * crawl.
 */

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
 * is generated from the registry and half is written by hand, and the
 * hand-written half goes stale exactly when it matters — a route is added,
 * every page still renders, and the one page nobody links to yet is the one
 * that never gets crawled.
 *
 * So the expectation is the crawl, not a second hand-written list. A list
 * here would go stale in step with the one it is checking, which is no check
 * at all. It costs a second walk of a dozen static pages and buys the only
 * assertion that can catch the divergence.
 *
 * Equality in both directions. A route missing from the sitemap is invisible
 * to a search engine; a route in the sitemap that the site no longer serves is
 * a crawler sent to a 404, and both are silent.
 */
test("the sitemap names every page the site publishes, and only those", async ({
  page,
  request,
  baseURL,
}) => {
  test.setTimeout(120_000);

  const odwiedzone = await przejdzCalyServis(page, baseURL!);

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

  const uporzadkowane = (sciezki: Iterable<string>) =>
    [...new Set(sciezki)].sort();

  expect(uporzadkowane(adresy.map((adres) => adres.pathname))).toEqual(
    uporzadkowane(odwiedzone.keys()),
  );
});

/**
 * Surnames belong to one page, and the check has to be over the source rather
 * than over what is painted.
 *
 * React serialises list keys into the RSC payload, so a `key={owner.name}`
 * ships both surnames in the HTML of every page while rendering neither — a
 * leak that is invisible in a browser, invisible in review, and exactly the
 * kind a privacy decision is made to prevent. `toContain` over the response
 * body is what sees it.
 */
test("keeps surnames off every page but the privacy policy", async ({
  page,
}) => {
  const nazwiska = site.owners.map(
    (wlascicielka) => wlascicielka.name.split(" ").slice(1).join(" "),
  );

  for (const trasa of TRASY_STALE) {
    const odpowiedz = await page.goto(trasa);
    const tresc = (await odpowiedz!.text());

    for (const nazwisko of nazwiska) {
      if (trasa === "/polityka-prywatnosci") {
        // RODO obliges the controller to be named, and this is where it is done.
        expect(tresc).toContain(nazwisko);
      } else {
        expect(tresc, `${nazwisko} leaked into ${trasa}`).not.toContain(
          nazwisko,
        );
      }
    }
  }
});
