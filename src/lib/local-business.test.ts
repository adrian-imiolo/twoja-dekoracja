import { describe, expect, it } from "vitest";

import { type BusinessFacts, localBusinessSchema } from "./local-business";
import { DO_UZUPELNIENIA, site } from "./site";

/**
 * The one piece of search-visibility wiring worth a test.
 *
 * The portfolio spec excludes metadata generation from testing, and this is
 * the same exception `/realizacje/[slug]`'s preview image earned: the failure
 * mode is silent. A schema block that publishes `[DO UZUPEŁNIENIA]` as a phone
 * number renders as nothing on the page, passes every build, and hands a
 * search engine a marker it reads as the business's real number. Nothing else
 * on the site would say so.
 *
 * The guard also has to flip when the client's details arrive, which is why
 * the facts are a parameter rather than read from `site` — both branches are
 * assertable here, months before #12 makes the second one real.
 */

const NIEZNANE = site;

const ZNANE: BusinessFacts = {
  ...site,
  owner: "Anna Kowalska",
  phone: "+48 123 456 789",
  email: "kontakt@twojadekoracja.pl",
  instagram: "@twojadekoracja",
};

describe("localBusinessSchema", () => {
  it("declares the towns the business serves", () => {
    const schema = localBusinessSchema(NIEZNANE);

    expect(schema.areaServed).toEqual(
      site.serviceArea.map((miasto) => ({ "@type": "City", name: miasto })),
    );
  });

  it("publishes no address, because the business is run from a home", () => {
    expect(localBusinessSchema(ZNANE)).not.toHaveProperty("address");
  });

  it("carries the brand name, which is never waiting on the client", () => {
    expect(localBusinessSchema(NIEZNANE).name).toBe(site.name);
  });

  it("omits a fact the client has not supplied rather than publishing the marker", () => {
    const schema = localBusinessSchema(NIEZNANE);

    expect(schema).not.toHaveProperty("telephone");
    expect(schema).not.toHaveProperty("email");
    expect(schema).not.toHaveProperty("legalName");
    expect(schema).not.toHaveProperty("sameAs");
    expect(JSON.stringify(schema)).not.toContain(DO_UZUPELNIENIA);
  });

  it("publishes the owner's details once they are known", () => {
    const schema = localBusinessSchema(ZNANE);

    expect(schema.legalName).toBe(ZNANE.owner);
    expect(schema.telephone).toBe(ZNANE.phone);
    expect(schema.email).toBe(ZNANE.email);
  });

  it("links the Instagram profile as a URL, without the handle's leading @", () => {
    expect(localBusinessSchema(ZNANE).sameAs).toEqual([
      "https://instagram.com/twojadekoracja",
    ]);
  });

  it("resolves a preview photograph against the site's own origin", () => {
    // A search engine fetches this image without the page it came from, so a
    // build-relative path resolves nowhere.
    const schema = localBusinessSchema(ZNANE, ["/_next/static/media/a.jpg"]);

    expect(schema.image).toEqual([`${site.url}/_next/static/media/a.jpg`]);
  });

  it("omits the image entirely when there is no photograph to offer", () => {
    expect(localBusinessSchema(ZNANE, [])).not.toHaveProperty("image");
  });
});
