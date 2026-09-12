import { Resend } from "resend";

import {
  type InquiryEmail,
  type InquiryMailer,
  inquiryMailer,
  type Transport,
} from "@/lib/zapytanie/mailer";

/**
 * The application boundary: where the port stops being an interface and starts
 * being Resend.
 *
 * Nothing above this file knows that Resend exists, and nothing in it decides
 * what an inquiry says — this only answers "who takes the mail, and where does
 * it go".
 */

/**
 * Who the inquiry appears to be from.
 *
 * Resend will only send from a domain that has been verified in the account,
 * so this cannot simply be the visitor's own address — that is what `Reply-To`
 * is for. The default is Resend's shared sender, which works from a fresh
 * account with nothing configured; the custom domain replaces it here once it
 * is verified, without touching anything else.
 */
const NADAWCA_DOMYSLNY = "Twoja Dekoracja <onboarding@resend.dev>";

/**
 * Where an inquiry goes when the environment has not said.
 *
 * Only ever reached outside a deployment — see `resolveInquiryMailer` — where
 * nothing is actually sent and the address exists so the composed email has
 * something to be addressed to.
 */
const ODBIORCA_ZASTEPCZY = "kontakt@localhost";

/**
 * A transport that writes the inquiry to the log instead of sending it.
 *
 * This exists for `next dev` and for the end-to-end suite, which drives the
 * real route handler against a real form and must not need an API key or a
 * network to do it. Reporting success is correct there: the inquiry did reach
 * everything this application is responsible for.
 *
 * It is emphatically not correct in production, which is why reaching for it
 * is a build error there rather than a quiet fallback — see below.
 */
const transportDoKonsoli: Transport = async (email: InquiryEmail) => {
  console.info(
    [
      "[zapytanie] RESEND_API_KEY nie jest ustawiony - nic nie zostało wysłane.",
      `Do: ${email.to}`,
      `Odpowiedz do: ${email.replyTo ?? "-"}`,
      `Temat: ${email.subject}`,
      email.text,
    ].join("\n"),
  );
}

function transportPrzezResend(apiKey: string): Transport {
  const resend = new Resend(apiKey);

  return async (email: InquiryEmail) => {
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? NADAWCA_DOMYSLNY,
      to: email.to,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
    });

    /*
     * Resend reports a refused send in the result rather than by throwing, so
     * a handler that only caught exceptions would confirm to the visitor that
     * their inquiry was sent while the owner's inbox stayed empty — the one
     * failure this site cannot afford. Rethrown so the port sees a failure.
     */
    if (error) throw new Error(`${error.name}: ${error.message}`);
  };
}

/**
 * The mailer this deployment actually has.
 *
 * Resolved per request rather than at module load so that a missing key is a
 * fault reported by the submission that needed it, not a page that fails to
 * render.
 *
 * A misconfiguration that is harmless locally is catastrophic in a deployment,
 * and it is invisible from the outside — the form would keep saying "wysłane"
 * to every visitor while no inquiry ever arrived. So in a deployment it throws
 * and the visitor is shown the delivery failure with the phone number, which
 * is a bad day rather than a silent one.
 *
 * This is the second line of defence. The first is in `next.config.ts`, which
 * refuses to build production without the configuration at all — by the time
 * this throws, somebody has already tried to get in touch and failed.
 *
 * "In a deployment" means `process.env.VERCEL`, which is where the README says
 * this site is hosted. On any other production host the check would not fire
 * and inquiries would be written to a log while the form reported success —
 * worth knowing before this moves.
 */
export function resolveInquiryMailer(): InquiryMailer {
  const apiKey = process.env.RESEND_API_KEY;
  const odbiorca = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !odbiorca) {
    if (process.env.VERCEL) {
      throw new Error(
        "Wysyłka zapytań nie jest skonfigurowana - ustaw RESEND_API_KEY i CONTACT_TO_EMAIL.",
      );
    }
    return inquiryMailer(odbiorca ?? ODBIORCA_ZASTEPCZY, transportDoKonsoli);
  }

  return inquiryMailer(odbiorca, transportPrzezResend(apiKey));
}
