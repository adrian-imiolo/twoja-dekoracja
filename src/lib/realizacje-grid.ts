/**
 * Indexed by `count % 3`, the cards left over after the full rows of three.
 * None left over means the last row is full, so the invitation takes a row of
 * its own.
 */
const THREE_COLUMN_SPANS = [
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-1",
] as const;

/**
 * How the `/realizacje` grid is laid out for the number of cards it holds.
 *
 * Three columns from `lg` once there are three cards or more. Below `lg` there
 * is a single large card per row, which is also what "large and generously
 * spaced" means on a laptop that is not full width.
 *
 * The grid ends with an invitation to write, and the invitation takes whatever
 * the last row of cards leaves: two columns beside a lone card, one beside a
 * pair, the whole row when the cards fill theirs. So the grid ends flush at
 * any count, and a new realization never strands the last card of the grid.
 *
 * Columns, `sizes` and the invitation's span are one decision, because each
 * follows from how many columns the cards share. The span classes are written
 * out in full rather than built from the remainder, since Tailwind only emits
 * classes it finds in the source.
 */
export function gridLayout(count: number): {
  gridClassName: string;
  sizes: string;
  invitationClassName: string;
} {
  if (count >= 3) {
    return {
      gridClassName: "lg:grid-cols-3",
      sizes: "(min-width: 64rem) 22rem, 100vw",
      invitationClassName: THREE_COLUMN_SPANS[count % 3],
    };
  }
  if (count === 2) {
    return {
      gridClassName: "lg:grid-cols-2",
      sizes: "(min-width: 64rem) 34rem, 100vw",
      invitationClassName: "lg:col-span-2",
    };
  }
  return {
    gridClassName: "sm:max-w-xl",
    sizes: "(min-width: 40rem) 36rem, 100vw",
    invitationClassName: "",
  };
}
