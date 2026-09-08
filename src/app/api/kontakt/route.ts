import {
  handleZapytanie,
  odpowiedzNiedostarczone,
} from "@/lib/zapytanie/handler";
import { limitZapytan } from "@/lib/zapytanie/limit";
import { resolveInquiryMailer } from "@/lib/zapytanie/resend-mailer";

/**
 * The counts, kept at module scope so they outlive the request.
 *
 * This is the whole of "held in process memory": one map per running instance,
 * for as long as that instance is warm. A deployment that scales out gives a
 * sender one allowance per instance they reach, and a redeploy forgets
 * everyone — both accepted when this control was chosen over a firewall rule
 * or a data store, on the grounds that a flood still loses most of its volume
 * and no genuine visitor ever meets the ceiling.
 */
const limit = limitZapytan();

/**
 * The site's only server endpoint.
 *
 * It does the two things the handler cannot do for itself: decide which mailer
 * is real, and hold the one limiter that has to survive between requests.
 * Everything about what happens to a submission lives in `handleZapytanie`,
 * where it can be driven without a network and without waiting out an hour.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    return await handleZapytanie(request, resolveInquiryMailer(), limit);
  } catch (blad) {
    // A deployment that cannot send mail throws while resolving the mailer.
    // The visitor gets the delivery failure, which offers the phone number —
    // an unhandled 500 would show them a blank error with no way forward.
    console.error("Nie udało się przyjąć zapytania:", blad);
    return odpowiedzNiedostarczone();
  }
}
