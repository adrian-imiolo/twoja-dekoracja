import {
  etykietaTypu,
  type Zapytanie,
  wygladaJakEmail,
} from "@/lib/zapytanie/schema";

/**
 * The one place this application reaches outside itself.
 *
 * Everything else here is a static page built at deploy time; sending mail is
 * the only thing that can fail because something beyond the process failed.
 * That is why it is the one interface introduced purely so it can be replaced
 * in a test: the flow the whole site exists to produce is otherwise only
 * checkable by sending real mail to a real inbox and going to look.
 */

/** A composed inquiry, ready for whatever actually puts mail on the wire. */
export interface InquiryEmail {
  to: string;
  /** Absent when the visitor left a phone number rather than an address. */
  replyTo?: string;
  subject: string;
  text: string;
}

/**
 * Whether the inquiry reached the outside world.
 *
 * Reported rather than thrown, because a delivery failure is an outcome this
 * application has something to say about — the form has to offer the phone
 * number instead — and not an exception in the sense of something unforeseen.
 */
export type Delivery = { ok: true } | { ok: false; reason: string };

/** What the port needs from a transport: take this email, or say why not. */
export type Transport = (email: InquiryEmail) => Promise<void>;

/**
 * The port: hand it a validated inquiry, learn whether it got out.
 *
 * It accepts the inquiry rather than an already-composed email so that
 * addressing, subject and body are decided in one place — see
 * `inquiryMailer` — instead of at each call site.
 */
export interface InquiryMailer {
  send(zapytanie: Zapytanie): Promise<Delivery>;
}

/**
 * How an inquiry reads in the owner's inbox.
 *
 * Plain text on purpose. This is mail from one person to one person; HTML buys
 * nothing here and costs deliverability, and the owner reads it on a phone.
 */
export function composeInquiryEmail(
  zapytanie: Zapytanie,
  to: string,
): InquiryEmail {
  const typ = etykietaTypu(zapytanie.typWydarzenia);

  return {
    to,
    /*
     * Set only for an address, because a `Reply-To` holding a phone number
     * makes every reply bounce — worse than no reply-to at all, which at least
     * leaves the owner looking at the body for a way to answer.
     */
    replyTo: wygladaJakEmail(zapytanie.kontakt) ? zapytanie.kontakt : undefined,
    /*
     * Event, date, name — in the order the owner decides with. The inbox list
     * truncates, so the two facts that settle "can I take this?" come before
     * the one that is in the body anyway.
     */
    subject: `Zapytanie: ${typ}, ${zapytanie.termin} - ${zapytanie.imie}`,
    text: [
      `Imię: ${zapytanie.imie}`,
      `Kontakt: ${zapytanie.kontakt}`,
      `Rodzaj uroczystości: ${typ}`,
      `Termin: ${zapytanie.termin}`,
      "",
      "Wiadomość:",
      zapytanie.wiadomosc,
    ].join("\n"),
  };
}

/**
 * A mailer that composes the inquiry and hands it to a transport.
 *
 * The recipient and the transport are arguments rather than things this module
 * reads for itself, which is what keeps the composition testable: the test
 * substitutes a recorder for the transport and asserts against the same email
 * the Resend implementation would have sent, instead of against its own idea
 * of one.
 */
export function inquiryMailer(to: string, transport: Transport): InquiryMailer {
  return {
    async send(zapytanie) {
      try {
        await transport(composeInquiryEmail(zapytanie, to));
        return { ok: true };
      } catch (blad) {
        return {
          ok: false,
          reason: blad instanceof Error ? blad.message : String(blad),
        };
      }
    },
  };
}
