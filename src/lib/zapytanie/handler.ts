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
 * what happens to a submission. Splitting them is what lets the delivery flow
 * be tested with a recorder behind the port instead of by sending mail — the
 * whole reason the port exists.
 */

/**
 * What the form is told, and the only vocabulary it branches on.
 *
 * Three outcomes rather than a bare status code, because the form says
 * something different for each: a confirmation, errors under the fields, or an
 * apology carrying the phone number. A fourth state — nothing happened — is
 * the one thing this must never produce.
 */
export type OdpowiedzNaZapytanie =
  | { status: "wyslane" }
  | { status: "niepoprawne"; bledy: BledyPol }
  | { status: "niedostarczone" };

/**
 * How long a person needs before a filled-in form can be genuine.
 *
 * Five fields, one of them prose. Nobody does that in three seconds; a script
 * posting a canned payload does it in none. This is a speed bump rather than a
 * defence — the timestamp comes from the browser and could be forged by anyone
 * who looked — and it is priced accordingly: no state, no service, no cost to
 * the visitor who is actually typing.
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
 * are not part of what the visitor tells us — the payload is the five fields
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
   * bypassed by simply not sending the field.
   */
  otwarto: z.number().finite(),
  /**
   * The field no visitor can see. Anything in it was typed by a script.
   *
   * Optional, unlike `otwarto`, because absence is not evidence: the trap
   * catches what is *in* it. Demanding it would mean that a form which one day
   * stops rendering the trap silently swallows every genuine inquiry — the
   * failure this site can least afford, traded for nothing.
   */
  witryna: z.string().default(""),
});

export type SygnalyAntybot = z.infer<typeof sygnalyAntybotSchema>;

function odpowiedz(status: number, tresc: OdpowiedzNaZapytanie): Response {
  return Response.json(tresc, { status });
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
 * went through. Saying otherwise would tell whoever is probing exactly which
 * field gives them away.
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
 * `x-real-ip` first: Vercel sets it to the connecting address itself, where
 * `x-forwarded-for` is a chain whose left-hand entries the client wrote. Null
 * rather than a stand-in when neither is there, because every unnamed visitor
 * would otherwise share one allowance and the sixth of them would go unheard.
 */
function nadawca(request: Request): string | null {
  const realny = request.headers.get("x-real-ip")?.trim();
  if (realny) return realny;

  const przekazany = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return przekazany || null;
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

  if (wyslaneMaszynowo(payload)) {
    /*
     * Logged, because this is the one path that answers "wysłane" without
     * anything being sent. A person who happened to trip it — an autofilled
     * hidden field, a clock that disagrees — gets a confirmation for an
     * inquiry nobody will ever read, and the owner's only way of finding out
     * is this line.
     */
    console.info("[zapytanie] Zgłoszenie odrzucone jako maszynowe.");
    return odpowiedz(200, { status: "wyslane" });
  }

  const wynik = zapytanieSchema.safeParse(payload);
  if (!wynik.success) {
    return odpowiedz(400, {
      status: "niepoprawne",
      bledy: bledyPol(wynik.error),
    });
  }

  /*
   * Counted here rather than at the door, and the difference matters: what is
   * being rationed is inquiries in the owner's inbox, not requests at the
   * endpoint. A visitor who mistypes their number five times is trying to
   * reach someone, and a limiter that counted those attempts would go on to
   * swallow the corrected sixth — the one submission of the six that was
   * worth having.
   */
  const kto = nadawca(request);
  if (kto !== null && !limit.przyjmij(kto)) {
    // Answered like a delivered inquiry, for the same reason the honeypot is,
    // and logged for the same reason too: this is the second path that says
    // "wysłane" with nothing sent.
    console.info("[zapytanie] Zgłoszenie odrzucone: limit nadawcy.");
    return odpowiedz(200, { status: "wyslane" });
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
