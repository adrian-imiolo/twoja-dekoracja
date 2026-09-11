import { describe, expect, it } from "vitest";

import { localBusinessSchema } from "./local-business";
import { DO_UZUPELNIENIA, instagramHref, site } from "./site";

/**
 * The one piece of search-visibility wiring worth asserting.
 *
 * The portfolio spec excludes metadata generation from testing, and for the
 * shape of a metadata object that is right. This is the same exception
 * `/realizacje/[slug]`'s preview image earned: the failure is silent. A block
 * that publishes `[DO UZUPEŁNIENIA]` as a phone number renders as nothing on
 * the page, passes every build, and hands a search engine a marker it reads as
 * the business's real number. Nothing else on the site would say so.
 *
 * The same silence is why both owners are asserted rather than taken on trust.
 * A block naming one of the pair, or carrying one of the two numbers, looks
 * exactly like a correct one from the rendered page — the only place the
 * omission is visible is here.
 *
 * Nothing here asserts the photograph. Vitest hands a `.jpg` import back as a
 * bare string rather than the object the build produces, so every image in
 * this module resolves to `/undefined` under test — an assertion about it
 * would pass against garbage, which is worse than not making one.
 * `e2e/home.spec.ts` asks the rendered page instead.
 */

describe("localBusinessSchema", () => {
  it("declares the towns the business serves", () => {
    expect(localBusinessSchema().areaServed).toEqual(
      site.serviceArea.map((miasto) => ({ "@type": "City", name: miasto })),
    );
  });

  it("publishes no address, because the business is run from a home", () => {
    expect(localBusinessSchema()).not.toHaveProperty("address");
  });

  it("carries the brand name, which is never waiting on the client", () => {
    expect(localBusinessSchema().name).toBe(site.name);
  });

  it("publishes no surname, which belongs to the privacy policy alone", () => {
    const wydruk = JSON.stringify(localBusinessSchema());

    expect(localBusinessSchema()).not.toHaveProperty("legalName");
    for (const wlascicielka of site.owners) {
      expect(wydruk).not.toContain(wlascicielka.name);
    }
  });

  it("publishes every number, so no caller is sent to a phone that cannot answer", () => {
    expect(localBusinessSchema().telephone).toEqual(
      site.owners.map((wlascicielka) => wlascicielka.phone),
    );
  });

  it("claims both profiles as the same entity as the site", () => {
    expect(localBusinessSchema().sameAs).toEqual([
      instagramHref(site.instagram),
      site.facebook,
    ]);
  });

  it("never hands a search engine the placeholder marker", () => {
    expect(JSON.stringify(localBusinessSchema())).not.toContain(
      DO_UZUPELNIENIA,
    );
  });
});
