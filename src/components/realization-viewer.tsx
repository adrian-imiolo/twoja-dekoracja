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
 * The photographs sit side by side on a track that is translated rather than
 * scrolled. A finger drags the track directly, so a swipe shows the next
 * photograph coming in, and letting go animates to whichever photograph the
 * drag settled on; the arrows and keys get the same slide for free. A
 * vertical drag moves and fades the photograph instead, and closes the viewer
 * past a threshold, the way phone galleries are dismissed. Every photograph
 * stays mounted, so one left mid-download keeps downloading.
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
  const dotyk = useRef<Dotyk | null>(null);
  /** Set by a drag so the click the browser may fire after it does not close. */
  const bylPrzeciagniety = useRef(false);

  const [aktualne, setAktualne] = useState(startIndex);
  const [przesuniecie, setPrzesuniecie] = useState<Przesuniecie | null>(null);

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

  function zacznijDotyk(zdarzenie: React.TouchEvent) {
    const palec = zdarzenie.touches[0];
    if (!palec || zdarzenie.touches.length > 1) return;
    dotyk.current = {
      x: palec.clientX,
      y: palec.clientY,
      os: null,
      ostatnie: { x: 0, y: 0 },
    };
    bylPrzeciagniety.current = false;
  }

  function przeciagnij(zdarzenie: React.TouchEvent) {
    const start = dotyk.current;
    const palec = zdarzenie.touches[0];
    if (!start || !palec) return;

    const x = palec.clientX - start.x;
    const y = palec.clientY - start.y;

    // The axis is decided once, by the first clear movement, so a swipe that
    // wobbles does not start closing and a drag down does not change photos.
    if (start.os === null) {
      if (Math.max(Math.abs(x), Math.abs(y)) < PROG_OSI) return;
      start.os = Math.abs(x) >= Math.abs(y) ? "x" : "y";
      bylPrzeciagniety.current = true;
    }

    // Past the first or last photograph the track gives, but reluctantly.
    const naKrancu =
      (aktualne === 0 && x > 0) || (aktualne === photos.length - 1 && x < 0);
    const nowe =
      start.os === "y" ? { x: 0, y } : { x: naKrancu ? x / 3 : x, y: 0 };

    // Kept on the ref as well as in state: a quick flick can end before the
    // last move has rendered, and the release would read a stale distance.
    start.ostatnie = nowe;
    setPrzesuniecie(nowe);
  }

  function pusc() {
    const start = dotyk.current;
    dotyk.current = null;
    setPrzesuniecie(null);
    if (!start?.os) return;
    const koniec = start.ostatnie;

    if (start.os === "y") {
      if (Math.abs(koniec.y) >= PROG_ZAMKNIECIA) cofnij();
      return;
    }

    if (Math.abs(koniec.x) < PROG_MACHNIECIA) return;
    przejdzO(koniec.x < 0 ? 1 : -1);
  }

  function zamknijEscapem(zdarzenie: React.SyntheticEvent) {
    // The dialog would close itself and skip history; let `popstate` do it.
    zdarzenie.preventDefault();
    cofnij();
  }

  function zamknijPoza(zdarzenie: React.MouseEvent) {
    if (bylPrzeciagniety.current) return;
    if (zdarzenie.target !== zdarzenie.currentTarget) return;
    cofnij();
  }

  const przesuniecieX = przesuniecie?.x ?? 0;
  const przesuniecieY = przesuniecie?.y ?? 0;

  return (
    <dialog
      ref={dialog}
      aria-label="Zdjęcia realizacji"
      onCancel={zamknijEscapem}
      // On the dialog, not the track: the track is translated off its own box,
      // so a touch between slides would miss it.
      onTouchStart={zacznijDotyk}
      onTouchMove={przeciagnij}
      onTouchEnd={pusc}
      onTouchCancel={pusc}
      className="m-0 h-dvh max-h-none w-screen max-w-none touch-none overflow-hidden bg-plum-950 p-0 text-blush-300 backdrop:bg-plum-950"
    >
      <div
        style={{
          transform: `translate(calc(${-aktualne * 100}% + ${przesuniecieX}px), ${przesuniecieY}px)`,
          opacity: 1 - Math.min(Math.abs(przesuniecieY) / 400, 0.6),
        }}
        className={`flex h-full w-full ${
          przesuniecie
            ? ""
            : "transition-[transform,opacity] duration-300 ease-out"
        }`}
      >
        {photos.map(function zdjecie(photo, indeks) {
          const jestAktualne = indeks === aktualne;

          return (
            <div
              key={photo.image.src}
              onClick={zamknijPoza}
              aria-hidden={!jestAktualne}
              className="flex h-full w-full shrink-0 items-center justify-center px-0 py-12 sm:px-16"
            >
              <Image
                src={photo.image}
                alt={photo.alt}
                placeholder="blur"
                sizes="100vw"
                draggable={false}
                className="h-auto max-h-full w-auto max-w-full select-none"
              />
            </div>
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

type Przesuniecie = { x: number; y: number };
type Dotyk = {
  x: number;
  y: number;
  os: "x" | "y" | null;
  ostatnie: Przesuniecie;
};

const KROK_KLAWISZA: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

/** Movement, in pixels, before a touch commits to a direction. */
const PROG_OSI = 10;
/** Horizontal travel, in pixels, that changes the photograph. */
const PROG_MACHNIECIA = 50;
/** Vertical travel, in pixels, that closes the viewer. */
const PROG_ZAMKNIECIA = 100;

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
