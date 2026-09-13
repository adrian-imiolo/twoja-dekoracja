import { chrzestIRoczek } from "./chrzest-i-roczek";
import { genderReveal } from "./gender-reveal";
import { assertRealizacjeValid } from "./integrity";
import { otwarcieSalonuKosmetycznego } from "./otwarcie-salonu-kosmetycznego";
import type { Realizacja } from "./types";
import { urodziny18 } from "./urodziny-18";
import { urodziny30 } from "./urodziny-30";
import { wesele } from "./wesele";
import { weseleKiM } from "./wesele-k-i-m";

export { KATEGORIA_LABEL } from "./types";
export type { Fotografia, Kategoria, Realizacja } from "./types";

/**
 * Every realization the site publishes, in the order it is shown.
 *
 * The order is authored by hand, so the strongest work leads regardless of
 * when it happened or what the couple were called. Adding a realization is one
 * import and one line here.
 */
export const realizacje: readonly Realizacja[] = [
  wesele,
  weseleKiM,
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

/**
 * The realizations either side of one, in the authored order above.
 *
 * Lives here rather than in the page because the registry owns the order: a
 * page that reached into the array to find its neighbours would be a second
 * place that knows how the archive is sequenced. Either side is `undefined` at
 * the ends. Nothing wraps, so the last realization has no "next" and a visitor
 * can tell they have seen everything.
 */
export function sasiednieRealizacje(slug: string): {
  poprzednia: Realizacja | undefined;
  nastepna: Realizacja | undefined;
} {
  const index = realizacje.findIndex((realizacja) => realizacja.slug === slug);
  if (index === -1) return { poprzednia: undefined, nastepna: undefined };

  return {
    poprzednia: realizacje[index - 1],
    nastepna: realizacje[index + 1],
  };
}
