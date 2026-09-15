import { expect, test } from "./test";

import { STRONY } from "../src/lib/nawigacja";
import { imie, instagramHref, site, telHref } from "../src/lib/site";

/**
 * The footer as the second way out of a page.
 *
 * Checked on the privacy policy rather than on the home page, because that is
 * the one page with no closing contact band of its own: whatever the footer
 * offers there is all a visitor has. Every locator is scoped to `contentinfo`
 * for the same reason: the home page and `/kontakt` carry the same channels
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

    /*
     * A footer row carries no label of its own. What a sighted visitor reads
     * is the number under its owner's name, the address, the handle, the
     * business's name beside Facebook's mark. What kind of row it is
     * reaches a screen reader through the link's name instead, which is the
     * only thing telling them that "Twoja Dekoracja" leads to Facebook.
     */
    const kanaly = [
      ...site.owners.map((wlascicielka) => ({
        rodzaj: "Telefon",
        widoczne: [imie(wlascicielka), wlascicielka.phone],
        adres: telHref(wlascicielka.phone),
      })),
      {
        rodzaj: "E-mail",
        widoczne: [site.email],
        adres: `mailto:${site.email}`,
      },
      {
        rodzaj: "Instagram",
        widoczne: [site.instagram],
        adres: instagramHref(site.instagram),
      },
      { rodzaj: "Facebook", widoczne: [site.name], adres: site.facebook },
    ];

    for (const kanal of kanaly) {
      const odnosnik = stopka.locator(`a[href="${kanal.adres}"]`);
      await expect(odnosnik).toBeVisible();
      for (const tekst of kanal.widoczne) {
        await expect(odnosnik).toContainText(tekst);
      }
      await expect(odnosnik).toHaveAccessibleName(new RegExp(kanal.rodzaj));
      // The glyph the channel carries everywhere else on the site.
      await expect(odnosnik.locator("svg")).toHaveCount(1);
    }
  });

  test("links every page of the site, and the privacy policy below them", async ({
    page,
  }) => {
    const stopka = page.getByRole("contentinfo");

    // The same list the header reads, so a page added there is asserted here
    // without this file being told, plus the one link only the footer has,
    // in the strip under the columns rather than among the site's pages.
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
   * The questions about a narrow footer that are the footer's own: on a phone
   * the blocks stack on one edge, the pages sit in a 2×2 grid, and the list's
   * heading leaves the screen but not the outline. Everything else a width can
   * do to this footer (a page that scrolls sideways, a link past the right
   * edge, a target too small for a thumb) is asserted over every page of the
   * site, this one included, in `responsive.spec.ts`, and asking it twice only
   * gives the 36px floor two homes to drift apart in. Its height is not
   * asserted: a pixel budget would fail on every copy edit.
   */
  test("stacks its blocks and grids its pages on a phone", async ({ page }) => {
    // The page is already loaded; narrowing it is what lays the footer out
    // again, and the grid is pure CSS.
    await page.setViewportSize({ width: 390, height: 844 });

    const stopka = page.getByRole("contentinfo");
    const nawigacja = stopka.getByRole("navigation", { name: "Na stronie" });

    function lewaKrawedz(pudelko: { x: number } | null) {
      return Math.round(pudelko!.x);
    }

    // The identity block, the nav and the contact block start on one edge.
    const krawedzie = [
      lewaKrawedz(
        await stopka
          .getByRole("link", { name: site.wordmark, exact: true })
          .boundingBox(),
      ),
      lewaKrawedz(await nawigacja.boundingBox()),
      lewaKrawedz(
        await stopka
          .getByRole("heading", { name: "Kontakt", exact: true })
          .boundingBox(),
      ),
    ];
    expect(new Set(krawedzie).size).toBe(1);

    /*
     * Two columns, two rows, read row by row in the header's order. The grid
     * is sized for four pages; a fifth would need the layout rethought, and
     * this is where that shows.
     */
    expect(STRONY).toHaveLength(4);
    const pudelka = await nawigacja
      .getByRole("link")
      .evaluateAll(function polozenia(elementy) {
        return elementy.map(function polozenie(element) {
          const { left, top } = element.getBoundingClientRect();
          return {
            nazwa: element.textContent,
            left: Math.round(left),
            top: Math.round(top),
          };
        });
      });
    expect(pudelka.map((pudelko) => pudelko.nazwa)).toEqual(
      STRONY.map((strona) => strona.nazwa),
    );
    const [lewyGorny, prawyGorny, lewyDolny, prawyDolny] = pudelka;
    expect(prawyGorny.top).toBe(lewyGorny.top);
    expect(prawyGorny.left).toBeGreaterThan(lewyGorny.left);
    expect(lewyDolny.top).toBeGreaterThan(lewyGorny.top);
    expect(lewyDolny.left).toBe(lewyGorny.left);
    expect(prawyDolny.top).toBe(lewyDolny.top);
    expect(prawyDolny.left).toBe(prawyGorny.left);

    // Still a heading to a screen reader, but not a line on the screen. Measured
    // rather than `not.toBeVisible()`, which counts a 1px screen-reader-only
    // box as visible.
    const naglowek = nawigacja.getByRole("heading", {
      name: "Na stronie",
      exact: true,
    });
    await expect(naglowek).toHaveCount(1);
    const { width, height } = (await naglowek.boundingBox())!;
    expect(width * height).toBeLessThanOrEqual(1);
  });
});
