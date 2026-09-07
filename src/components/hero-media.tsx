import Image from "next/image";

import { HERO_POSTER_ID, HeroVideo } from "@/components/hero-video";
import { hero } from "@content/hero";

/**
 * The picture behind the home page's first screen.
 *
 * Built poster-first, which is an architectural decision rather than a stand-in
 * for the missing footage. The still is the hero element and the page's
 * largest-contentful-paint candidate; a video, when one exists, is a layer over
 * it. That ordering is what makes the client's footage a content change: the
 * frame, its height and everything sitting on top of it are already final, so
 * the video arrives into a hole that is exactly its own shape and the layout
 * does not move.
 *
 * The layer is held transparent until it has frames to show, and the poster
 * stays in the DOM underneath rather than being handed to the video as its
 * `poster` attribute — that would fetch the same photograph a second time,
 * unoptimised and at full size. A video that fails to load therefore degrades
 * to the still, silently and correctly.
 *
 * Absolutely positioned to fill whatever band it is placed in, so the hero's
 * height is decided by the copy over it rather than by the image's proportions.
 */
export function HeroMedia() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-plum-900">
      <Image
        // Named so the video layer can wait for this exact element to paint
        // before asking for any bandwidth of its own.
        id={HERO_POSTER_ID}
        src={hero.poster.image}
        alt={hero.poster.alt}
        placeholder="blur"
        /*
         * The one image on the site loaded ahead of everything else. It is the
         * first thing a visitor arriving from Google sees, and lazy-loading it
         * would mean measuring the page's speed against a blank rectangle.
         */
        priority
        fill
        // Full-bleed at every width, so the browser has no narrower candidate
        // to choose and no reason to guess.
        sizes="100vw"
        className="object-cover"
      />

      {hero.video ? <HeroVideo video={hero.video} /> : null}

      {/*
       * Photographs of decorated rooms are bright and busy, and white type
       * over one is unreadable in exactly the places the decoration is
       * prettiest. The scrim is heaviest where the copy sits and clears
       * towards the top, so the picture is still a picture.
       */}
      <div className="absolute inset-0 bg-gradient-to-t from-plum-950/95 via-plum-950/55 to-plum-950/15" />
    </div>
  );
}
