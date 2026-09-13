import Image from "next/image";

import type { Fotografia } from "@content/realizacje";

/**
 * The gallery of one realization.
 *
 * A single column of large photographs rather than a grid. Some realizations
 * have five photographs and some twenty-five, and a grid breaks at the sparse
 * end: three across leaves two survivors stranded in the last row, and the
 * page reads as unfinished at the volume the archive launched with. A sequence has no last row, so five photographs read as an edit and
 * twenty-five read as a long one.
 *
 * Width follows the photograph's own shape instead of a fixed frame: a
 * portrait shown as wide as a landscape becomes taller than the viewport and
 * cannot be seen whole. Both the shape and the reserved space come from the
 * intrinsic dimensions the build reads out of the static import, so nothing
 * here is a hand-maintained number and nothing shifts as an image arrives.
 */
export function RealizationGallery({
  photos,
}: {
  photos: readonly Fotografia[];
}) {
  return (
    <div className="mt-16 flex flex-col gap-16 sm:mt-24 sm:gap-24">
      {photos.map((photo, index) => {
        const isLandscape = photo.image.width >= photo.image.height;

        return (
          <figure
            key={photo.image.src}
            className={`mx-auto w-full ${isLandscape ? "max-w-5xl" : "max-w-2xl"}`}
          >
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
          </figure>
        );
      })}
    </div>
  );
}
