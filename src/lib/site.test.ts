import { describe, expect, it } from "vitest";

import { instagramHref, site } from "./site";

describe("site", () => {
  it("declares a service area with no town listed twice", () => {
    expect(site.serviceArea.length).toBeGreaterThan(0);
    expect(new Set(site.serviceArea).size).toBe(site.serviceArea.length);
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
