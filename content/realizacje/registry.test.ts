import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { findRealizacja, realizacje, sasiednieRealizacje } from "./index";

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

/**
 * Spelled out rather than imported from `types.ts`. Deriving the expected
 * values from the code under test would make the assertion agree with itself
 * by construction; this literal is the spec restated, and disagrees when the
 * union changes.
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

  /**
   * Prev/next follow the array as authored, because the archive is read in
   * that order and the band at the bottom of an event is a way of reading on.
   * The ends drop the missing direction rather than wrapping: "next" on the
   * last event leading back to the first reads as a loop with no exit, and
   * a visitor cannot tell they have now seen everything.
   */
  describe("neighbours", () => {
    it("gives the first realization a next but no previous", () => {
      const [pierwsza, druga] = realizacje;

      expect(sasiednieRealizacje(pierwsza.slug)).toEqual({
        poprzednia: undefined,
        nastepna: druga,
      });
    });

    it("gives the last realization a previous but no next", () => {
      const ostatnia = realizacje[realizacje.length - 1];
      const przedostatnia = realizacje[realizacje.length - 2];

      expect(sasiednieRealizacje(ostatnia.slug)).toEqual({
        poprzednia: przedostatnia,
        nastepna: undefined,
      });
    });

    it("gives a middle realization both neighbours, in authored order", () => {
      expect(realizacje.length).toBeGreaterThanOrEqual(3);

      for (let i = 1; i < realizacje.length - 1; i += 1) {
        expect(sasiednieRealizacje(realizacje[i].slug)).toEqual({
          poprzednia: realizacje[i - 1],
          nastepna: realizacje[i + 1],
        });
      }
    });

    it("gives no neighbours to a slug it does not publish", () => {
      expect(sasiednieRealizacje("wesele-ktorego-nie-bylo")).toEqual({
        poprzednia: undefined,
        nastepna: undefined,
      });
    });
  });
});
