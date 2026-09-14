"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Glif } from "@/components/ui/channel-icons";
import type { Fotografia } from "@content/realizacje";

import { RealizationViewer } from "./realization-viewer";

/**
 * The gallery of one realization.
 *
 * A single column of large photographs rather than a grid. Some realizations
 * have five photographs and some twenty-five, and a grid breaks at the sparse
 * end: three across leaves two survivors stranded in the last row, and the page
 * reads as unfinished at the volume the archive launched with. A sequence has
 * no last row, so five photographs read as an edit and twenty-five read as a
 * long one.
 *
 * Width follows the photograph's own shape instead of a fixed frame: a
 * portrait shown as wide as a landscape becomes taller than the viewport and
 * cannot be seen whole. Both the shape and the reserved space come from the
 * intrinsic dimensions the build reads out of the static import, so nothing
 * here is a hand-maintained number and nothing shifts as an image arrives.
 *
 * Each photograph opens `RealizationViewer` over the column for detail and for
 * moving through the set. The column stays: it shows the work with no click,
 * and a viewer adds what it lacks without stranding a two-photograph
 * realization in a strip of two.
 */
export function RealizationGallery({
  photos,
}: {
  photos: readonly Fotografia[];
}) {
  const [otwarte, setOtwarte] = useState<number | null>(null);
  const przyciski = useRef<(HTMLButtonElement | null)[]>([]);
  const otwierajacy = useRef<number | null>(null);

  function otworz(indeks: number) {
    otwierajacy.current = indeks;
    /*
     * Pushed here, on the click, rather than when the viewer mounts: an effect
     * runs twice under Strict Mode and would leave two entries, one of them a
     * back press that does nothing. Same URL, so the realization stays the
     * page that is linked and shared, and a shared link never opens a viewer.
     */
    history.pushState({ viewer: true }, "");
    setOtwarte(indeks);
  }

  function zamknij() {
    setOtwarte(null);
  }

  // Focus goes back once the viewer is gone; while it is open the page is
  // inert and the button would refuse it.
  useEffect(
    function oddajFocus() {
      if (otwarte !== null || otwierajacy.current === null) return;
      przyciski.current[otwierajacy.current]?.focus();
      otwierajacy.current = null;
    },
    [otwarte],
  );

  return (
    <div className="mt-16 flex flex-col gap-16 sm:mt-24 sm:gap-24">
      {photos.map(function fotografia(photo, index) {
        const isLandscape = photo.image.width >= photo.image.height;

        return (
          <figure
            key={photo.image.src}
            className={`mx-auto w-full ${isLandscape ? "max-w-5xl" : "max-w-2xl"}`}
          >
            <button
              ref={function zapamietaj(przycisk) {
                przyciski.current[index] = przycisk;
              }}
              type="button"
              onClick={function otworzTo() {
                otworz(index);
              }}
              className="group relative block w-full cursor-zoom-in"
            >
              {/*
               * A phone has no hover and no zoom cursor, so without a mark
               * nothing says a photograph opens. Decoration only: the image's
               * alt already names the button.
               */}
              <span
                aria-hidden="true"
                className="absolute right-3 bottom-3 z-10 flex size-10 items-center justify-center bg-plum-950/60 text-xl text-blush-300 transition-colors group-hover:text-blush-100"
              >
                <Glif>
                  <path
                    d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Glif>
              </span>
              <Image
                src={photo.image}
                alt={photo.alt}
                placeholder="blur"
                // The first photograph is the page's largest contentful paint;
                // the rest are below the fold and load as the visitor reaches
                // them.
                priority={index === 0}
                sizes={
                  isLandscape
                    ? "(min-width: 64rem) 64rem, 100vw"
                    : "(min-width: 42rem) 42rem, 100vw"
                }
                className="h-auto w-full"
              />
            </button>
          </figure>
        );
      })}

      {otwarte === null ? null : (
        <RealizationViewer
          photos={photos}
          startIndex={otwarte}
          onClose={zamknij}
        />
      )}
    </div>
  );
}
