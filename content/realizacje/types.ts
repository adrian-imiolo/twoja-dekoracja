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
 * every realization is shown in one unified grid with this as a small badge
 * rather than a hard section split (too few weddings so far to justify one),
 * but a third category would still be a design decision, not a content one.
 */
export type Kategoria = "wesela" | "imprezy";

/** What a category reads as on a card — singular, since a badge names one event. */
export const KATEGORIA_LABEL: Record<Kategoria, string> = {
  wesela: "Wesele",
  imprezy: "Impreza",
};

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
   * Statically imported, never a path string — the import is what gives the
   * build intrinsic dimensions. See `README.md` for why that matters.
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
  /**
   * Two sentences at most. The photographs carry the page.
   *
   * This doubles as the page's meta description, so it is also the snippet
   * Google shows under the result — keep it under about 160 characters or the
   * search listing ends mid-thought.
   */
  intro: string;
  /**
   * The one photograph that represents the event in listings and previews.
   *
   * Normally also a member of `photos` rather than a separate file, so the
   * folder stays the single source of the event's images. A detail page that
   * renders the cover as a hero therefore decides for itself whether to repeat
   * it in the gallery below.
   */
  cover: Fotografia;
  /**
   * The gallery, in authored order. Typed as a non-empty tuple so a
   * realization with no photographs is a compile error rather than an empty
   * page.
   */
  photos: readonly [Fotografia, ...Fotografia[]];
}
