import { handleZapytanie } from "@/lib/zapytanie/handler";
import { resolveInquiryMailer } from "@/lib/zapytanie/resend-mailer";

/**
 * The site's only server endpoint.
 *
 * It does one thing the handler cannot do for itself: decide which mailer is
 * real. Everything about what happens to a submission lives in
 * `handleZapytanie`, where it can be driven without a network.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    return await handleZapytanie(request, resolveInquiryMailer());
  } catch (blad) {
    // A deployment that cannot send mail throws while resolving the mailer.
    // The visitor gets the delivery failure, which offers the phone number —
    // an unhandled 500 would show them a blank error with no way forward.
    console.error("Nie udało się przyjąć zapytania:", blad);
    return Response.json({ status: "niedostarczone" }, { status: 502 });
  }
}
