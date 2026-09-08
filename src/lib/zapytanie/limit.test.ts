import { describe, expect, it } from "vitest";

import { limitZapytan, MAKSIMUM_NA_OKNO, MAKSIMUM_NADAWCOW, OKNO_MS } from "./limit";

/**
 * A clock the test moves by hand.
 *
 * The window is an hour wide; a suite that waited it out would take an hour.
 */
function zegar(od = 0) {
  let teraz = od;
  return {
    czas: () => teraz,
    przesun(oMs: number) {
      teraz += oMs;
    },
  };
}

const NADAWCA = "203.0.113.7";

describe("limitZapytan", () => {
  it("lets one sender through as many times as the cap allows", () => {
    const limit = limitZapytan(zegar().czas);

    const przyjete = Array.from({ length: MAKSIMUM_NA_OKNO }, () =>
      limit.przyjmij(NADAWCA),
    );

    expect(przyjete).toEqual(Array(MAKSIMUM_NA_OKNO).fill(true));
  });

  it("refuses the one attempt past the cap", () => {
    const limit = limitZapytan(zegar().czas);
    for (let i = 0; i < MAKSIMUM_NA_OKNO; i += 1) limit.przyjmij(NADAWCA);

    expect(limit.przyjmij(NADAWCA)).toBe(false);
  });

  it("lets the sender back in once the window has passed them by", () => {
    const czas = zegar();
    const limit = limitZapytan(czas.czas);
    for (let i = 0; i < MAKSIMUM_NA_OKNO; i += 1) limit.przyjmij(NADAWCA);

    czas.przesun(OKNO_MS);

    expect(limit.przyjmij(NADAWCA)).toBe(true);
  });

  it("counts each sender on their own, so one flood cannot silence a street", () => {
    const limit = limitZapytan(zegar().czas);
    for (let i = 0; i < MAKSIMUM_NA_OKNO; i += 1) limit.przyjmij(NADAWCA);

    expect(limit.przyjmij("198.51.100.4")).toBe(true);
  });

  it("forgets everything rather than growing without bound", () => {
    const limit = limitZapytan(zegar().czas);
    for (let i = 0; i < MAKSIMUM_NA_OKNO; i += 1) limit.przyjmij(NADAWCA);
    expect(limit.przyjmij(NADAWCA)).toBe(false);

    for (let i = 0; i < MAKSIMUM_NADAWCOW; i += 1) {
      limit.przyjmij(`10.0.${Math.floor(i / 256)}.${i % 256}`);
    }

    // The counts went with the memory they were held in. A limiter that
    // forgets lets a few extra inquiries through; one that remembers everyone
    // forever eventually takes the whole endpoint down with it.
    expect(limit.przyjmij(NADAWCA)).toBe(true);
  });
});
