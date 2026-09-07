import { describe, expect, it } from "vitest";

import { isPending, site } from "./site";

describe("site", () => {
  it("declares a service area with no town listed twice", () => {
    expect(site.serviceArea.length).toBeGreaterThan(0);
    expect(new Set(site.serviceArea).size).toBe(site.serviceArea.length);
  });
});

describe("isPending", () => {
  it("recognises a value still waiting on the client", () => {
    expect(isPending(site.phone)).toBe(true);
  });

  it("treats a value the site actually knows as settled", () => {
    expect(isPending(site.city)).toBe(false);
  });
});
