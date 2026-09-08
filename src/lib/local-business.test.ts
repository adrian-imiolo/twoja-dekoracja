import { describe, expect, it } from "vitest";

import { ifKnown, localBusinessSchema } from "./local-business";
import { DO_UZUPELNIENIA, site } from "./site";

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
 * Both sides of that guard are covered through `ifKnown` rather than by making
 * the schema take its facts as an argument. The spec is explicit that the
 * email port is the single indirection introduced purely for testability, and
 * a JSON-LD block does not get to be the second one.
 *
 * Nothing here asserts the photograph. Vitest hands a `.jpg` import back as a
 * bare string rather than the object the build produces, so every image in
 * this module resolves to `/undefined` under test — an assertion about it
 * would pass against garbage, which is worse than not making one.
 * `e2e/home.spec.ts` asks the rendered page instead.
 */

describe("ifKnown", () => {
  it("omits the key entirely while the client has not supplied a value", () => {
    expect(ifKnown("telephone", DO_UZUPELNIENIA)).toEqual({});
  });

  it("publishes the value once it is known", () => {
    expect(ifKnown("telephone", "+48 123 456 789")).toEqual({
      telephone: "+48 123 456 789",
    });
  });
});

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

  it("never hands a search engine the placeholder marker", () => {
    expect(JSON.stringify(localBusinessSchema())).not.toContain(
      DO_UZUPELNIENIA,
    );
  });
});
