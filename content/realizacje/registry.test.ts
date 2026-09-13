import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { findRealizacja, realizacje, sasiednieRealizacje } from "./index";

/**
 * Static assertions over the published content, closer to a build-time check
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

/** This directory: one subdirectory per realization, plus shared modules. */
const CONTENT_DIR = fileURLToPath(new URL(".", import.meta.url));

function realizationFolders(): string[] {
  return readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

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
    const folders = realizationFolders();

    expect(folders.length).toBeGreaterThan(0);
    for (const folder of folders) {
      expect(findRealizacja(folder)).toBeDefined();
    }
  });

  /**
   * Asked of the bytes on disk, because nothing in the registry can see it.
   *
   * A static import resolves to a URL built from the file's name as well as
   * its contents, so one photograph filed as `wesele/05.jpg` and again as
   * `wesele-k-i-m/01.jpg` yields two different `src` values and reads as two
   * photographs to every check that goes through the registry. Only the bytes
   * disagree, and a visitor who meets the same head table twice under two
   * titles is being shown one realization as two.
   */
  it("uses no photograph twice", () => {
    const byContents = new Map<string, string[]>();

    for (const folder of realizationFolders()) {
      for (const plik of readdirSync(join(CONTENT_DIR, folder))) {
        // Matched rather than assumed to be `.jpg`: a format this missed
        // would be skipped silently.
        if (!/\.(jpe?g|png|webp|avif)$/i.test(plik)) continue;

        const fingerprint = createHash("sha256")
          .update(readFileSync(join(CONTENT_DIR, folder, plik)))
          .digest("hex");

        const places = byContents.get(fingerprint) ?? [];
        places.push(`${folder}/${plik}`);
        byContents.set(fingerprint, places);
      }
    }

    // Carried as paths rather than a count, so a failure names the files.
    const twice = [...byContents.values()].filter(
      (places) => places.length > 1,
    );

    expect(byContents.size).toBeGreaterThan(0);
    expect(twice).toEqual([]);
  });

  it("returns nothing for a slug it does not publish", () => {
    expect(findRealizacja("wesele-ktorego-nie-bylo")).toBeUndefined();
  });

  /**
   * Prev/next follow the array as authored, because the archive is read in
   * that order and the band at the bottom of a realization is a way of reading
   * on. The ends drop the missing direction instead of wrapping: "next" on the
   * last realization leading back to the first reads as a loop with no exit, and
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
