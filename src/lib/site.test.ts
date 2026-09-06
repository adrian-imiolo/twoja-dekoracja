import { describe, expect, it } from "vitest";

import { site } from "./site";

describe("site", () => {
  it("declares a service area led by the city the business sells against", () => {
    expect(site.serviceArea[0]).toBe("Szczecin");
    expect(site.serviceArea.length).toBeGreaterThan(1);
  });

  it("lists each town in the service area only once", () => {
    expect(new Set(site.serviceArea).size).toBe(site.serviceArea.length);
  });
});
