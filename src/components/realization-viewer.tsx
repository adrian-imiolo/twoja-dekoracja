"use client";

import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Glif } from "@/components/ui/channel-icons";
import type { Fotografia } from "@content/realizacje";

/**
 * A realization's photographs, full screen, one at a time.
 *
 * A native modal `<dialog>`: Escape, focus containment and an inert page come
 * from the element, which is why this is not a library. It is mounted only
 * while open and shown on mount, never kept closed in the DOM: a closed dialog
 * is `display: none`, and its buttons would fail the responsive pass's check
 * that every control on a page can be seen.
 *
 * Every photograph is rendered and all but the current one hidden, rather than
 * swapping a single image: a photograph left mid-download keeps downloading
 * instead of being cancelled, and one already seen comes back instantly.
 *
 * Closing always goes through history. Opening pushed a same-URL entry (the
 * gallery does that, on the click), so the phone's back gesture closes the
 * viewer instead of leaving the page, and every other way out calls
 * `history.back()` and lets that one `popstate` do the closing.
 */
export function RealizationViewer({
  photos,
  startIndex,
  onClose,
}: {
  photos: readonly Fotografia[];
  startIndex: number;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const przyciskZamknij = useRef<HTMLButtonElement>(null);
  const poczatekDotyku = useRef<number | null>(null);

  const [aktualne, setAktualne] = useState(startIndex);

  useLayoutEffect(function pokaz() {
    const element = dialog.current;
    if (!element) return;

    element.showModal();
    przyciskZamknij.current?.focus();

    // `showModal()` makes the page inert but does not stop it scrolling
    // under the viewer.
    const poprzedniOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return function schowaj() {
      document.body.style.overflow = poprzedniOverflow;
      element.close();
    };
  }, []);

  const zamknij = useEffectEvent(onClose);

  useEffect(function zamykajPrzyCofnieciu() {
    window.addEventListener("popstate", zamknij);
    return function przestanNasluchiwac() {
      window.removeEventListener("popstate", zamknij);
    };
  }, []);

  function cofnij() {
    history.back();
  }

  function przejdzO(krok: number) {
    setAktualne(function nowe(poprzednie) {
      return Math.min(Math.max(poprzednie + krok, 0), photos.length - 1);
    });
  }

  /*
   * On the window rather than the dialog: when "next" becomes disabled on the
   * last photograph it drops focus out of the dialog, and the arrow keys
   * would stop working exactly where the visitor is most likely to press
   * "previous".
   */
  const naKlawisz = useEffectEvent(function naKlawisz(
    zdarzenie: KeyboardEvent,
  ) {
    const krok = KROK_KLAWISZA[zdarzenie.key];
    if (krok === undefined) return;
    zdarzenie.preventDefault();
    przejdzO(krok);
  });

  useEffect(function nawigujStrzalkami() {
    window.addEventListener("keydown", naKlawisz);
    return function przestanNasluchiwac() {
      window.removeEventListener("keydown", naKlawisz);
    };
  }, []);

  function zapamietajDotyk(zdarzenie: React.TouchEvent) {
    poczatekDotyku.current = zdarzenie.touches[0]?.clientX ?? null;
  }

  function przesunPalcem(zdarzenie: React.TouchEvent) {
    const start = poczatekDotyku.current;
    const koniec = zdarzenie.changedTouches[0]?.clientX;
    poczatekDotyku.current = null;
    if (start === null || koniec === undefined) return;

    const przesuniecie = koniec - start;
    if (Math.abs(przesuniecie) < PROG_MACHNIECIA) return;
    przejdzO(przesuniecie < 0 ? 1 : -1);
  }

  function zamknijEscapem(zdarzenie: React.SyntheticEvent) {
    // The dialog would close itself and skip history; let `popstate` do it.
    zdarzenie.preventDefault();
    cofnij();
  }

  function zamknijPoza(zdarzenie: React.MouseEvent) {
    if (zdarzenie.target !== zdarzenie.currentTarget) return;
    cofnij();
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Zdjęcia realizacji"
      onCancel={zamknijEscapem}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-plum-950/95 p-0 text-blush-300 backdrop:bg-plum-950"
    >
      <div
        onClick={zamknijPoza}
        onTouchStart={zapamietajDotyk}
        onTouchEnd={przesunPalcem}
        className="flex h-full w-full items-center justify-center px-0 py-12 sm:px-16"
      >
        {photos.map(function zdjecie(photo, indeks) {
          return (
            <Image
              key={photo.image.src}
              src={photo.image}
              alt={photo.alt}
              placeholder="blur"
              sizes="100vw"
              className={`h-auto max-h-full w-auto max-w-full ${
                indeks === aktualne ? "" : "hidden"
              }`}
            />
          );
        })}
      </div>

      <p
        aria-live="polite"
        className="absolute top-0 left-0 flex min-h-11 items-center px-4 text-sm tracking-[0.25em]"
      >
        {aktualne + 1} / {photos.length}
      </p>

      <button
        ref={przyciskZamknij}
        type="button"
        onClick={cofnij}
        className={`absolute top-0 right-0 ${PRZYCISK}`}
      >
        <span className="sr-only">Zamknij</span>
        <Kreska d="M6 6l12 12M18 6 6 18" />
      </button>

      <button
        type="button"
        disabled={aktualne === 0}
        onClick={function poprzednie() {
          przejdzO(-1);
        }}
        className={`absolute top-1/2 left-0 -translate-y-1/2 ${PRZYCISK}`}
      >
        <span className="sr-only">Poprzednie zdjęcie</span>
        <Kreska d="M15 5l-7 7 7 7" />
      </button>

      <button
        type="button"
        disabled={aktualne === photos.length - 1}
        onClick={function nastepne() {
          przejdzO(1);
        }}
        className={`absolute top-1/2 right-0 -translate-y-1/2 ${PRZYCISK}`}
      >
        <span className="sr-only">Następne zdjęcie</span>
        <Kreska d="M9 5l7 7-7 7" />
      </button>
    </dialog>
  );
}

const KROK_KLAWISZA: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

/** Horizontal travel, in pixels, that counts as a swipe rather than a tap. */
const PROG_MACHNIECIA = 50;

// Over a photograph on a phone, so a translucent plum ground keeps the glyph
// legible on a white tablecloth as well as on a dark wall.
const PRZYCISK =
  "flex size-11 items-center justify-center bg-plum-950/60 text-2xl text-blush-300 transition-colors hover:text-blush-100 disabled:cursor-not-allowed disabled:opacity-30";

function Kreska({ d }: { d: string }) {
  return (
    <Glif>
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Glif>
  );
}
