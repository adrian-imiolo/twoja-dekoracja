import { czterdziesteUrodzinyMarty } from "./czterdzieste-urodziny-marty";
import { assertRealizacjeValid } from "./integrity";
import type { Kategoria, Realizacja } from "./types";
import { weseleAnnyIPiotra } from "./wesele-anny-i-piotra";

export type { Fotografia, Kategoria, Realizacja } from "./types";

/**
 * Every realization the site publishes, in the order it is shown.
 *
 * The order is authored, not sorted: neither alphabetical nor date-derived, so
 * the strongest work leads regardless of when it happened or what the couple
 * were called. Adding an event is one import and one line here.
 */
export const realizacje: readonly Realizacja[] = [
  weseleAnnyIPiotra,
  czterdziesteUrodzinyMarty,
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
 * One category's work, still in the registry's authored order.
 *
 * Filtering rather than holding two separate lists: display order is a single
 * editorial decision about the whole archive, and splitting it into per-category
 * arrays would let the two drift into disagreeing about which event leads.
 */
export function realizacjeInCategory(
  kategoria: Kategoria,
): readonly Realizacja[] {
  return realizacje.filter((realizacja) => realizacja.category === kategoria);
}
