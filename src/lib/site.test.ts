import { describe, expect, it } from "vitest";

import {
  DO_UZUPELNIENIA,
  imie,
  instagramHref,
  isPending,
  site,
  telHref,
} from "./site";

describe("site", () => {
  it("declares a service area with no town listed twice", () => {
    expect(site.serviceArea.length).toBeGreaterThan(0);
    expect(new Set(site.serviceArea).size).toBe(site.serviceArea.length);
  });

  /*
   * Two people sharing one number would be a copy-paste fault that is
   * invisible everywhere it matters: the footer, the contact list and the
   * failure state would each render two plausible lines, and the only symptom
   * would be one owner never being reached.
   */
  it("gives every owner a name and a number of her own", () => {
    expect(site.owners.length).toBeGreaterThan(0);

    const numery = site.owners.map((wlascicielka) => wlascicielka.phone);
    expect(new Set(numery).size).toBe(numery.length);

    for (const wlascicielka of site.owners) {
      expect(wlascicielka.name.trim()).not.toBe("");
      expect(wlascicielka.phone.trim()).not.toBe("");
    }
  });
});

describe("imie", () => {
  it("takes the given name, which is what labels a number", () => {
    expect(imie({ name: "Agnieszka Imioło", phone: "+48 500 100 200" })).toBe(
      "Agnieszka",
    );
  });
});

describe("isPending", () => {
  it("recognises a fact the site is still waiting on", () => {
    expect(isPending(DO_UZUPELNIENIA)).toBe(true);
  });

  it("treats a real value as known, including one that merely mentions the marker", () => {
    expect(isPending("+48 123 456 789")).toBe(false);
    expect(isPending(`tel. ${DO_UZUPELNIENIA}`)).toBe(false);
  });

  it("does not mistake an empty value for a placeholder", () => {
    // An empty string is a bug in the data, not a hole the client has to fill,
    // and rendering it as the marker would hide that.
    expect(isPending("")).toBe(false);
  });
});

describe("telHref", () => {
  it("strips the spaces a Polish number is written with, so the link dials", () => {
    expect(telHref("+48 123 456 789")).toBe("tel:+48123456789");
  });

  it("keeps the country code, which a dialler needs", () => {
    expect(telHref("+48123456789")).toBe("tel:+48123456789");
  });

  it("leaves a number written without spaces alone", () => {
    expect(telHref("123456789")).toBe("tel:123456789");
  });
});

describe("instagramHref", () => {
  it("drops the leading @, which the profile URL cannot carry", () => {
    expect(instagramHref("@twojadekoracja")).toBe(
      "https://instagram.com/twojadekoracja",
    );
  });

  it("accepts a handle already written without one", () => {
    expect(instagramHref("twojadekoracja")).toBe(
      "https://instagram.com/twojadekoracja",
    );
  });
});
