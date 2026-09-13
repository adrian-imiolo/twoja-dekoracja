import { describe, expect, it } from "vitest";

import { gridLayout } from "./realizacje-grid";

describe("gridLayout", () => {
  /*
   * Counts the registry does not have, on purpose: the rule has to end the
   * grid flush at the archive's next size, not only at today's.
   */
  it.each([
    [6, "lg:col-span-3"],
    [7, "lg:col-span-2"],
    [8, "lg:col-span-1"],
    [9, "lg:col-span-3"],
    [10, "lg:col-span-2"],
  ])(
    "at three columns, spans the %i-card grid's leftover with %s",
    (count, span) => {
      const layout = gridLayout(count);
      expect(layout.gridClassName).toBe("lg:grid-cols-3");
      expect(layout.invitationClassName).toBe(span);
    },
  );

  it("gives the invitation its own row under a row of two cards", () => {
    expect(gridLayout(2).invitationClassName).toBe("lg:col-span-2");
  });

  it("leaves the invitation a plain full-width block under a single card", () => {
    expect(gridLayout(1).invitationClassName).toBe("");
    expect(gridLayout(0).invitationClassName).toBe("");
  });

  it("keeps the card sizes hint per column count", () => {
    expect(gridLayout(7).sizes).toBe("(min-width: 64rem) 22rem, 100vw");
    expect(gridLayout(2).sizes).toBe("(min-width: 64rem) 34rem, 100vw");
    expect(gridLayout(1).sizes).toBe("(min-width: 40rem) 36rem, 100vw");
  });
});
