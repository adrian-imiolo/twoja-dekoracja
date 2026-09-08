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
 * How many senders are remembered at once.
 *
 * A flood from many addresses would otherwise grow this map for as long as the
 * instance lives, and a contact form that has run out of memory is exactly the
 * silent failure this site cannot ship. Past this many, the sender heard from
 * least recently is forgotten.
 *
 * Least-recently-heard rather than a wipe, and the difference is the whole
 * point: emptying the map under pressure would let anyone with ten thousand
 * addresses clear their own count by spending them, which is a limiter that
 * rewards the one thing it exists to stop.
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
  /*
   * A `Map` iterates in insertion order, and every accepted attempt deletes
   * its sender before re-adding them. That makes the map its own queue: the
   * first key is always the sender heard from longest ago, so eviction is one
   * lookup rather than a scan of ten thousand entries on every request.
   */
  const wedlugNadawcy = new Map<string, number[]>();

  function wOknie(nadawca: string, teraz: number): number[] {
    const zapisane = wedlugNadawcy.get(nadawca) ?? [];
    return zapisane.filter((kiedy) => teraz - kiedy < OKNO_MS);
  }

  function zrobMiejsce(): void {
    while (wedlugNadawcy.size >= MAKSIMUM_NADAWCOW) {
      const najdawniejSlyszany = wedlugNadawcy.keys().next();
      if (najdawniejSlyszany.done) return;
      wedlugNadawcy.delete(najdawniejSlyszany.value);
    }
  }

  return {
    przyjmij(nadawca) {
      const teraz = czas();
      const proby = wOknie(nadawca, teraz);

      if (proby.length >= MAKSIMUM_NA_OKNO) return false;

      // Removed before being re-added, so this sender goes to the back of the
      // queue and is not the one evicted to make room for themselves.
      wedlugNadawcy.delete(nadawca);
      zrobMiejsce();
      wedlugNadawcy.set(nadawca, [...proby, teraz]);
      return true;
    },
  };
}
