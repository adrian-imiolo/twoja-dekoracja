import { describe, expect, it } from "vitest";

import type { Fotografia } from "@content/realizacje";

import { coverStyle } from "./cover-style";

/*
 * Stands in for a static import. The style never reads the image, so any
 * value of the right shape will do.
 */
const image = { src: "/cover.jpg", width: 800, height: 600 };

function okladka(crop: Partial<Fotografia>): Fotografia {
  return { image, alt: "Okładka", ...crop };
}

describe("coverStyle", () => {
  it("leaves an uncropped cover to the default centre crop", () => {
    expect(coverStyle(okladka({}))).toBeUndefined();
  });

  it("pans the crop without magnifying it", () => {
    expect(coverStyle(okladka({ position: "50% 30%" }))).toEqual({
      objectPosition: "50% 30%",
    });
  });

  it("magnifies from the centre when no origin is given", () => {
    expect(coverStyle(okladka({ zoom: 1.5 }))).toEqual({
      transform: "scale(1.5)",
      transformOrigin: "50% 50%",
    });
  });

  it("pans and magnifies from the given origin", () => {
    expect(
      coverStyle(
        okladka({ position: "50% 30%", zoom: 1.5, zoomOrigin: "30% 50%" }),
      ),
    ).toEqual({
      objectPosition: "50% 30%",
      transform: "scale(1.5)",
      transformOrigin: "30% 50%",
    });
  });

  it("ignores an origin when nothing is magnified", () => {
    expect(
      coverStyle(okladka({ position: "50% 30%", zoomOrigin: "30% 50%" })),
    ).toEqual({
      objectPosition: "50% 30%",
    });
  });
});
