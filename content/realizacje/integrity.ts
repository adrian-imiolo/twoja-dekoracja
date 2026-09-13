import type { Fotografia, Realizacja } from "./types";

/**
 * Lowercase, ASCII, single hyphens between words. The slug is both the URL
 * segment under `/realizacje` and the folder name on disk, so anything that
 * would need escaping in one or renaming in the other is rejected outright,
 * including the Polish diacritics that appear everywhere else in this content.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Prose a visitor reads. Every one of these appears on the realization page,
 * so an empty string leaves a hole in the page.
 */
const REQUIRED_PROSE = ["title", "place", "date", "style", "intro"] as const;

/**
 * The rules TypeScript cannot express.
 *
 * Only those rules belong here. A missing field, an unknown category and an
 * empty gallery are already compile errors (`Kategoria` is a closed union and
 * `photos` is a non-empty tuple), so re-checking them at runtime would add a
 * branch nothing but its own test could reach. What the type system cannot see
 * is a slug duplicated across two separately authored folders, a slug that
 * would not survive being a URL, prose left blank, or a photograph with no
 * description.
 */
export function assertRealizacjeValid(realizacje: readonly Realizacja[]): void {
  const seen = new Set<string>();

  for (const realizacja of realizacje) {
    if (!SLUG.test(realizacja.slug)) {
      throw new Error(
        `Slug "${realizacja.slug}" jest nieprawidłowy - dozwolone są tylko małe litery, cyfry i pojedyncze myślniki.`,
      );
    }

    if (seen.has(realizacja.slug)) {
      throw new Error(
        `Realizacja "${realizacja.slug}" jest w rejestrze więcej niż raz - slug musi być unikalny.`,
      );
    }
    seen.add(realizacja.slug);

    for (const field of REQUIRED_PROSE) {
      if (realizacja[field].trim() === "") {
        throw new Error(
          `Realizacja "${realizacja.slug}" nie ma wypełnionego pola "${field}".`,
        );
      }
    }

    assertHasAltText(realizacja.cover, realizacja.slug, "okładka");
    realizacja.photos.forEach((zdjecie, index) => {
      assertHasAltText(zdjecie, realizacja.slug, `zdjęcie ${index + 1}`);
    });
  }
}

/**
 * A photograph without alt text is invisible to a screen reader and to search.
 * Blank is treated as missing: an empty string passes the type checker and
 * describes nothing.
 */
function assertHasAltText(
  zdjecie: Fotografia,
  slug: string,
  label: string,
): void {
  if (zdjecie.alt.trim() === "") {
    throw new Error(
      `Realizacja "${slug}": ${label} nie ma tekstu alt - każde zdjęcie potrzebuje opisu po polsku.`,
    );
  }
}
