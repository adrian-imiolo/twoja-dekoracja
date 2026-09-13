import { z } from "zod";

import {
  bledyPol,
  type BledyPol,
  zapytanieSchema,
} from "@/lib/zapytanie/schema";
import type { LimitZapytan } from "@/lib/zapytanie/limit";
import type { InquiryMailer } from "@/lib/zapytanie/mailer";

/**
 * The only server code in the project, kept out of `route.ts` so it can be
 * driven directly.
 *
 * The route file's job is to decide which mailer is real; this file's job is
 * what happens to a submission. Splitting them lets the delivery flow be
 * tested with a recorder behind the port instead of by sending mail, and that
 * test is why the port exists.
 */

/**
 * What the form is told, and the only vocabulary it branches on.
 *
 * Three outcomes rather than a bare status code, because the form says
 * something different for each: a confirmation, errors under the fields, or an
 * apology carrying the phone number. This must never produce a fourth state
 * in which nothing happened.
 */
export type OdpowiedzNaZapytanie =
  | { status: "wyslane" }
  | { status: "niepoprawne"; bledy: BledyPol }
  | { status: "niedostarczone" };

/**
 * How long a person needs before a filled-in form can be genuine.
 *
 * Five fields, one of them prose. Nobody does that in three seconds; a script
 * posting a canned payload does it in none. The timestamp comes from the
 * browser and could be forged by anyone who looked, so this is only a speed
 * bump, and it costs as little: no state, no service, and nothing for the
 * visitor who is typing.
 *
 * Exported because the end-to-end suite has to wait it out: Playwright fills
 * the form faster than any person, and a test that did not know this number
 * would watch the confirmation appear over a discarded submission.
 */
export const MINIMALNY_CZAS_MS = 3_000;

/**
 * The two things a submission carries that the visitor never typed.
 *
 * Kept beside the inquiry rather than inside `zapytanieSchema`, because they
 * are not part of what the visitor tells us; the payload is the five fields
 * and nothing more. Typed and exported all the same, so the names the form
 * sends and the names this file reads are one decision: the schema's own
 * promise, that a rule here cannot go missing from the form, would otherwise
 * not cover the two fields most easily broken by a rename.
 */
export const sygnalyAntybotSchema = z.object({
  /**
   * When the browser says the form became fillable, in epoch milliseconds.
   *
   * Required: a submission without it cannot be measured against the time
   * threshold, and letting it through unmeasured is how the threshold is
   * bypassed by not sending the field.
   */
  otwarto: z.number().finite(),
  /**
   * The field no visitor can see. Anything in it was typed by a script.
   *
   * Optional, unlike `otwarto`, because absence is not evidence: the trap
   * catches what is *in* it. Demanding it would mean that a form which one day
   * stops rendering the trap silently swallows every genuine inquiry, and
   * catches no extra scripts in exchange.
   */
  witryna: z.string().default(""),
});

export type SygnalyAntybot = z.infer<typeof sygnalyAntybotSchema>;

function odpowiedz(status: number, tresc: OdpowiedzNaZapytanie): Response {
  return Response.json(tresc, { status });
}

/**
 * Discards the submission and tells the sender it went through.
 *
 * The two abuse controls that drop a submission answer in the same words a
 * delivered inquiry gets, so that a script cannot learn from the reply which
 * one caught it. That makes these the only paths that say "wysłane" with
 * nothing sent, and the log line is the owner's sole way of finding out. So
 * discarding and logging are one function rather than two statements a third
 * control could one day half-copy.
 *
 * The reason is passed as the whole sentence, not a fragment: these lines are
 * grepped for in `vercel logs`, and composing them from a template would have
 * quietly reworded the one already in use.
 */
function odrzucCicho(powod: string): Response {
  console.info(`[zapytanie] ${powod}`);
  return odpowiedz(200, { status: "wyslane" });
}

/**
 * The answer given when an inquiry could not be delivered.
 *
 * Exported so that `route.ts`, which fails this way when it cannot even build
 * a mailer, answers in the same words rather than in a second literal that no
 * type checks against `OdpowiedzNaZapytanie`.
 */
export function odpowiedzNiedostarczone(): Response {
  return odpowiedz(502, { status: "niedostarczone" });
}

/**
 * Whether the submission came from something that is not reading the page.
 *
 * Both signals are checked together because they answer the same question and
 * get the same treatment: the submission is dropped and the sender is told it
 * went through. Saying otherwise would tell whoever is probing which field
 * gives them away.
 */
function wyslaneMaszynowo(payload: Record<string, unknown>): boolean {
  const sygnaly = sygnalyAntybotSchema.safeParse(payload);
  // Absent or malformed signals mean the submission did not come from this
  // form, which is the same answer as tripping either of them.
  if (!sygnaly.success) return true;

  if (sygnaly.data.witryna.trim() !== "") return true;

  return Date.now() - sygnaly.data.otwarto < MINIMALNY_CZAS_MS;
}

/**
 * Who sent this, as far as the platform is willing to say.
 *
 * `x-real-ip` and nothing else. Vercel sets it to the address that connected;
 * `x-forwarded-for` is a chain whose left-hand entries the client writes, so
 * falling back to it would meter a value any sender can rotate at will.
 *
 * Null rather than a stand-in when the header is absent, matching the
 * honeypot's rule that absence is not evidence: one shared allowance for every
 * unnamed visitor would silence the site the moment a proxy stopped setting
 * the header. A deployment that does not set it therefore has no rate limit
 * at all (ADR 0001).
 */
function nadawca(request: Request): string | null {
  return request.headers.get("x-real-ip")?.trim() || null;
}

async function odczytajPayload(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return null;
    }
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleZapytanie(
  request: Request,
  mailer: InquiryMailer,
  limit: LimitZapytan,
): Promise<Response> {
  const payload = await odczytajPayload(request);
  // Not something the form can produce, so there is no field to blame and
  // nothing useful to say about it.
  if (!payload) return odpowiedz(400, { status: "niepoprawne", bledy: {} });

  /*
   * A person who happened to trip this (an autofilled hidden field, a clock
   * that disagrees) gets a confirmation for an inquiry nobody will ever read.
   */
  if (wyslaneMaszynowo(payload)) {
    return odrzucCicho("Zgłoszenie odrzucone jako maszynowe.");
  }

  const wynik = zapytanieSchema.safeParse(payload);
  if (!wynik.success) {
    return odpowiedz(400, {
      status: "niepoprawne",
      bledy: bledyPol(wynik.error),
    });
  }

  /*
   * Counted after validation, because what is being rationed is inquiries in
   * the owner's inbox, not requests at the endpoint. A visitor who mistypes
   * their number five times is trying to reach someone, and a limiter that
   * counted those attempts would go on to swallow the corrected sixth, the
   * only one of the six carrying a number the owner can call back.
   */
  const kto = nadawca(request);
  if (kto !== null && !limit.przyjmij(kto)) {
    return odrzucCicho("Zgłoszenie odrzucone: limit nadawcy.");
  }

  const doreczenie = await mailer.send(wynik.data);
  if (!doreczenie.ok) {
    // Logged rather than returned: the visitor can do nothing with a provider's
    // error string, and the owner needs it in the deployment's logs to find out
    // why their inbox went quiet.
    console.error("Nie udało się wysłać zapytania:", doreczenie.reason);
    return odpowiedzNiedostarczone();
  }

  return odpowiedz(200, { status: "wyslane" });
}
