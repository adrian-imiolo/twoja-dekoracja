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

    /*
     * A footer row carries no label of its own. What a sighted visitor reads
     * is the number under its owner's name, the address, the handle, the
     * business's name beside Facebook's mark — and what kind of row it is
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
    // without this file being told — plus the one link only the footer has,
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
   * The one question about a narrow footer that is the footer's own: on a
   * phone the columns collapse into a single stack rather than wrapping into
   * a ragged block. Everything else a width can do to this footer — a page
   * that scrolls sideways, a link past the right edge, a target too small for
   * a thumb — is asserted over every page of the site, this one included, in
   * `responsive.spec.ts`, and asking it twice only gives the 36px floor two
   * homes to drift apart in.
   */
  test("collapses into one column on a phone", async ({ page }) => {
    // The page is already loaded; narrowing it is what lays the footer out
    // again, and the grid that does the collapsing is pure CSS.
    await page.setViewportSize({ width: 390, height: 844 });

    const leweKrawedzie = await page
      .getByRole("contentinfo")
      .getByRole("link")
      .evaluateAll((elementy) =>
        elementy.map((element) =>
          Math.round(element.getBoundingClientRect().left),
        ),
      );

    // Collapsed, not wrapped: every link starts at the same left edge. A
    // footer with no links at all fails this too, which is the right answer.
    expect(new Set(leweKrawedzie).size).toBe(1);
  });
});
