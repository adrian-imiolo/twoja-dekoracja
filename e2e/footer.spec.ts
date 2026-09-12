import { expect, test } from "@playwright/test";

import { STRONY } from "../src/lib/nawigacja";
import { imie, instagramHref, site, telHref } from "../src/lib/site";

/**
 * The footer as the second way out of a page.
 *
 * Checked on the privacy policy rather than on the home page, because that is
 * the one page with no closing contact band of its own: whatever the footer
 * offers there is all a visitor has. Every locator is scoped to `contentinfo`
 * for the same reason — the home page and `/kontakt` carry the same channels
 * higher up, and an unscoped match would pass against those.
 */
test.describe("the footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/polityka-prywatnosci");
  });

  test("links the logo home", async ({ page }) => {
    // Exact, because the Facebook channel prints the business's name too and
    // a substring match on the wordmark would find both.
    await expect(
      page
        .getByRole("contentinfo")
        .getByRole("link", { name: site.wordmark, exact: true }),
    ).toHaveAttribute("href", "/");
  });

  test("offers every contact channel as a link, named and marked", async ({
    page,
  }) => {
    const stopka = page.getByRole("contentinfo");

    const kanaly = [
      ...site.owners.map((wlascicielka) => ({
        etykieta: `Telefon - ${imie(wlascicielka)}`,
        adres: telHref(wlascicielka.phone),
      })),
      { etykieta: "E-mail", adres: `mailto:${site.email}` },
      { etykieta: "Instagram", adres: instagramHref(site.instagram) },
      { etykieta: "Facebook", adres: site.facebook },
    ];

    for (const kanal of kanaly) {
      await expect(
        stopka.getByText(kanal.etykieta, { exact: true }),
      ).toBeVisible();
      const odnosnik = stopka.locator(`a[href="${kanal.adres}"]`);
      await expect(odnosnik).toBeVisible();
      // The glyph the channel carries everywhere else on the site.
      await expect(odnosnik.locator("svg")).toHaveCount(1);
    }
  });

  test("links every page of the site, and the privacy policy beside them", async ({
    page,
  }) => {
    const stopka = page.getByRole("contentinfo");

    // The same list the header reads, so a page added there is asserted here
    // without this file being told — plus the one link only the footer has.
    for (const strona of [
      ...STRONY,
      { nazwa: "Polityka prywatności", sciezka: "/polityka-prywatnosci" },
    ]) {
      await expect(
        stopka.getByRole("link", { name: strona.nazwa, exact: true }),
      ).toHaveAttribute("href", strona.sciezka);
    }
  });

  // What stands in for the NIP and REGON this business does not have.
  test("still says who this is and where they work", async ({ page }) => {
    const stopka = page.getByRole("contentinfo");

    await expect(stopka).toContainText(site.tagline);
    await expect(stopka).toContainText(site.city);
    for (const wlascicielka of site.owners) {
      await expect(stopka).toContainText(imie(wlascicielka));
    }
  });

  /*
   * The widths between a phone and a desktop are where a column can be too
   * narrow for the one word it has to hold — the e-mail address — without
   * the page itself ever getting wider. So every link is checked against the
   * viewport edge, not only the document's scroll width.
   */
  for (const szerokosc of [390, 640, 768, 1024, 1280]) {
    test(`keeps every link inside a ${szerokosc}px viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: szerokosc, height: 844 });
      await page.goto("/polityka-prywatnosci");

      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      const ramki = await page
        .getByRole("contentinfo")
        .getByRole("link")
        .evaluateAll((elementy) =>
          elementy.map((element) => element.getBoundingClientRect()),
        );
      for (const ramka of ramki) {
        expect(ramka.right).toBeLessThanOrEqual(innerWidth);
        // Comfortable to tap, not merely possible — WCAG 2.5.8's floor is 24.
        expect(ramka.height).toBeGreaterThanOrEqual(36);
      }

      if (szerokosc === 390) {
        // Columns collapse into one rather than wrapping into a ragged block:
        // every link then starts at the same left edge.
        const lewe = new Set(ramki.map((ramka) => Math.round(ramka.left)));
        expect(lewe.size).toBe(1);
      }
    });
  }
});
