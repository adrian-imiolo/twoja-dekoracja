import { assertRealizacjeValid } from "./integrity";
import type { Realizacja } from "./types";
import { weseleAnnyIPiotra } from "./wesele-anny-i-piotra";

export type { Fotografia, Kategoria, Realizacja } from "./types";

/**
 * Every realization the site publishes, in the order it is shown.
 *
 * The order is authored, not sorted: neither alphabetical nor date-derived, so
 * the strongest work leads regardless of when it happened or what the couple
 * were called. Adding an event is one import and one line here.
 */
export const realizacje: readonly Realizacja[] = [weseleAnnyIPiotra];

/*
 * Checked at module load, not on demand, so the check cannot be forgotten at a
 * call site.
 *
 * Today the test run is what enforces it: nothing under `src/` imports this
 * module yet, so `next build` never evaluates it. Once a page lists or
 * resolves a realization, this same throw fails the build too. Until then,
 * `npm test` in CI is the gate — see `README.md`.
 */
assertRealizacjeValid(realizacje);

export function findRealizacja(slug: string): Realizacja | undefined {
  return realizacje.find((realizacja) => realizacja.slug === slug);
}
