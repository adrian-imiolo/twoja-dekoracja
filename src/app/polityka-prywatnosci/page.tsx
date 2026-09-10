import type { Metadata } from "next";
import Link from "next/link";

import { CalloutPanel } from "@/components/ui/callout-panel";
import { sharePreview } from "@/lib/metadata";
import { DO_UZUPELNIENIA, site } from "@/lib/site";

/**
 * The document RODO obliges the site to publish, because the contact form
 * collects personal data from people in the EU.
 *
 * Its route, layout, footer link and structure are real from the first
 * release; the copy is not finished, and says so on the page. Every gap is
 * marked `[DO UZUPEŁNIENIA]` — the same marker `site` uses for the business
 * facts it does not know yet — so the outstanding items are visible to the
 * client reading a preview rather than buried in a comment only a developer
 * would find.
 *
 * What is written out is what the code actually does, taken from
 * `src/lib/zapytanie`: the five fields the form collects, the mailer that
 * carries them, and the host that serves the page. Those are not placeholders
 * and must be corrected here if the form or the delivery path changes — a
 * privacy policy that describes a different system than the one running is
 * worse than a short one, because it is a statement of fact the business has
 * published about itself.
 *
 * What is left as a marker is what only the client can answer: who they are,
 * where data requests reach them, and how long they keep an inquiry. The whole
 * document needs their review before launch regardless — nothing here is legal
 * advice, and none of it has been through a lawyer.
 *
 * The controller is a person, not a company. The business is działalność
 * nierejestrowana: it has no NIP, no REGON and no legal entity to name, and
 * RODO does not care — the controller is whoever decides what happens to the
 * data, which here is simply the individual running the business.
 */

const OPIS = `Jakie dane zbiera formularz kontaktowy ${site.name}, po co, na jakiej podstawie i jak zażądać ich usunięcia.`;

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: OPIS,
  ...sharePreview({
    path: "/polityka-prywatnosci",
    title: `Polityka prywatności — ${site.name}`,
    description: OPIS,
  }),
};

/**
 * A heading and its paragraphs, so the document reads as one rhythm rather
 * than as a page assembled from separately styled blocks. Prose is `ReactNode`
 * because several sections need a list or a link inside them.
 */
function Sekcja({
  id,
  tytul,
  children,
}: {
  id: string;
  tytul: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="font-display text-2xl leading-snug text-blush-200">
        {tytul}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-cream-50/80">
        {children}
      </div>
    </section>
  );
}

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="page-shell py-20 sm:py-28">
      <article className="max-w-3xl">
        <h1 className="font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
          Polityka prywatności
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-cream-50/85">{OPIS}</p>
        <p className="mt-4 text-sm text-cream-50/60">
          Ostatnia aktualizacja: {DO_UZUPELNIENIA}
        </p>

        {/*
         * Stated on the page rather than only in the repository. A visitor who
         * reads an unfinished policy and is not told it is unfinished has been
         * misled about the one document whose whole purpose is not to mislead
         * them.
         *
         * It says the whole document is a draft, not only that some fragments
         * are missing. The rest of the text names RODO articles and processors
         * with the confidence of a finished policy, and it was written from
         * what the code does rather than by a lawyer — a reader has no way to
         * tell those two kinds of sentence apart, so the notice covers both.
         */}
        <CalloutPanel
          as="p"
          className="mt-10 px-6 py-5 text-sm leading-relaxed text-cream-50/75"
        >
          <strong>To jest wersja robocza dokumentu.</strong> Fragmenty oznaczone{" "}
          <strong>{DO_UZUPELNIENIA}</strong> czekają na dane osoby prowadzącej
          pracownię, a pozostała treść wymaga jej potwierdzenia. Do czasu
          uzupełnienia w sprawach dotyczących danych osobowych prosimy o kontakt
          przez{" "}
          <Link
            href="/kontakt"
            className="text-blush-200 underline underline-offset-4 transition-colors hover:text-blush-100"
          >
            formularz kontaktowy
          </Link>
          .
        </CalloutPanel>

        <Sekcja id="administrator" tytul="Kto administruje danymi">
          <p>
            Administratorem danych osobowych jest {site.owner}, osoba fizyczna
            prowadząca pracownię dekoracji {site.name} w {site.cityLocative} w
            ramach działalności nierejestrowanej. Nie jest to spółka ani
            zarejestrowana firma, dlatego nie podajemy numerów NIP ani REGON —
            nie zostały nadane.
          </p>
          <p>
            Kontakt w sprawach danych osobowych: {site.email}, tel. {site.phone}
            , adres korespondencyjny {DO_UZUPELNIENIA}.
          </p>
        </Sekcja>

        <Sekcja id="zakres" tytul="Jakie dane zbieramy">
          <p>
            Wyłącznie to, co zostanie wpisane w formularz kontaktowy, i nic
            poza tym:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li>imię,</li>
            <li>adres e-mail albo numer telefonu — ten, który zostawicie,</li>
            <li>rodzaj uroczystości,</li>
            <li>przybliżony termin,</li>
            <li>treść wiadomości.</li>
          </ul>
          <p>
            Formularz nie prosi o adres, nazwisko ani dane, których nie
            potrzebujemy, żeby odpowiedzieć. Jeżeli w treści wiadomości znajdą
            się dodatkowe informacje, przetwarzamy je wyłącznie po to, żeby
            odpisać.
          </p>
          <p>
            Niezależnie od formularza dostawca hostingu zapisuje w logach
            serwera techniczne dane połączenia, w tym adres IP. Służą one
            wyłącznie utrzymaniu serwisu i jego bezpieczeństwu.
          </p>
        </Sekcja>

        <Sekcja id="cel" tytul="Po co i na jakiej podstawie">
          <p>
            Dane z formularza służą jednemu celowi: odpowiedzeniu na zapytanie i
            ustaleniu, czy i na jakich warunkach możemy przygotować dekorację.
          </p>
          <p>
            Podstawą prawną jest art. 6 ust. 1 lit. b RODO — podjęcie działań na
            żądanie osoby, której dane dotyczą, przed zawarciem umowy — oraz
            art. 6 ust. 1 lit. f RODO, czyli nasz prawnie uzasadniony interes
            polegający na prowadzeniu korespondencji i na ewentualnym ustaleniu
            lub dochodzeniu roszczeń.
          </p>
          <p>
            Podanie danych jest dobrowolne, ale bez adresu e-mail albo numeru
            telefonu nie mamy jak odpowiedzieć.
          </p>
        </Sekcja>

        <Sekcja id="odbiorcy" tytul="Komu je powierzamy">
          <p>
            Nie sprzedajemy danych i nie przekazujemy ich nikomu w celach
            marketingowych. Korzystamy z dwóch usług, które z technicznego
            punktu widzenia mają z nimi styczność:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>Resend</strong> — dostarcza wiadomość z formularza na
              skrzynkę pracowni,
            </li>
            <li>
              <strong>Vercel</strong> — utrzymuje serwis i obsługuje ruch na
              stronie.
            </li>
          </ul>
          <p>
            Obaj dostawcy działają jako podmioty przetwarzające, na podstawie
            umów powierzenia, i mogą przetwarzać dane poza Europejskim Obszarem
            Gospodarczym w oparciu o standardowe klauzule umowne zatwierdzone
            przez Komisję Europejską.
          </p>
        </Sekcja>

        <Sekcja id="okres" tytul="Jak długo je przechowujemy">
          <p>
            Korespondencja z zapytaniem pozostaje na skrzynce pocztowej
            pracowni przez {DO_UZUPELNIENIA} od ostatniego kontaktu, po czym
            jest usuwana. Jeżeli z zapytania wyniknie współpraca, dane związane
            z realizacją przechowujemy przez okres wymagany przepisami —
            {DO_UZUPELNIENIA}.
          </p>
        </Sekcja>

        <Sekcja id="prawa" tytul="Wasze prawa">
          <p>W każdej chwili możecie:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>uzyskać dostęp do swoich danych i ich kopię,</li>
            <li>sprostować dane nieprawidłowe,</li>
            <li>żądać ich usunięcia,</li>
            <li>żądać ograniczenia przetwarzania,</li>
            <li>
              wnieść sprzeciw wobec przetwarzania opartego na prawnie
              uzasadnionym interesie,
            </li>
            <li>przenieść dane do innego administratora.</li>
          </ul>
          <p>
            Przysługuje Wam także skarga do Prezesa Urzędu Ochrony Danych
            Osobowych, ul. Stawki 2, 00-193 Warszawa.
          </p>
        </Sekcja>

        <Sekcja id="usuniecie" tytul="Jak zażądać usunięcia danych">
          <p>
            Wystarczy jedna wiadomość na {site.email} albo telefon pod{" "}
            {site.phone} z informacją, że dane mają zostać usunięte. Nie trzeba
            tego uzasadniać ani wypełniać żadnego wniosku.
          </p>
          <p>
            Usuwamy korespondencję najpóźniej w ciągu miesiąca od zgłoszenia i
            potwierdzamy to w odpowiedzi. Jeżeli jakieś dane musimy zachować
            dłużej — na przykład dlatego, że wiążą się z rozliczeniem już
            wykonanej dekoracji — napiszemy wprost, które to dane i do kiedy.
          </p>
        </Sekcja>

        <Sekcja id="cookies" tytul="Cookies i statystyki">
          <p>
            Serwis nie zapisuje własnych plików cookies, nie profiluje
            odwiedzających i nie śledzi ich na innych stronach. Dlatego nie
            wyświetlamy okna zgody na cookies — nie ma na co jej wyrażać.
          </p>
          {/*
           * Vercel Web Analytics is in scope for the first release and lands
           * with its own change. It is cookieless and stores no personal data,
           * so the paragraph above survives it; what this section gains at that
           * point is one sentence naming it as the source of the page-view
           * statistics.
           */}
          <p>
            Statystyki odwiedzin, jeśli je zbieramy, są zbiorcze i anonimowe —
            nie pozwalają ustalić, kto odwiedził stronę.
          </p>
        </Sekcja>

        <Sekcja id="zmiany" tytul="Zmiany polityki">
          <p>
            Jeżeli zmieni się to, jakie dane zbieramy albo komu je powierzamy,
            zaktualizujemy ten dokument i zmienimy datę na jego początku.
          </p>
        </Sekcja>
      </article>
    </div>
  );
}
