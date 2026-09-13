import { expect, test, type Page } from "./test";

import { STRONY } from "../src/lib/nawigacja";
import { site } from "../src/lib/site";

/**
 * The header's menu on a phone.
 *
 * Below the `sm` breakpoint the site's four pages sit behind a "Menu" button
 * instead of wrapping into two rows under the wordmark. What that menu does
 * is the header's own question, so it is asked here, at the two phone widths
 * the responsive pass also measures. Whether the closed header fits those
 * widths (nothing clipped, nothing hover-only, no target under the suite's
 * 36px floor) is asked of every page in `responsive.spec.ts`. The 44px boxes
 * and the one-line wordmark below are the menu's own promises, not that floor
 * asked twice.
 *
 * Checked on the privacy policy, like the footer: the lightest page, with no
 * hero to wait for, and one the header serves exactly as it serves the rest.
 */

const TELEFONY = [
  { width: 320, height: 568, rozmiarZnaku: 16 },
  { width: 390, height: 844, rozmiarZnaku: 19.5 },
] as const;

/**
 * Opens the menu once the button can open it.
 *
 * Before hydration the button does nothing, which the issue accepts for a
 * visitor and which a test would read as a broken menu. So the press is
 * retried until the state says it took, and never repeated once it has: a
 * second press would close it again.
 */
async function otworzMenu(page: Page) {
  const przycisk = przyciskMenu(page);
  await expect(async () => {
    if ((await przycisk.getAttribute("aria-expanded")) !== "true") {
      await przycisk.click();
    }
    await expect(przycisk).toHaveAttribute("aria-expanded", "true", {
      timeout: 500,
    });
  }).toPass();
}

function przyciskMenu(page: Page) {
  return page.getByRole("banner").getByRole("button", { name: "Menu" });
}

function nawigacja(page: Page) {
  return page.getByRole("banner").getByRole("navigation", { name: "Główna" });
}

function odnosnikiStron(page: Page) {
  return STRONY.map((strona) =>
    page.getByRole("banner").getByRole("link", {
      name: strona.nazwa,
      exact: true,
    }),
  );
}

for (const { width, height, rozmiarZnaku } of TELEFONY) {
  test.describe(`the header at ${width}px`, () => {
    test.use({ viewport: { width, height } });

    test.beforeEach(async ({ page }) => {
      await page.goto("/polityka-prywatnosci");
    });

    test("is one row: the wordmark and the menu button", async ({ page }) => {
      const naglowek = page.getByRole("banner");
      const odnosnikDomowy = naglowek.getByRole("link", {
        name: site.wordmark,
        exact: true,
      });
      const przycisk = przyciskMenu(page);

      await expect(przycisk).toBeVisible();
      await expect(przycisk).toHaveText("Menu");
      await expect(przycisk).toHaveAttribute("aria-expanded", "false");

      const [domowyBox, przyciskBox, naglowekBox, mainBox] = await Promise.all([
        odnosnikDomowy.boundingBox(),
        przycisk.boundingBox(),
        naglowek.boundingBox(),
        page.getByRole("main").boundingBox(),
      ]);

      // The tap box a thumb gets, not the word inside it.
      expect(przyciskBox!.width).toBeGreaterThanOrEqual(44);
      expect(przyciskBox!.height).toBeGreaterThanOrEqual(44);

      // One row: each box's vertical middle falls inside the other's.
      const srodek = (box: typeof domowyBox) => box!.y + box!.height / 2;
      expect(srodek(domowyBox)).toBeGreaterThan(przyciskBox!.y);
      expect(srodek(domowyBox)).toBeLessThan(
        przyciskBox!.y + przyciskBox!.height,
      );
      expect(domowyBox!.x + domowyBox!.width).toBeLessThanOrEqual(
        przyciskBox!.x,
      );

      // Nothing laid out between the row and the page.
      expect(Math.round(mainBox!.y)).toBe(
        Math.round(naglowekBox!.y + naglowekBox!.height),
      );
    });

    test("shows the wordmark without the badge, at its phone size", async ({
      page,
    }) => {
      const naglowek = page.getByRole("banner");
      await expect(naglowek.locator("img")).toBeHidden();

      const znak = naglowek.getByText(site.wordmark, { exact: true });
      await expect(znak).toHaveCSS("font-size", `${rozmiarZnaku}px`);
      await expect(znak).toHaveCSS("white-space", "nowrap");
    });

    test("keeps the pages out of sight and out of the tab order when closed", async ({
      page,
    }) => {
      for (const odnosnik of odnosnikiStron(page)) {
        await expect(odnosnik).toBeHidden();
      }

      // Tab from the button goes past the header, not into the panel.
      await przyciskMenu(page).focus();
      await page.keyboard.press("Tab");
      const wNaglowku = await page.evaluate(
        () => document.activeElement?.closest("header") !== null,
      );
      expect(wNaglowku).toBe(false);
    });

    test("opens a panel of the four pages, one 44px row each, above the page", async ({
      page,
    }) => {
      await otworzMenu(page);
      await expect(przyciskMenu(page)).toHaveText("Menu");
      await expect(przyciskMenu(page)).toHaveAttribute(
        "aria-controls",
        (await nawigacja(page).getAttribute("id"))!,
      );

      const polozenia = [];
      for (const odnosnik of odnosnikiStron(page)) {
        await expect(odnosnik).toBeVisible();
        polozenia.push((await odnosnik.boundingBox())!);
      }

      // In `STRONY` order, top to bottom, each its own row.
      for (let i = 1; i < polozenia.length; i += 1) {
        expect(polozenia[i].y).toBeGreaterThanOrEqual(
          polozenia[i - 1].y + polozenia[i - 1].height - 1,
        );
      }
      for (const box of polozenia) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      expect(new Set(polozenia.map((box) => Math.round(box.x))).size).toBe(1);

      // Between the header row and `main`, pushing the page down.
      const [przyciskBox, panelBox, mainBox] = await Promise.all([
        przyciskMenu(page).boundingBox(),
        nawigacja(page).boundingBox(),
        page.getByRole("main").boundingBox(),
      ]);
      expect(panelBox!.y).toBeGreaterThanOrEqual(
        przyciskBox!.y + przyciskBox!.height,
      );
      expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(mainBox!.y);
    });

    test("closes when a page is chosen, and the page it leads to has it closed", async ({
      page,
    }) => {
      await otworzMenu(page);
      const [pierwsza] = STRONY;

      await odnosnikiStron(page)[0].click();

      await expect(page).toHaveURL(new RegExp(`${pierwsza.sciezka}$`));
      await expect(przyciskMenu(page)).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      for (const odnosnik of odnosnikiStron(page)) {
        await expect(odnosnik).toBeHidden();
      }
    });

    test("closes on Escape and leaves focus on the button", async ({
      page,
    }) => {
      await otworzMenu(page);
      await odnosnikiStron(page)[1].focus();

      await page.keyboard.press("Escape");

      await expect(przyciskMenu(page)).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(przyciskMenu(page)).toBeFocused();
    });

    test("closes on Escape pressed on the button itself", async ({ page }) => {
      await otworzMenu(page);
      await przyciskMenu(page).focus();

      await page.keyboard.press("Escape");

      await expect(przyciskMenu(page)).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(przyciskMenu(page)).toBeFocused();
    });

    /*
     * Left open, then left by a way that is not the menu: the footer. The
     * header survives the navigation, and so would the open state, waiting
     * to reappear the moment Back returns to the page it was opened on.
     */
    test("is closed on returning to the page it was left open on", async ({
      page,
    }) => {
      await otworzMenu(page);
      const [pierwsza] = STRONY;

      await page
        .getByRole("contentinfo")
        .getByRole("link", { name: pierwsza.nazwa, exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`${pierwsza.sciezka}$`));
      await page.goBack();
      await expect(page).toHaveURL(/\/polityka-prywatnosci$/);

      await expect(przyciskMenu(page)).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(odnosnikiStron(page)[0]).toBeHidden();
    });

    test("closes when the button is pressed again, keeping focus on it", async ({
      page,
    }) => {
      await otworzMenu(page);

      await przyciskMenu(page).click();

      await expect(przyciskMenu(page)).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(przyciskMenu(page)).toHaveText("Menu");
      await expect(przyciskMenu(page)).toBeFocused();
      for (const odnosnik of odnosnikiStron(page)) {
        await expect(odnosnik).toBeHidden();
      }
    });
  });
}
