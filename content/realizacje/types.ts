import type { StaticImageData } from "next/image";

/**
 * The shape of a realization — one completed event, stored as a folder of
 * photographs beside a module of this shape.
 *
 * The schema lives next to the content rather than in `src/` because the
 * folder is the unit of authoring: a new event is a directory, its photographs
 * and one module written against these types.
 */

/**
 * The two kinds of work the business shows. The union is closed on purpose —
 * the realizations index has exactly two sections, and a third category would
 * be a design decision, not a content one.
 */
export type Kategoria = "wesela" | "imprezy";

/**
 * One photograph and the sentence a screen reader hears in its place.
 *
 * Alt text lives on the photograph rather than being derived from the
 * realization's title, because templated alt text ("Wesele Anny i Piotra —
 * zdjęcie 3") describes nothing. Pairing the two here makes the description a
 * required part of adding a photograph rather than a later pass that never
 * happens.
 */
export interface Fotografia {
  /**
   * Statically imported, never a path string: the import is what gives the
   * build intrinsic dimensions, and those are what remove layout shift and
   * enable blur-up placeholders without hand-maintained numbers.
   */
  image: StaticImageData;
  /** Descriptive Polish, written for this photograph. */
  alt: string;
}

export interface Realizacja {
  /** URL segment under `/realizacje`, and the folder name on disk. */
  slug: string;
  /** "Wesele Anny i Piotra" */
  title: string;
  category: Kategoria;
  /** "Pałac Krąg" */
  place: string;
  /** Human-readable and deliberately imprecise: "Czerwiec 2026". */
  date: string;
  /** "Pudrowy róż, biel i eukaliptus" */
  style: string;
  /** Two sentences at most. The photographs carry the page. */
  intro: string;
  /** The one photograph that represents the event in listings and previews. */
  cover: Fotografia;
  /**
   * The gallery, in authored order. Typed as a non-empty tuple so a
   * realization with no photographs is a compile error rather than an empty
   * page.
   */
  photos: readonly [Fotografia, ...Fotografia[]];
}
