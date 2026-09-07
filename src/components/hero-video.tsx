"use client";

import { useEffect, useState } from "react";

import type { HeroVideoSource } from "@content/hero";

/**
 * The hero's footage, layered over the poster that is already on screen.
 *
 * Mounted only when a video exists, which at launch it does not — so the home
 * page ships with no client JavaScript in its hero at all, and gains this the
 * day the client's footage lands.
 *
 * Two rules shape everything below, both from the design spec:
 *
 * **The video must never become the largest contentful paint.** The site's
 * whole acquisition channel is search, and the metric search grades this page
 * on is how fast its first screen appears. So nothing here is rendered — and
 * therefore nothing is requested — until the browser has painted a frame with
 * the poster in it. A video that starts downloading during the initial page
 * load would compete with the poster for the connection and make the number
 * worse than it is with no video at all.
 *
 * **A visitor who asked for less motion gets the poster and nothing else.**
 * Not a paused video, not a video that loads and sits still: no request at
 * all, because the point of the preference is not to be shown moving imagery
 * and there is no reason to spend their data on it either.
 */
export function HeroVideo({ video }: { video: HeroVideoSource }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    // Read once, at mount. Someone flipping their system preference
    // mid-session is not a case worth a subscription here: the answer only
    // decides whether a background loop starts on a page they are already
    // looking at.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    /*
     * `load` has fired, so the poster — preloaded ahead of everything else as
     * the priority image — is fetched and decoded. One more frame after that
     * and it has actually been painted, which is the moment the video is free
     * to ask for bandwidth.
     */
    function armAfterNextPaint() {
      frame = requestAnimationFrame(() => setArmed(true));
    }

    if (document.readyState === "complete") {
      armAfterNextPaint();
    } else {
      window.addEventListener("load", armAfterNextPaint, { once: true });
    }

    return () => {
      window.removeEventListener("load", armAfterNextPaint);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!armed) return null;

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
       * Decoration over a poster that already carries the description. A
       * screen reader announcing an unlabelled media player here would be
       * offering a control that does nothing for its user.
       */
      aria-hidden
      tabIndex={-1}
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src={video.src} type={video.type} />
    </video>
  );
}
