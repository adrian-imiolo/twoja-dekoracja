"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { PrimaryCtaButton } from "@/components/ui/primary-cta";
import { imie, site, telHref } from "@/lib/site";
import type {
  OdpowiedzNaZapytanie,
  SygnalyAntybot,
} from "@/lib/zapytanie/handler";
import {
  type BledyPol,
  bledyPol,
  TYPY_WYDARZENIA,
  zapytanieSchema,
} from "@/lib/zapytanie/schema";

/**
 * The form the whole site exists to feed.
 *
 * It validates against `zapytanieSchema`, the same object the route handler
 * parses, so the sentence shown under a field here is the sentence the server
 * would have produced.
 *
 * Every path out of a submit ends in something the visitor can read; the
 * portfolio spec's "Contact submission" section says why.
 */

/**
 * What the form is doing, and therefore what the visitor is looking at.
 *
 * `wysylanie` is a state rather than a flag beside the others because it is
 * the one that has to disable the button. A second click on a form that is
 * working is how the owner receives the same inquiry three times.
 */
type Stan = "spoczynek" | "wysylanie" | "wyslane" | "niedostarczone";

const PUSTE = {
  imie: "",
  kontakt: "",
  typWydarzenia: "",
  termin: "",
  wiadomosc: "",
};

type Pola = typeof PUSTE;

const KLASA_POLA =
  "mt-2 w-full border border-plum-800 bg-plum-950 px-4 py-3 text-cream-50 placeholder:text-cream-50/35 focus-visible:border-blush-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-300";

const KLASA_ETYKIETY = "text-xs tracking-[0.25em] text-blush-300 uppercase";

export function InquiryForm() {
  const [pola, setPola] = useState<Pola>(PUSTE);
  const [bledy, setBledy] = useState<BledyPol>({});
  const [stan, setStan] = useState<Stan>("spoczynek");

  /*
   * When the form became fillable, sent along so the server can tell a person
   * typing from a script posting. A ref rather than state because reading it
   * must never be a reason to re-render, and it is set on mount rather than
   * during render so the statically generated page's build time is never what
   * ends up being measured.
   */
  const otwarto = useRef(0);
  useEffect(() => {
    otwarto.current = Date.now();
  }, []);

  // A field no visitor sees, so anything in it was typed by something filling
  // in every input it found on the page.
  const witryna = useRef<HTMLInputElement>(null);

  function zmien(pole: keyof Pola, wartosc: string) {
    setPola((poprzednie) => ({ ...poprzednie, [pole]: wartosc }));
    // The complaint goes as soon as the visitor acts on it, rather than
    // standing under a field they have already fixed until they submit again.
    setBledy((poprzednie) => {
      if (!poprzednie[pole]) return poprzednie;
      const nastepne = { ...poprzednie };
      delete nastepne[pole];
      return nastepne;
    });
  }

  async function wyslij(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stan === "wysylanie") return;

    /*
     * Parsed here first so an obvious mistake is answered without a round
     * trip, as a courtesy to the visitor. The route handler parses the same
     * schema regardless, and its answer is the one that counts.
     */
    const wynik = zapytanieSchema.safeParse(pola);
    if (!wynik.success) {
      setBledy(bledyPol(wynik.error));
      setStan("spoczynek");
      return;
    }

    setStan("wysylanie");
    setBledy({});

    const sygnaly: SygnalyAntybot = {
      otwarto: otwarto.current,
      witryna: witryna.current?.value ?? "",
    };

    try {
      const odpowiedz = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...wynik.data, ...sygnaly }),
      });

      const tresc = (await odpowiedz.json()) as OdpowiedzNaZapytanie;

      if (tresc.status === "niepoprawne") {
        setBledy(tresc.bledy);
        setStan("spoczynek");
        return;
      }

      if (tresc.status === "niedostarczone") {
        setStan("niedostarczone");
        return;
      }

      setStan("wyslane");
    } catch {
      // A dropped connection is indistinguishable from a refused send from
      // here, and the visitor needs the same thing either way: another way of
      // reaching us.
      setStan("niedostarczone");
    }
  }

  if (stan === "wyslane") return <Potwierdzenie />;

  return (
    <form noValidate onSubmit={wyslij} className="grid gap-6">
      <Pole
        pole="imie"
        etykieta="Imię"
        wartosc={pola.imie}
        blad={bledy.imie}
        onChange={zmien}
        autoComplete="given-name"
      />

      <Pole
        pole="kontakt"
        etykieta="E-mail albo telefon"
        wartosc={pola.kontakt}
        blad={bledy.kontakt}
        onChange={zmien}
        placeholder="anna@example.com albo 601 234 567"
      />

      <div>
        <label htmlFor="typWydarzenia" className={KLASA_ETYKIETY}>
          Rodzaj uroczystości
        </label>
        <select
          id="typWydarzenia"
          name="typWydarzenia"
          value={pola.typWydarzenia}
          onChange={(event) => zmien("typWydarzenia", event.target.value)}
          aria-invalid={Boolean(bledy.typWydarzenia)}
          aria-describedby={
            bledy.typWydarzenia ? "blad-typWydarzenia" : undefined
          }
          className={KLASA_POLA}
        >
          <option value="">Wybierz…</option>
          {TYPY_WYDARZENIA.map((typ) => (
            <option key={typ.wartosc} value={typ.wartosc}>
              {typ.etykieta}
            </option>
          ))}
        </select>
        <Blad pole="typWydarzenia" tresc={bledy.typWydarzenia} />
      </div>

      <Pole
        pole="termin"
        etykieta="Termin"
        wartosc={pola.termin}
        blad={bledy.termin}
        onChange={zmien}
        placeholder="np. sierpień 2027 albo lato przyszłego roku"
      />

      <div>
        <label htmlFor="wiadomosc" className={KLASA_ETYKIETY}>
          Wiadomość
        </label>
        <textarea
          id="wiadomosc"
          name="wiadomosc"
          rows={6}
          value={pola.wiadomosc}
          onChange={(event) => zmien("wiadomosc", event.target.value)}
          aria-invalid={Boolean(bledy.wiadomosc)}
          aria-describedby={bledy.wiadomosc ? "blad-wiadomosc" : undefined}
          placeholder="Gdzie odbywa się przyjęcie, ile osób, co chodzi Wam po głowie?"
          className={KLASA_POLA}
        />
        <Blad pole="wiadomosc" tresc={bledy.wiadomosc} />
      </div>

      {/*
       * Moved off-screen rather than hidden with `display: none`. Kept out
       * of the tab order and out of the accessibility tree, so nobody filling
       * the form by keyboard or by screen reader ever meets it.
       */}
      <input
        ref={witryna}
        type="text"
        name="witryna"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      <div className="mt-2 flex flex-wrap items-center gap-6">
        <PrimaryCtaButton type="submit" disabled={stan === "wysylanie"}>
          {stan === "wysylanie" ? "Wysyłanie…" : "Wyślij zapytanie"}
        </PrimaryCtaButton>

        {stan === "niedostarczone" && <Niepowodzenie />}
      </div>
    </form>
  );
}

function Potwierdzenie() {
  return (
    <div
      role="status"
      className="border border-blush-300 bg-plum-900 px-8 py-12 text-center"
    >
      <p className="font-display text-2xl text-blush-200 sm:text-3xl">
        Dziękujemy - wiadomość dotarła.
      </p>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-cream-50/80">
        Odpiszemy najszybciej, jak się da - zwykle tego samego albo następnego
        dnia. Nie trzeba wysyłać jej drugi raz.
      </p>
    </div>
  );
}

/**
 * What a visitor is given when the message did not get out.
 *
 * A number to dial, so the inquiry still reaches its destination. This is the
 * one place on the site where a contact detail is load-bearing in the moment it
 * is read: the visitor has already written the message once and has just been
 * told it went nowhere, and the next thing they do is either call or leave.
 *
 * Both numbers, named, for the same reason `ContactChannels` names them: a
 * visitor who has just hit a fault should not also have to guess which of two
 * strangers to ring.
 */
function Niepowodzenie() {
  return (
    <p role="alert" className="text-cream-50/85">
      Nie udało się wysłać wiadomości. Prosimy o telefon:{" "}
      {site.owners.map((wlascicielka, pozycja) => (
        <Fragment key={wlascicielka.phone}>
          {pozycja > 0 ? " lub " : ""}
          {imie(wlascicielka)}{" "}
          <a
            href={telHref(wlascicielka.phone)}
            className="text-blush-200 underline underline-offset-4"
          >
            {wlascicielka.phone}
          </a>
        </Fragment>
      ))}
      .
    </p>
  );
}

function Pole({
  pole,
  etykieta,
  wartosc,
  blad,
  onChange,
  ...atrybuty
}: {
  pole: keyof Pola;
  etykieta: string;
  wartosc: string;
  blad?: string;
  onChange: (pole: keyof Pola, wartosc: string) => void;
} & Pick<React.ComponentProps<"input">, "placeholder" | "autoComplete">) {
  return (
    <div>
      <label htmlFor={pole} className={KLASA_ETYKIETY}>
        {etykieta}
      </label>
      <input
        id={pole}
        name={pole}
        type="text"
        value={wartosc}
        onChange={(event) => onChange(pole, event.target.value)}
        aria-invalid={Boolean(blad)}
        aria-describedby={blad ? `blad-${pole}` : undefined}
        className={KLASA_POLA}
        {...atrybuty}
      />
      <Blad pole={pole} tresc={blad} />
    </div>
  );
}

function Blad({ pole, tresc }: { pole: keyof Pola; tresc?: string }) {
  if (!tresc) return null;

  return (
    <p id={`blad-${pole}`} className="mt-2 text-sm text-blush-300">
      {tresc}
    </p>
  );
}
