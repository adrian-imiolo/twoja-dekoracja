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
 * The photographs sit in a snapping horizontal strip, so a swipe is the
 * browser's own scrolling and needs no gesture code. Zoom has two states, fit
 * and the source's own width, because past 1:1 there is nothing in the file
 * to show; panning a zoomed photograph is again plain scrolling, of the slide.
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
  const pasek = useRef<HTMLDivElement>(null);
  const przyciskZamknij = useRef<HTMLButtonElement>(null);

  const [aktualne, setAktualne] = useState(startIndex);
  const [powiekszone, setPowiekszone] = useState<number | null>(null);

  /** Where on the photograph the visitor clicked to zoom, as fractions. */
  const punktPowiekszenia = useRef({ x: 0.5, y: 0.5 });

  useLayoutEffect(
    function pokazNaZdjeciuStartowym() {
      const element = dialog.current;
      const strip = pasek.current;
      if (!element || !strip) return;

      element.showModal();
      // `showModal()` focuses the first control, which is the first slide's,
      // off screen whenever the viewer opens further along.
      przyciskZamknij.current?.focus();
      // Instant, not the strip's smooth scrolling: the viewer opens on the
      // photograph clicked rather than sliding past the ones before it.
      strip.scrollTo({
        left: startIndex * strip.clientWidth,
        behavior: "instant",
      });

      // `showModal()` makes the page inert but does not stop it scrolling
      // under the viewer.
      const poprzedniOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return function schowaj() {
        document.body.style.overflow = poprzedniOverflow;
        element.close();
      };
    },
    [startIndex],
  );

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

  function przejdzDo(indeks: number) {
    const strip = pasek.current;
    if (!strip || indeks < 0 || indeks >= photos.length) return;

    setPowiekszone(null);
    // No `behavior`: the strip's CSS makes this smooth, and the reduced-motion
    // rule in globals.css makes it a jump, with no check here.
    strip.scrollTo({ left: indeks * strip.clientWidth });
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
    przejdzDo(aktualne + krok);
  });

  useEffect(function nawigujStrzalkami() {
    window.addEventListener("keydown", naKlawisz);
    return function przestanNasluchiwac() {
      window.removeEventListener("keydown", naKlawisz);
    };
  }, []);

  function sledzAktualne() {
    const strip = pasek.current;
    if (!strip || strip.clientWidth === 0) return;

    const indeks = Math.round(strip.scrollLeft / strip.clientWidth);
    if (indeks === aktualne) return;

    setAktualne(indeks);
    // A zoomed photograph swiped out of view comes back fitted.
    setPowiekszone(null);
  }

  function zamknijEscapem(zdarzenie: React.SyntheticEvent) {
    // The dialog would close itself and skip history; let `popstate` do it.
    zdarzenie.preventDefault();
    cofnij();
  }

  function przelaczPowiekszenie(indeks: number, zdarzenie: React.MouseEvent) {
    if (powiekszone === indeks) {
      setPowiekszone(null);
      return;
    }

    const obszar = zdarzenie.currentTarget.getBoundingClientRect();
    punktPowiekszenia.current = {
      x: (zdarzenie.clientX - obszar.left) / obszar.width,
      y: (zdarzenie.clientY - obszar.top) / obszar.height,
    };
    setPowiekszone(indeks);
  }

  /*
   * A zoomed photograph opens on the spot that was clicked rather than at its
   * top-left corner, which on a portrait is usually ceiling.
   */
  useLayoutEffect(
    function przewinDoPunktuPowiekszenia() {
      if (powiekszone === null) return;
      const slajd = pasek.current?.children[powiekszone];
      if (!(slajd instanceof HTMLElement)) return;

      const { x, y } = punktPowiekszenia.current;
      slajd.scrollTo({
        left: x * slajd.scrollWidth - slajd.clientWidth / 2,
        top: y * slajd.scrollHeight - slajd.clientHeight / 2,
        behavior: "instant",
      });
    },
    [powiekszone],
  );

  function zamknijPoza(zdarzenie: React.MouseEvent) {
    if (zdarzenie.target !== zdarzenie.currentTarget) return;
    cofnij();
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Zdjęcia realizacji"
      onCancel={zamknijEscapem}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-plum-950 p-0 text-blush-300 backdrop:bg-plum-950"
    >
      <div
        ref={pasek}
        onScroll={sledzAktualne}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
      >
        {photos.map(function slajd(photo, indeks) {
          const zoomed = powiekszone === indeks;

          return (
            <div
              key={photo.image.src}
              data-testid="slajd"
              onClick={zamknijPoza}
              className={`h-full w-full shrink-0 snap-center snap-always overflow-auto ${
                zoomed
                  ? "block overscroll-contain"
                  : "flex items-center justify-center"
              }`}
            >
              <button
                type="button"
                aria-label={zoomed ? "Pomniejsz" : "Powiększ"}
                onClick={function przelacz(zdarzenie) {
                  przelaczPowiekszenie(indeks, zdarzenie);
                }}
                className={`block ${zoomed ? "mx-auto w-fit cursor-zoom-out" : "cursor-zoom-in"}`}
              >
                <Image
                  src={photo.image}
                  alt={photo.alt}
                  placeholder="blur"
                  sizes="100vw"
                  style={
                    zoomed ? { width: `${photo.image.width}px` } : undefined
                  }
                  className={
                    zoomed
                      ? "h-auto max-w-none"
                      : "h-auto max-h-dvh w-auto max-w-screen"
                  }
                />
              </button>
            </div>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className="absolute top-0 left-0 flex min-h-11 items-center bg-plum-950/60 px-4 text-sm tracking-[0.25em]"
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
          przejdzDo(aktualne - 1);
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
          przejdzDo(aktualne + 1);
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

// Over a photograph, so a translucent plum ground keeps the glyph legible on
// a white tablecloth as well as on a dark wall.
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
