/**
 * The third abuse control, and the only one that needs to remember anything.
 *
 * The honeypot and the time threshold ask whether *this* submission came from
 * a person. Neither has anything to say about a script that fills the form
 * plausibly and then does it four hundred times, which is the failure this
 * guards: not a bad submission, but a good one repeated until the owner stops
 * reading their inbox.
 *
 * Held in process memory, as the spec asks. That is a real limit and worth
 * saying plainly: a serverless deployment runs several instances, and a sender
 * whose requests land on two of them gets two allowances. It still costs a
 * flood most of its volume, needs no data store, no service and no money, and
 * the thing it protects — one owner's inbox — is not worth more than that.
 */

/**
 * How many inquiries one sender may put in the inbox per window.
 *
 * Set where a person could never reach it and a script reaches it at once. A
 * genuine visitor sends one, or two if they thought of something afterwards;
 * five is far past deliberate and far short of a flood.
 */
export const MAKSIMUM_NA_OKNO = 5;

/** How far back the count reaches. */
export const OKNO_MS = 60 * 60 * 1000;

/**
 * How many senders are remembered at once before the whole count is dropped.
 *
 * A flood from many addresses would otherwise grow this map for as long as the
 * instance lives. Forgetting costs a few inquiries their limit; not forgetting
 * costs the endpoint its memory, and a contact form that has run out of memory
 * is exactly the silent failure this site cannot ship.
 */
export const MAKSIMUM_NADAWCOW = 10_000;

/**
 * The port: whether this sender may send now.
 *
 * Asking is sending — the call records the attempt it allows, so there is no
 * way to check the limit and then forget to spend it.
 */
export interface LimitZapytan {
  przyjmij(nadawca: string): boolean;
}

/**
 * A limiter over a sliding window, counting per sender.
 *
 * Sliding rather than a fixed hour, because a fixed window lets twice the cap
 * through across its boundary — and the clock is an argument so the tests can
 * cross an hour without waiting one.
 */
export function limitZapytan(czas: () => number = Date.now): LimitZapytan {
  const wedlugNadawcy = new Map<string, number[]>();

  function wOknie(nadawca: string, teraz: number): number[] {
    const zapisane = wedlugNadawcy.get(nadawca) ?? [];
    return zapisane.filter((kiedy) => teraz - kiedy < OKNO_MS);
  }

  function zrobMiejsce(teraz: number): void {
    if (wedlugNadawcy.size < MAKSIMUM_NADAWCOW) return;

    for (const nadawca of [...wedlugNadawcy.keys()]) {
      if (wOknie(nadawca, teraz).length === 0) wedlugNadawcy.delete(nadawca);
    }

    // Every sender is still inside their window, so there is nothing stale to
    // drop and the only way to bound this is to start over.
    if (wedlugNadawcy.size >= MAKSIMUM_NADAWCOW) wedlugNadawcy.clear();
  }

  return {
    przyjmij(nadawca) {
      const teraz = czas();
      const proby = wOknie(nadawca, teraz);

      if (proby.length >= MAKSIMUM_NA_OKNO) return false;

      zrobMiejsce(teraz);
      wedlugNadawcy.set(nadawca, [...proby, teraz]);
      return true;
    },
  };
}
