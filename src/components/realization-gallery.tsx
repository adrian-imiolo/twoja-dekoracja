"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Fotografia } from "@content/realizacje";

import {
  KROK_KLAWISZA,
  Kreska,
  PRZYCISK,
  RealizationViewer,
} from "./realization-viewer";
import { useSwipe } from "./use-swipe";
import { useViewerHistory } from "./use-viewer-history";

/**
 * The gallery of one realization: one large photograph on a stage, and a
 * thumbnail of every photograph below it.
 *
 * Not a column and not a grid. A realization holds two to five photographs,
 * and a column of three full-width photographs is a long scroll that never
 * reads as one set, while a grid leaves orphans in its last row at four and
 * five. A stage shows the work large at once, and the thumbnails show the
 * whole set at a glance, at any count.
 *
 * The stage is a fixed frame each photograph is fitted into, not the
 * photograph's own shape: a set mixes portraits and landscapes, and a frame
 * that followed them would make the page jump in height on every swipe.
 *
 * Tapping the stage opens `RealizationViewer` at the same photograph, for
 * seeing it whole on a phone, where a portrait fitted into an inline frame is
 * small. Both show the one index held here, so closing the viewer leaves the
 * stage on the photograph the visitor ended on.
 */
export function RealizationGallery({
  photos,
}: {
  photos: readonly Fotografia[];
}) {
  const [aktualne, setAktualne] = useState(0);
  const podglad = useViewerHistory();
  const scena = useRef<HTMLButtonElement>(null);
  const bylaOtwarta = useRef(false);

  const jestWiele = photos.length > 1;

  function przejdzO(krok: number) {
    setAktualne(function nowe(poprzednie) {
      return Math.min(Math.max(poprzednie + krok, 0), photos.length - 1);
    });
  }

  const {
    offset: przesuniecie,
    handlers: uchwytyDotyku,
    justDragged: wlasniePrzeciagniety,
  } = useSwipe({ index: aktualne, count: photos.length, onStep: przejdzO });

  function otworz() {
    if (wlasniePrzeciagniety()) return;
    bylaOtwarta.current = true;
    podglad.open();
  }

  // Focus goes back once the viewer is gone; while it is open the page is
  // inert and the stage would refuse it.
  useEffect(
    function oddajFocus() {
      if (podglad.isOpen || !bylaOtwarta.current) return;
      scena.current?.focus();
      bylaOtwarta.current = false;
    },
    [podglad.isOpen],
  );

  /*
   * An arrow that reaches the end disables itself and drops focus out of the
   * gallery, and the arrow keys would stop working exactly where the visitor
   * is most likely to press "previous". The stage takes focus instead.
   */
  function przejdzStrzalka(krok: number) {
    const nowe = aktualne + krok;
    przejdzO(krok);
    if (nowe === 0 || nowe === photos.length - 1) scena.current?.focus();
  }

  function naKlawisz(zdarzenie: React.KeyboardEvent) {
    const krok = KROK_KLAWISZA[zdarzenie.key];
    if (krok === undefined) return;
    zdarzenie.preventDefault();
    przejdzO(krok);
  }

  return (
    <>
      <section
        aria-label="Galeria"
        onKeyDown={jestWiele ? naKlawisz : undefined}
        className="mx-auto mt-16 max-w-5xl sm:mt-24"
      >
        <div className="relative">
          <div
            {...uchwytyDotyku}
            // The page still scrolls under a vertical drag; only a sideways
            // one is the gallery's.
            className="touch-pan-y overflow-hidden"
          >
            <button
              ref={scena}
              type="button"
              onClick={otworz}
              className="group relative block aspect-4/5 w-full cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-blush-300 sm:aspect-3/2"
            >
              <div
                style={{
                  transform: `translateX(calc(${-aktualne * 100}% + ${przesuniecie?.x ?? 0}px))`,
                }}
                className={`flex h-full w-full ${
                  przesuniecie
                    ? ""
                    : "transition-transform duration-300 ease-out"
                }`}
              >
                {photos.map(function slajd(photo, indeks) {
                  return (
                    <div
                      key={photo.image.src}
                      aria-hidden={indeks !== aktualne}
                      className="relative h-full w-full shrink-0"
                    >
                      <Image
                        src={photo.image}
                        alt={photo.alt}
                        placeholder="blur"
                        fill
                        // The first photograph is the page's largest
                        // contentful paint.
                        preload={indeks === 0}
                        sizes="(min-width: 64rem) 64rem, 100vw"
                        draggable={false}
                        className="object-contain select-none"
                      />
                    </div>
                  );
                })}
              </div>
              {/*
               * A phone has no hover and no cursor, so without a mark
               * nothing says the stage opens. Decoration only: the current
               * photograph's alt already names the button.
               */}
              <span
                aria-hidden="true"
                className="absolute right-3 bottom-3 z-10 flex size-10 items-center justify-center bg-plum-950/60 text-xl text-blush-300 transition-colors group-hover:text-blush-100"
              >
                <Kreska d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" />
              </span>
            </button>
          </div>

          {jestWiele ? (
            <>
              <button
                type="button"
                disabled={aktualne === 0}
                onClick={function poprzednie() {
                  przejdzStrzalka(-1);
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
                  przejdzStrzalka(1);
                }}
                className={`absolute top-1/2 right-0 -translate-y-1/2 ${PRZYCISK}`}
              >
                <span className="sr-only">Następne zdjęcie</span>
                <Kreska d="M9 5l7 7-7 7" />
              </button>
            </>
          ) : null}
        </div>

        {jestWiele ? (
          // Wraps rather than scrolls if a realization ever outgrows the row:
          // a scrolling strip would hide the very set it is there to show.
          <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-6 sm:gap-3">
            {photos.map(function miniatura(photo, indeks) {
              const jestAktualne = indeks === aktualne;

              return (
                <li key={photo.image.src}>
                  <button
                    type="button"
                    aria-label={photo.alt}
                    aria-current={jestAktualne}
                    onClick={function pokazTo() {
                      setAktualne(indeks);
                    }}
                    className={`relative block size-14 overflow-hidden outline-none transition-opacity focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-blush-300 sm:size-20 ${
                      jestAktualne
                        ? "opacity-100 ring-2 ring-blush-300"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={photo.image}
                      alt=""
                      placeholder="blur"
                      fill
                      sizes="5rem"
                      className="object-cover"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {/*
       * Outside the section: the viewer's arrow keys are its own, and a key
       * pressed inside it must not bubble into the stage's and step twice.
       */}
      {podglad.isOpen ? (
        <RealizationViewer
          photos={photos}
          index={aktualne}
          onIndexChange={setAktualne}
          onClose={podglad.close}
        />
      ) : null}
    </>
  );
}
