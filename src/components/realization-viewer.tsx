"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useLayoutEffect, useRef } from "react";

import { Glif } from "@/components/ui/channel-icons";
import type { Fotografia } from "@content/realizacje";

import { useSwipe } from "./use-swipe";

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
 * scrolled, dragged by `useSwipe` like the gallery's stage. A vertical drag
 * moves and fades the photograph instead, and closes the viewer past a
 * threshold, the way phone galleries are dismissed. Every photograph stays
 * mounted, so one left mid-download keeps downloading.
 *
 * Which photograph is shown belongs to the gallery, so closing leaves the
 * stage on the photograph the visitor ended on. Every way out calls `onClose`,
 * which goes through history (`useViewerHistory`).
 */
export function RealizationViewer({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: readonly Fotografia[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const przyciskZamknij = useRef<HTMLButtonElement>(null);

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

  function przejdzO(krok: number) {
    onIndexChange(Math.min(Math.max(index + krok, 0), photos.length - 1));
  }

  const {
    offset: przesuniecie,
    handlers: uchwytyDotyku,
    justDragged: wlasniePrzeciagniety,
  } = useSwipe({
    index,
    count: photos.length,
    onStep: przejdzO,
    onDismiss: onClose,
  });

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

  function zamknijEscapem(zdarzenie: React.SyntheticEvent) {
    // The dialog would close itself and skip history.
    zdarzenie.preventDefault();
    onClose();
  }

  function zamknijPoza(zdarzenie: React.MouseEvent) {
    if (wlasniePrzeciagniety()) return;
    if (zdarzenie.target !== zdarzenie.currentTarget) return;
    onClose();
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
      {...uchwytyDotyku}
      className="m-0 h-dvh max-h-none w-screen max-w-none touch-none overflow-hidden bg-plum-950 p-0 text-blush-300 backdrop:bg-plum-950"
    >
      <div
        style={{
          transform: `translate(calc(${-index * 100}% + ${przesuniecieX}px), ${przesuniecieY}px)`,
          opacity: 1 - Math.min(Math.abs(przesuniecieY) / 400, 0.6),
        }}
        className={`flex h-full w-full ${
          przesuniecie
            ? ""
            : "transition-[transform,opacity] duration-300 ease-out"
        }`}
      >
        {photos.map(function zdjecie(photo, indeks) {
          const jestAktualne = indeks === index;

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
        className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] flex min-h-11 items-center px-4 text-sm tracking-[0.25em]"
      >
        {index + 1} / {photos.length}
      </p>

      <button
        ref={przyciskZamknij}
        type="button"
        onClick={onClose}
        className={`absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] ${PRZYCISK}`}
      >
        <span className="sr-only">Zamknij</span>
        <Kreska d="M6 6l12 12M18 6 6 18" />
      </button>

      <button
        type="button"
        disabled={index === 0}
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
        disabled={index === photos.length - 1}
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

export const KROK_KLAWISZA: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

// Over a photograph on a phone, so a translucent plum ground keeps the glyph
// legible on a white tablecloth as well as on a dark wall. The outline is
// reset because Safari rings a focused button even after a tap, and the viewer
// focuses its close button on open. `outline-none` also zeroes Tailwind's
// outline-style variable, so the keyboard ring has to restore it; it is drawn
// inside because the arrows touch the screen's edge.
export const PRZYCISK =
  "flex size-11 items-center justify-center bg-plum-950/60 text-2xl text-blush-300 outline-none transition-colors hover:text-blush-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-blush-300 disabled:cursor-not-allowed disabled:opacity-30";

export function Kreska({ d }: { d: string }) {
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
