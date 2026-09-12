import { expect, type Page, test } from "@playwright/test";

import { imie, site, telHref } from "../src/lib/site";
import { MINIMALNY_CZAS_MS } from "../src/lib/zapytanie/handler";

/**
 * The flow the site exists to produce, driven the way a visitor drives it.
 *
 * What the owner actually receives is asserted at the other seam, in
 * `src/lib/zapytanie/handler.test.ts`, where a recorder sits behind the email
 * port. This file answers the question that seam cannot: does the person who
 * filled the form know it worked.
 */

const ZAPYTANIE = {
  imie: "Anna Kowalska",
  kontakt: "anna@example.com",
  typWydarzenia: "Wesele",
  termin: "sierpień 2027",
  wiadomosc: "Szukamy oprawy na wesele pod Szczecinem, około 80 osób.",
};

async function wypelnij(page: Page) {
  await page.getByLabel("Imię").fill(ZAPYTANIE.imie);
  await page.getByLabel("E-mail albo telefon").fill(ZAPYTANIE.kontakt);
  await page
    .getByLabel("Rodzaj uroczystości")
    .selectOption({ label: ZAPYTANIE.typWydarzenia });
  await page.getByLabel("Przybliżony termin").fill(ZAPYTANIE.termin);
  await page.getByLabel("Wiadomość").fill(ZAPYTANIE.wiadomosc);

  /*
   * The route handler drops anything filled in faster than a person could
   * type it, and reports it as sent so that whoever is probing learns nothing.
   * Playwright is exactly that fast. Without this wait the test would watch
   * the confirmation appear over a submission that was thrown away — passing
   * while the form was broken, which is the one thing it is here to catch.
   */
  await page.waitForTimeout(MINIMALNY_CZAS_MS + 500);
}

test("confirms an inquiry that went through, and stops asking for another", async ({
  page,
}) => {
  await page.goto("/kontakt");
  await wypelnij(page);

  await page.getByRole("button", { name: "Wyślij zapytanie" }).click();

  await expect(page.getByRole("status")).toContainText("Dziękujemy");
  // The form is gone rather than merely annotated — a still-filled form under
  // a confirmation is how the owner receives the same inquiry three times.
  await expect(
    page.getByRole("button", { name: "Wyślij zapytanie" }),
  ).toHaveCount(0);
});

test("names the fields it cannot accept, and sends nothing", async ({
  page,
}) => {
  await page.goto("/kontakt");

  let wyslano = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/kontakt")) wyslano += 1;
  });

  await page.getByLabel("Imię").fill("A");
  await page.getByLabel("E-mail albo telefon").fill("gdzie-tam");
  await page.getByRole("button", { name: "Wyślij zapytanie" }).click();

  // Each complaint is attached to the field it belongs to, so the visitor is
  // told what to fix rather than that something is wrong.
  for (const etykieta of [
    "Imię",
    "E-mail albo telefon",
    "Rodzaj uroczystości",
    "Przybliżony termin",
    "Wiadomość",
  ]) {
    await expect(page.getByLabel(etykieta)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  }
  await expect(
    page.getByText("Sprawdź adres e-mail albo numer telefonu", { exact: false }),
  ).toBeVisible();

  expect(wyslano).toBe(0);
});

test("hands over another way of reaching us when delivery fails", async ({
  page,
}) => {
  // The failure is forced at the network rather than by breaking the
  // deployment's configuration: what is under test here is what the visitor is
  // shown, and a refused send and an unreachable provider look identical to
  // the browser.
  await page.route("**/api/kontakt", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ status: "niedostarczone" }),
    }),
  );

  await page.goto("/kontakt");
  await wypelnij(page);
  await page.getByRole("button", { name: "Wyślij zapytanie" }).click();

  // Scoped to the form: Next's own route announcer is also an `alert`, and an
  // unscoped query matches both.
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "Nie udało się wysłać wiadomości",
  );

  /*
   * The substance of the failure state, not just its wording: every owner's
   * number is offered as something the visitor taps. Asserting the sentence
   * alone would pass against a message that names a number nobody can dial,
   * which is the fault this state exists to prevent.
   */
  for (const wlascicielka of site.owners) {
    await expect(
      page.locator("form").getByRole("link", { name: wlascicielka.phone }),
    ).toHaveAttribute("href", telHref(wlascicielka.phone));
  }

  // Still there to try again with, and never claiming a send that failed.
  await expect(
    page.getByRole("button", { name: "Wyślij zapytanie" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("offers the ways of getting in touch that are not the form", async ({
  page,
}) => {
  await page.goto("/kontakt");

  // Each phone is labelled with whose it is — an unlabelled second number
  // reads as an overflow line for the first rather than as another person.
  for (const kanal of [
    ...site.owners.map((wlascicielka) => `Telefon - ${imie(wlascicielka)}`),
    "E-mail",
    "Instagram",
    "Facebook",
  ]) {
    await expect(page.getByText(kanal, { exact: true })).toBeVisible();
  }
});

test("leads to the form from the site header", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("banner")
    .getByRole("link", { name: "Kontakt" })
    .click();

  await expect(page).toHaveURL(/\/kontakt$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("fits a phone screen, with the hidden field pushing nothing off the side", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/kontakt");

  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  // The honeypot is parked off-canvas rather than hidden, which is exactly the
  // kind of positioning that quietly widens a page on the one viewport most of
  // this site's visitors use.
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});
