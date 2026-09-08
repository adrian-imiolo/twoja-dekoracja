import { z } from "zod";

/**
 * What a visitor tells us before we can answer them, and nothing else.
 *
 * The whole schema lives here rather than beside the route handler because the
 * browser validates against this exact object too. One definition means a rule
 * the server enforces cannot go missing from the form, and — the part that
 * actually bites — the message the visitor reads under a field is the message
 * the server would have produced, so a form that looks satisfied can never be
 * rejected on submit with different wording.
 *
 * Every message is written to be read by the person who tripped it, in Polish,
 * saying what to do rather than what went wrong.
 */

/**
 * The kinds of event this business decorates, in the order someone scanning a
 * dropdown meets them.
 *
 * The values the schema accepts and the options the select offers are built
 * from this one list: stated separately, an event type added to one would be
 * an event type missing from the other, and the failure would surface as a
 * form whose own dropdown is rejected by the server.
 */
const WARTOSCI_TYPOW = [
  "wesele",
  "urodziny",
  "chrzciny",
  "jubileusz",
  "inne",
] as const;

export type TypWydarzenia = (typeof WARTOSCI_TYPOW)[number];

/*
 * A total `Record` rather than a lookup through the list, so that the two are
 * kept in step by the type checker instead of at run time: an event type added
 * above without a label here does not compile, where a `find` would have
 * returned nothing and the subject line would have said "undefined".
 */
const ETYKIETY_TYPOW: Record<TypWydarzenia, string> = {
  wesele: "Wesele",
  urodziny: "Urodziny",
  chrzciny: "Chrzciny lub komunia",
  jubileusz: "Jubileusz lub rocznica",
  inne: "Inna uroczystość",
};

/** The dropdown's options: every accepted value, in the order it is offered. */
export const TYPY_WYDARZENIA = WARTOSCI_TYPOW.map((wartosc) => ({
  wartosc,
  etykieta: ETYKIETY_TYPOW[wartosc],
}));

/**
 * The human-readable name of an event type.
 *
 * The email subject line uses this rather than the stored value: the owner
 * triages by reading, and "jubileusz" in a subject line reads as a database
 * row rather than as a sentence.
 */
export function etykietaTypu(typ: TypWydarzenia): string {
  return ETYKIETY_TYPOW[typ];
}

/*
 * One field for either way of being reached, because asking for both makes an
 * inquiry feel like an application form, and asking for an email specifically
 * turns away the visitor who only ever uses their phone.
 *
 * The shapes below are deliberately generous. Their job is to catch the
 * typo — a missing "@", six digits instead of nine — not to decide whether an
 * address exists, which no regular expression can do and which the reply
 * itself will settle within the hour.
 */
const KSZTALT_EMAILA = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DOZWOLONE_W_NUMERZE = /^[+\d\s()-]+$/;
const MINIMUM_CYFR = 9;

/**
 * Whether a contact string is being offered as an address rather than a number.
 *
 * Decided by the "@" alone, so that a mistyped address is reported as a broken
 * address instead of being measured against the rules for a phone number and
 * rejected with advice about digits.
 */
export function wygladaJakEmail(kontakt: string): boolean {
  return kontakt.includes("@");
}

function jestNumerem(kontakt: string): boolean {
  if (!DOZWOLONE_W_NUMERZE.test(kontakt)) return false;
  return kontakt.replace(/\D/g, "").length >= MINIMUM_CYFR;
}

export const zapytanieSchema = z.object({
  imie: z
    .string()
    .trim()
    .min(2, "Podaj imię, żebyśmy wiedzieli, jak się zwracać.")
    .max(80, "To imię jest za długie — wystarczy samo imię."),

  kontakt: z
    .string()
    .trim()
    .min(1, "Zostaw e-mail albo numer telefonu, żebyśmy mogli odpisać.")
    .refine(
      (kontakt) =>
        wygladaJakEmail(kontakt)
          ? KSZTALT_EMAILA.test(kontakt)
          : jestNumerem(kontakt),
      "Sprawdź adres e-mail albo numer telefonu — nie możemy odpisać na ten wpis.",
    ),

  typWydarzenia: z.enum(WARTOSCI_TYPOW, {
    error: "Wybierz rodzaj uroczystości.",
  }),

  /*
   * Free text rather than a date picker, and the reason is in the label: the
   * date is approximate. A picker would demand a day from someone who has
   * settled on "lato 2027" and turn a two-minute inquiry into a decision they
   * came here to ask about.
   *
   * Required, because "czy ten termin jest wolny?" is the first thing the
   * owner has to answer, and a blank one costs both sides a round trip before
   * the conversation can start.
   */
  termin: z
    .string()
    .trim()
    .min(3, "Podaj przybliżony termin — wystarczy miesiąc albo pora roku.")
    .max(60, "Wystarczy sam termin, resztę opisz w wiadomości."),

  wiadomosc: z
    .string()
    .trim()
    .min(10, "Napisz kilka słów o przyjęciu — łatwiej nam wtedy odpowiedzieć.")
    .max(2000, "Ta wiadomość jest za długa — resztę opowiesz nam w rozmowie."),
});

/** A submission that has been through `zapytanieSchema` and survived. */
export type Zapytanie = z.infer<typeof zapytanieSchema>;

/** What the form shows under each field, keyed by the field it belongs to. */
export type BledyPol = Partial<Record<keyof Zapytanie, string>>;

/**
 * The first complaint per field, which is all a form has room to show.
 *
 * Zod reports every failure; a field can only display one line, and the first
 * is the one closest to what the visitor typed.
 */
export function bledyPol(blad: z.ZodError<Zapytanie>): BledyPol {
  const wedlugPola = z.flattenError(blad).fieldErrors;
  const bledy: BledyPol = {};
  for (const [pole, komunikaty] of Object.entries(wedlugPola)) {
    const pierwszy = komunikaty?.[0];
    if (pierwszy) bledy[pole as keyof Zapytanie] = pierwszy;
  }
  return bledy;
}
