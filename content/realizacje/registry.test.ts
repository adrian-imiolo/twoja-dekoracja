import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { findRealizacja, realizacje } from "./index";

/**
 * Static assertions over the published content — closer to a build-time check
 * than a test. `content/realizacje/integrity.test.ts` proves the rules
 * themselves reject bad data; these prove the real registry obeys them.
 *
 * Nothing here asserts on a photograph's dimensions or `src`. A statically
 * imported image resolves to a `StaticImageData` object under the Next build
 * and to a plain URL string under Vitest, so any such assertion would be true
 * in one runtime and false in the other.
 */
const KATEGORIE = ["wesela", "imprezy"];

describe("realization registry", () => {
  it("resolves every slug it publishes", () => {
    expect(realizacje.length).toBeGreaterThan(0);

    for (const realizacja of realizacje) {
      expect(findRealizacja(realizacja.slug)).toBe(realizacja);
    }
  });

  it("publishes no slug twice", () => {
    const slugs = realizacje.map((realizacja) => realizacja.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("puts every realization in one of the two published categories", () => {
    for (const realizacja of realizacje) {
      expect(KATEGORIE).toContain(realizacja.category);
    }
  });

  it("gives every realization a cover and at least one photograph", () => {
    for (const realizacja of realizacje) {
      expect(realizacja.cover.image).toBeTruthy();
      expect(realizacja.cover.alt.trim()).not.toBe("");
      expect(realizacja.photos.length).toBeGreaterThan(0);

      for (const zdjecie of realizacja.photos) {
        expect(zdjecie.image).toBeTruthy();
        expect(zdjecie.alt.trim()).not.toBe("");
      }
    }
  });

  it("registers every realization folder on disk", () => {
    const contentDir = fileURLToPath(new URL(".", import.meta.url));
    const folders = readdirSync(contentDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(folders.length).toBeGreaterThan(0);
    for (const folder of folders) {
      expect(findRealizacja(folder)).toBeDefined();
    }
  });

  it("returns nothing for a slug it does not publish", () => {
    expect(findRealizacja("wesele-ktorego-nie-bylo")).toBeUndefined();
  });
});
