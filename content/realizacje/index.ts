import { chrzestIRoczek } from "./chrzest-i-roczek";
import { genderReveal } from "./gender-reveal";
import { assertRealizacjeValid } from "./integrity";
import { otwarcieSalonuKosmetycznego } from "./otwarcie-salonu-kosmetycznego";
import type { Realizacja } from "./types";
import { urodziny18 } from "./urodziny-18";
import { urodziny30 } from "./urodziny-30";
import { wesele } from "./wesele";

export { KATEGORIA_LABEL } from "./types";
export type { Fotografia, Kategoria, Realizacja } from "./types";

/**
 * Every realization the site publishes, in the order it is shown.
 *
 * The order is authored, not sorted: neither alphabetical nor date-derived, so
 * the strongest work leads regardless of when it happened or what the couple
 * were called. Adding an event is one import and one line here.
 */
export const realizacje: readonly Realizacja[] = [
  wesele,
  urodziny30,
  urodziny18,
  chrzestIRoczek,
  genderReveal,
  otwarcieSalonuKosmetycznego,
];

/*
 * Checked at module load, not on demand, so the check cannot be forgotten at a
 * call site.
 *
 * `/realizacje/[slug]` imports this module to generate its static params, so
 * the throw fails `next build` and a malformed realization never reaches the
 * live site. `npm test` catches the same faults earlier.
 */
assertRealizacjeValid(realizacje);

export function findRealizacja(slug: string): Realizacja | undefined {
  return realizacje.find((realizacja) => realizacja.slug === slug);
}
