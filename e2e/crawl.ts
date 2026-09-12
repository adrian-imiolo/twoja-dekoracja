import type { Page } from "@playwright/test";

/**
 * How the suite finds every address the site offers a visitor.
 *
 * Shared by the reachability check and by the responsive pass, because both
 * need the same answer to "which pages are there?" and a second list would go
 * stale the moment a page was added — which is exactly when either check is
 * worth having.
 */

/**
 * The pages that exist regardless of what content is in the registry, in the
 * order a visitor meets them. Realization details are not here — they come and
 * go with the archive, and the crawl asserts their shape instead.
 */
export const TRASY_STALE = [
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
 * same-origin links are followed: `tel:`, `mailto:` and the Instagram and
 * Facebook profiles are not this site's to answer for.
 *
 * `naStronie` runs once per page while it is open, so a caller that wants to
 * measure every page — rather than only learn its address — does so in the
 * same walk instead of navigating to each one a second time.
 */
export async function przejdzCalyServis(
  page: Page,
  baseURL: string,
  naStronie?: (sciezka: string) => Promise<void>,
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

    await naStronie?.(sciezka);
  }

  return odwiedzone;
}

/**
 * Scrolls through the whole page and waits for what that brings in.
 *
 * Photographs below the fold are lazy and fonts arrive on their own time;
 * a page measured before either has landed passes for the wrong reason. So
 * the walk is followed by a wait for every image to finish and for the
 * fonts to be ready, bounded so a broken image cannot hang the suite.
 */
export async function przewinCalaStrone(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(null)),
      );
    }
    window.scrollTo(0, document.body.scrollHeight);

    const obrazy = [...document.images].filter((obraz) => !obraz.complete);
    const zaladowane = Promise.all(
      obrazy.map(
        (obraz) =>
          new Promise((resolve) => {
            obraz.addEventListener("load", resolve, { once: true });
            obraz.addEventListener("error", resolve, { once: true });
          }),
      ),
    );
    const limit = new Promise((resolve) => setTimeout(resolve, 5_000));
    await Promise.race([
      Promise.all([zaladowane, document.fonts.ready]),
      limit,
    ]);
  });
}
