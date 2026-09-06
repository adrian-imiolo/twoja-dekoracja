import type { Fotografia, Kategoria, Realizacja } from "./types";

/**
 * Lowercase, ASCII, single hyphens between words. The slug is both the URL
 * segment under `/realizacje` and the folder name on disk, so anything that
 * would need escaping in one or renaming in the other is rejected outright —
 * including the Polish diacritics that appear everywhere else in this content.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Prose a visitor reads. Every one of these appears on the realization page,
 * so an empty string is a hole in the page rather than a missing nicety.
 */
const REQUIRED_PROSE = ["title", "place", "date", "style", "intro"] as const;

/**
 * Mirrors the `Kategoria` union at runtime. TypeScript already rejects a third
 * category, but a single `as` in a content file would slip one past it and
 * land a realization in neither section of the index — visible nowhere.
 */
const KATEGORIE: readonly Kategoria[] = ["wesela", "imprezy"];

/**
 * Rules the type system cannot express, checked where a violation is cheapest
 * to find: at module load, so a malformed realization fails `next build` and
 * never reaches the live site, and in the test run, so it fails even sooner.
 *
 * Only rules that TypeScript genuinely cannot enforce belong here. Shape,
 * category membership and "at least one photograph" are already compile
 * errors; duplicated slugs across separately authored folders are not.
 */
export function assertRealizacjeValid(realizacje: readonly Realizacja[]): void {
  const seen = new Set<string>();

  for (const realizacja of realizacje) {
    if (!SLUG.test(realizacja.slug)) {
      throw new Error(
        `Slug "${realizacja.slug}" jest nieprawidłowy — dozwolone są tylko małe litery, cyfry i pojedyncze myślniki.`,
      );
    }

    if (seen.has(realizacja.slug)) {
      throw new Error(
        `Realizacja "${realizacja.slug}" jest w rejestrze więcej niż raz — slug musi być unikalny.`,
      );
    }
    seen.add(realizacja.slug);

    if (!KATEGORIE.includes(realizacja.category)) {
      throw new Error(
        `Realizacja "${realizacja.slug}" ma nieznaną kategorię "${realizacja.category}" — dozwolone są: ${KATEGORIE.join(", ")}.`,
      );
    }

    for (const field of REQUIRED_PROSE) {
      if (realizacja[field].trim() === "") {
        throw new Error(
          `Realizacja "${realizacja.slug}" nie ma wypełnionego pola "${field}".`,
        );
      }
    }

    if (realizacja.photos.length === 0) {
      throw new Error(
        `Realizacja "${realizacja.slug}" nie ma żadnych zdjęć — galeria musi zawierać co najmniej jedno.`,
      );
    }

    assertOpisana(realizacja.cover, realizacja.slug, "okładka");
    realizacja.photos.forEach((zdjecie, index) => {
      assertOpisana(zdjecie, realizacja.slug, `zdjęcie ${index + 1}`);
    });
  }
}

/**
 * A photograph without alt text is invisible to story 62's screen reader and
 * to search. Blank is treated as missing: an empty string passes the type
 * checker and describes nothing.
 */
function assertOpisana(
  zdjecie: Fotografia,
  slug: string,
  gdzie: string,
): void {
  if (zdjecie.alt.trim() === "") {
    throw new Error(
      `Realizacja "${slug}": ${gdzie} nie ma tekstu alt — każde zdjęcie potrzebuje opisu po polsku.`,
    );
  }
}
