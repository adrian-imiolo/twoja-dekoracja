import {
  bledyPol,
  type BledyPol,
  zapytanieSchema,
} from "@/lib/zapytanie/schema";
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
 */
const MINIMALNY_CZAS_MS = 3_000;

function odpowiedz(status: number, tresc: OdpowiedzNaZapytanie): Response {
  return Response.json(tresc, { status });
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
  // A field no visitor can see, so anything in it was typed by something
  // filling in every input it found.
  const przyneta = payload.witryna;
  if (typeof przyneta === "string" && przyneta.trim() !== "") return true;

  const otwarto = payload.otwarto;
  if (typeof otwarto !== "number" || !Number.isFinite(otwarto)) return true;

  return Date.now() - otwarto < MINIMALNY_CZAS_MS;
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
): Promise<Response> {
  const payload = await odczytajPayload(request);
  // Not something the form can produce, so there is no field to blame and
  // nothing useful to say about it.
  if (!payload) return odpowiedz(400, { status: "niepoprawne", bledy: {} });

  if (wyslaneMaszynowo(payload)) return odpowiedz(200, { status: "wyslane" });

  const wynik = zapytanieSchema.safeParse(payload);
  if (!wynik.success) {
    return odpowiedz(400, {
      status: "niepoprawne",
      bledy: bledyPol(wynik.error),
    });
  }

  const doreczenie = await mailer.send(wynik.data);
  if (!doreczenie.ok) {
    // Logged rather than returned: the visitor can do nothing with a provider's
    // error string, and the owner needs it in the deployment's logs to find out
    // why their inbox went quiet.
    console.error("Nie udało się wysłać zapytania:", doreczenie.powod);
    return odpowiedz(502, { status: "niedostarczone" });
  }

  return odpowiedz(200, { status: "wyslane" });
}
