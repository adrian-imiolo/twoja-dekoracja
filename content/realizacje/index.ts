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
 * Checked at module load, not on demand. Every page that lists or resolves a
 * realization imports this module, so a violation throws during `next build`
 * and the deployment never happens — the malformed realization fails the
 * build rather than the live site.
 */
assertRealizacjeValid(realizacje);

export function findRealizacja(slug: string): Realizacja | undefined {
  return realizacje.find((realizacja) => realizacja.slug === slug);
}
