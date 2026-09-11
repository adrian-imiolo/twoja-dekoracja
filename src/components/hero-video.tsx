"use client";

import { useEffect, useState } from "react";

import type { HeroVideoSource } from "@content/hero";

/**
 * How the video finds the poster it is waiting for.
 *
 * A DOM id rather than a ref, because the poster is rendered on the server and
 * this is not — there is no ref to hand across that boundary, and making the
 * poster a client component to get one would put JavaScript in front of the
 * page's largest contentful paint to save the video some coupling.
 */
export const HERO_POSTER_ID = "hero-poster";

/**
 * The hero's footage, layered over the poster that is already on screen.
 *
 * Mounted only when `content/hero` carries a video. That file is the one place
 * that decides; this component assumes no answer and is correct either way,
 * which is what keeps adding or withdrawing footage a content edit.
 *
 * Two rules shape everything below, both from the design spec:
 *
 * **The video must never become the largest contentful paint.** The site's
 * whole acquisition channel is search, and the metric search grades this page
 * on is how fast its first screen appears. So nothing here is rendered — and
 * therefore nothing is requested — until the poster has painted. A video that
 * started downloading during the initial page load would compete with the
 * poster for the connection and make the number worse than it is with no video
 * at all.
 *
 * **A visitor who asked for less motion gets the poster and nothing else.**
 * Not a paused video, not a video that loads and sits still: no request at
 * all, because the point of the preference is not to be shown moving imagery
 * and there is no reason to spend their data on it either.
 */
export function HeroVideo({ video }: { video: HeroVideoSource }) {
  const [readyToLoad, setReadyToLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Read once, at mount. Someone flipping their system preference
    // mid-session is not a case worth a subscription here: the answer only
    // decides whether a background loop starts on a page they are already
    // looking at.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /*
     * The poster itself is the signal, rather than the window's `load` event.
     * `load` looks like the simpler gate and is wrong on the second visit: the
     * site's own header links back to `/`, and after that client-side
     * navigation `readyState` is already "complete" — left over from the
     * document the visitor arrived on — so a `load`-based gate would open
     * immediately and let the video race the poster it is supposed to be
     * waiting for. Asking the poster holds on both paths.
     */
    const poster = document.getElementById(HERO_POSTER_ID);
    if (!(poster instanceof HTMLImageElement)) return;

    let frame = 0;

    /*
     * Two frames, not one. A callback scheduled for the next frame runs
     * *before* that frame is painted, so arming there would put the video's
     * request in the same frame as the poster's first paint rather than after
     * it. The second frame is the one that means the poster is on screen.
     */
    function armAfterPosterIsPainted() {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setReadyToLoad(true));
      });
    }

    /*
     * `complete` covers both outcomes — the poster arrived, or it failed and
     * the browser has stopped spending a connection on it. Either way the
     * video is no longer competing with anything, and in the second case it is
     * the only thing left to show.
     */
    if (poster.complete) {
      armAfterPosterIsPainted();
    } else {
      poster.addEventListener("load", armAfterPosterIsPainted, { once: true });
      poster.addEventListener("error", armAfterPosterIsPainted, { once: true });
    }

    return () => {
      poster.removeEventListener("load", armAfterPosterIsPainted);
      poster.removeEventListener("error", armAfterPosterIsPainted);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!readyToLoad) return null;

  return (
    <video
      /*
       * `preload="none"` states the rule the element is under: this video is
       * never fetched merely for existing. `autoPlay` is what then starts the
       * fetch — and it is safe here precisely because the element does not
       * exist until the effect above has decided it may.
       *
       * `muted` is what makes autoplay permitted at all; `playsInline` is what
       * stops iOS taking the video fullscreen the moment it plays.
       */
      preload="none"
      autoPlay
      muted
      loop
      playsInline
      /*
       * Held transparent until there is actually a frame to show. A video
       * element with nothing decoded and no `poster` attribute of its own
       * paints as a solid block in some browsers, which would flash over the
       * photograph in the seconds between mounting and playing. Fading in from
       * nothing also means a video that never arrives is indistinguishable
       * from the still it is sitting on.
       */
      onPlaying={function revealOncePlaying() {
        setPlaying(true);
      }}
      className={`absolute inset-0 h-full w-full object-cover object-[center_45%] transition-opacity duration-1000 ${
        playing ? "opacity-100" : "opacity-0"
      }`}
      /*
       * Decoration over a poster that already carries the description. A
       * screen reader announcing an unlabelled media player here would be
       * offering a control that does nothing for its user.
       */
      aria-hidden
      tabIndex={-1}
    >
      <source src={video.src} type={video.type} />
    </video>
  );
}
