import { describe, expect, it } from "vitest";

import { DO_UZUPELNIENIA, isPending, site, telHref } from "./site";

describe("site", () => {
  it("declares a service area with no town listed twice", () => {
    expect(site.serviceArea.length).toBeGreaterThan(0);
    expect(new Set(site.serviceArea).size).toBe(site.serviceArea.length);
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
