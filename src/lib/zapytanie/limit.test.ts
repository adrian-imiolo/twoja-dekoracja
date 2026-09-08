import { describe, expect, it } from "vitest";

import {
  type LimitZapytan,
  limitZapytan,
  MAKSIMUM_NA_OKNO,
  MAKSIMUM_NADAWCOW,
  OKNO_MS,
} from "./limit";

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

/** Spends this sender's whole allowance, so the next attempt is the refused one. */
function wyczerpLimit(limit: LimitZapytan, nadawca: string): void {
  for (let i = 0; i < MAKSIMUM_NA_OKNO; i += 1) limit.przyjmij(nadawca);
}

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
    wyczerpLimit(limit, NADAWCA);

    expect(limit.przyjmij(NADAWCA)).toBe(false);
  });

  it("lets the sender back in once the window has passed them by", () => {
    const czas = zegar();
    const limit = limitZapytan(czas.czas);
    wyczerpLimit(limit, NADAWCA);

    czas.przesun(OKNO_MS);

    expect(limit.przyjmij(NADAWCA)).toBe(true);
  });

  it("counts each sender on their own, so one flood cannot silence a street", () => {
    const limit = limitZapytan(zegar().czas);
    wyczerpLimit(limit, NADAWCA);

    expect(limit.przyjmij("198.51.100.4")).toBe(true);
  });

  it("forgets the sender heard from longest ago, and no one else", () => {
    const czas = zegar();
    const limit = limitZapytan(czas.czas);
    const DAWNY = "192.0.2.9";

    wyczerpLimit(limit, DAWNY);
    czas.przesun(1);
    wyczerpLimit(limit, NADAWCA);

    // Strangers arrive until there is room for exactly one fewer than this.
    for (let i = 0; i < MAKSIMUM_NADAWCOW - 1; i += 1) {
      czas.przesun(1);
      limit.przyjmij(`10.0.${Math.floor(i / 256)}.${i % 256}`);
    }

    // Asked first, because a refusal is the one answer that records nothing:
    // letting either sender back in would itself evict the other.
    //
    // The flood bought nobody a reset. A limiter that wiped itself under
    // pressure would hand exactly this sender their whole count back.
    expect(limit.przyjmij(NADAWCA)).toBe(false);
    // The sender heard from longest ago was dropped to bound the memory —
    // that is the price, and it is paid by the quietest sender rather than
    // by everyone at once.
    expect(limit.przyjmij(DAWNY)).toBe(true);
  });
});
