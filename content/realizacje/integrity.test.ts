import { describe, expect, it } from "vitest";

import { assertRealizacjeValid } from "./integrity";
import type { Fotografia, Realizacja } from "./types";

/**
 * The guard in `integrity.ts` is what makes the build-time guarantee real, so
 * it is tested directly rather than only through the published registry: real
 * content has no duplicate slug to catch it failing on.
 *
 * Under Vitest a statically imported image resolves to a URL string; under the
 * Next build it resolves to a `StaticImageData` object. Nothing here may assert
 * on the image's internals, or it passes in one runtime and fails in the other.
 * The static-import requirement is enforced by the type system instead.
 */
const zdjecie: Fotografia = {
  image: { src: "/01.jpg", width: 1600, height: 1067 },
  alt: "Stół prezydialny przystrojony girlandą z eukaliptusa",
};

function realizacja(overrides: Partial<Realizacja> = {}): Realizacja {
  return {
    slug: "wesele-anny-i-piotra",
    title: "Wesele Anny i Piotra",
    category: "wesela",
    place: "Pałac Krąg",
    date: "Czerwiec 2026",
    style: "Pudrowy róż, biel i eukaliptus",
    intro: "Kameralne wesele w barokowych wnętrzach.",
    cover: zdjecie,
    photos: [zdjecie],
    ...overrides,
  };
}

describe("assertRealizacjeValid", () => {
  it("accepts a well-formed registry", () => {
    expect(() =>
      assertRealizacjeValid([
        realizacja({ slug: "wesele-anny-i-piotra" }),
        realizacja({ slug: "urodziny-30-lat", category: "imprezy" }),
      ]),
    ).not.toThrow();
  });

  it("rejects a registry that publishes one slug twice", () => {
    expect(() =>
      assertRealizacjeValid([
        realizacja({ slug: "wesele-anny-i-piotra" }),
        realizacja({ slug: "wesele-anny-i-piotra", title: "Inne wesele" }),
      ]),
    ).toThrow(/wesele-anny-i-piotra/);
  });

  it.each([
    "",
    "  ",
    "Wesele Anny",
    "wesele anny",
    "wesele/anny",
    "wesele--anny",
  ])(
    "rejects %o as a slug, because the slug is also the URL segment",
    (slug) => {
      expect(() => assertRealizacjeValid([realizacja({ slug })])).toThrow(
        /slug/i,
      );
    },
  );

  it.each(["title", "place", "date", "style", "intro"] as const)(
    "rejects a realization whose %s is blank",
    (field) => {
      expect(() =>
        assertRealizacjeValid([realizacja({ [field]: "   " })]),
      ).toThrow(new RegExp(field));
    },
  );

  it("rejects a photograph with no alt text", () => {
    expect(() =>
      assertRealizacjeValid([
        realizacja({ photos: [zdjecie, { ...zdjecie, alt: "  " }] }),
      ]),
    ).toThrow(/alt/i);
  });

  it("rejects a cover with no alt text", () => {
    expect(() =>
      assertRealizacjeValid([realizacja({ cover: { ...zdjecie, alt: "" } })]),
    ).toThrow(/alt/i);
  });
});
