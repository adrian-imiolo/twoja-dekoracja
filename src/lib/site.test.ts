import { describe, expect, it } from "vitest";

import { site } from "./site";

describe("site", () => {
  it("declares a service area with no town listed twice", () => {
    expect(site.serviceArea.length).toBeGreaterThan(0);
    expect(new Set(site.serviceArea).size).toBe(site.serviceArea.length);
  });
});
