import { site } from "@/lib/site";

/**
 * The questions a visitor asks before they are willing to write, and the
 * answers.
 *
 * Content, not layout — the same reason `content/hero` exists. Two pages show
 * these: `/faq` shows all of them, and the home page shows three as the last
 * thing before the contact band. They are held here rather than on either page
 * because the two must not answer the same question differently; a visitor who
 * reads a lead time on the home page and a different one on `/faq` has been
 * given a reason to doubt everything else on the site.
 *
 * The business facts inside the answers come from `site` for the same reason.
 * The service area in an answer here and the service area in the footer are
 * one fact, and a visitor who spots them disagreeing believes neither.
 *
 * PLACEHOLDER COPY. The questions are the ones the design spec names — price,
 * lead time, service area, setup and takedown, and what a first conversation
 * looks like — and the answers are plausible rather than confirmed. They are
 * deliberately non-committal about anything the business would be held to: no
 * figures, no fixed lead time, no promise about travel distance. The client
 * confirms or rewrites every one of them before launch.
 *
 * Two things are not placeholder and must survive any rewrite. Nothing here
 * says *faktura* or mentions VAT: the business is działalność nierejestrowana
 * and issues a *rachunek*, so invoice language would be a claim about a legal
 * status it does not have. And no answer promises a price.
 */

/**
 * One question, with the answer visible beside it.
 *
 * Never a question on its own. A bare list of questions is what a visitor
 * scrolls past and what Google reads as nothing — the answer is the whole
 * value of the page, and `FAQPage` structured data has nowhere to put a
 * question without one.
 */
export interface Pytanie {
  /**
   * Stable, lowercase ASCII: the anchor under `/faq`, and how another page
   * names a question it wants to show. Chosen by what the question is about,
   * not by its wording, so rewriting the question does not break a link the
   * owner has already sent someone.
   */
  id: string;
  pytanie: string;
  /** One paragraph. Two if the question genuinely has two halves. */
  odpowiedz: string;
}

/**
 * Every question, in the order `/faq` asks them.
 *
 * Ordered by what a hesitant visitor wants to know first rather than by
 * subject: whether this is plausibly affordable, whether they are already too
 * late, and whether the venue is even in range. The reassurances about how the
 * day itself works come after, because nobody reads them until the first three
 * have gone well.
 */
export const pytania: readonly Pytanie[] = [
  {
    id: "cena",
    pytanie: "Ile kosztuje dekoracja?",
    odpowiedz:
      "Wycena zależy od wielkości sali, liczby stołów i tego, ile elementów dekoracji się na nie składa - inaczej wygląda sama ścianka za tortem, inaczej oprawa całego wesela. Po opisie przyjęcia podajemy widełki, a po ustaleniu szczegółów konkretną kwotę, i nie zmienia się ona później bez Waszej zgody.",
  },
  {
    id: "termin",
    pytanie: "Z jakim wyprzedzeniem rezerwować termin?",
    odpowiedz:
      "Terminy weselne w sezonie rozchodzą się z dużym wyprzedzeniem, przy mniejszych przyjęciach bywa, że wystarczy kilka tygodni. Najprościej napisać z datą - odpowiemy, czy jest jeszcze wolna, zanim zaczniemy rozmawiać o czymkolwiek innym.",
  },
  {
    id: "obszar",
    pytanie: "Gdzie pracujecie?",
    odpowiedz: `${site.city} i okolice. Przy większych realizacjach dojeżdżamy również dalej, więc dalszy adres nie przekreśla rozmowy - napiszcie, gdzie jest sala, a odpowiemy wprost.`,
  },
  {
    id: "pierwsza-rozmowa",
    pytanie: "Jak wygląda pierwsza rozmowa?",
    odpowiedz:
      "Pytamy o datę, miejsce i to, jak wyobrażacie sobie salę - czasem wystarczy kilka zdjęć, które Wam się podobają. Z tego powstaje propozycja dekoracji i wycena. Rozmowa do niczego nie zobowiązuje i nic nie jest ustalone, dopóki obie strony tego nie potwierdzą.",
  },
  {
    id: "montaz",
    pytanie: "Czy zajmujecie się montażem i demontażem dekoracji?",
    odpowiedz:
      "Tak. Przywozimy dekorację, składamy ją przed przyjęciem i zabieramy po nim, bez angażowania gości ani obsługi sali. Termin wejścia na salę ustalamy wcześniej z jej właścicielem, żeby nie kolidował z Waszym harmonogramem.",
  },
  {
    id: "zakres",
    pytanie: "Co dokładnie obejmuje dekoracja?",
    odpowiedz:
      "Najczęściej: dekorację stołu pary młodej lub jubilata, stołów gości, ścianki fotograficznej i wejścia na salę. Ceremonia w plenerze albo w kościele, strefa tortu czy oprawa świec to osobne elementy, które można dołożyć lub pominąć - mówimy wprost, co jest w wycenie, a co nie.",
  },
  {
    id: "rezerwacja",
    pytanie: "Jak rezerwuje się termin?",
    odpowiedz:
      "Termin blokujemy po ustaleniu zakresu dekoracji i wpłacie zaliczki; do tego momentu data jest wolna dla wszystkich, także dla Was. Resztę rozliczamy po przyjęciu.",
  },
  {
    id: "rozliczenie",
    pytanie: "Jak wygląda rozliczenie?",
    odpowiedz:
      "Na całość otrzymujecie pisemne potwierdzenie zapłaty - rachunek. Ustalona kwota jest kwotą końcową: nie dochodzą do niej dojazd ani demontaż, o ile nie zmienia się zakres dekoracji.",
  },
  {
    id: "zmiany",
    pytanie: "Co, jeśli trzeba przełożyć albo odwołać przyjęcie?",
    odpowiedz:
      "Napiszcie albo zadzwońcie od razu, jak tylko będzie wiadomo. Przy przełożeniu w pierwszej kolejności sprawdzamy, czy nowy termin jest wolny. Zasady odwołania ustalamy na piśmie przy rezerwacji, żeby żadna ze stron nie dowiadywała się o nich w najgorszym możliwym momencie.",
  },
];

/**
 * The named questions, in the order they were named.
 *
 * For a page that shows some of the FAQ rather than all of it. Selecting by id
 * rather than by position keeps the two orders independent: `/faq` is ordered
 * for someone reading the whole page, and a teaser picks the three that earn
 * their place where it sits.
 *
 * An unknown id throws rather than being skipped, because the failure it
 * guards against is silent — a question renamed here would quietly leave a
 * hole in another page, and nothing about the rendered result would look
 * wrong. The registry's integrity checks fail loudly for the same reason.
 */
export function wybranePytania(...ids: readonly string[]): readonly Pytanie[] {
  return ids.map((id) => {
    const pozycja = pytania.find((kandydat) => kandydat.id === id);
    if (!pozycja) {
      throw new Error(`W FAQ nie ma pytania o identyfikatorze "${id}".`);
    }
    return pozycja;
  });
}
