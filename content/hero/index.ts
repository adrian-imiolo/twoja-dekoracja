import type { Fotografia } from "../realizacje/types";

import kadrTytulowy from "./poster.jpg";

/**
 * What the home page's first screen shows.
 *
 * Content, not layout, and that is the whole point of the folder. The design
 * spec commits to a hero that ships as a still now and gains the client's
 * footage later; keeping both the poster and the video here means that later
 * is an edit to this file rather than a change to the page.
 */

/**
 * The footage, once it exists.
 *
 * A path under `public/` rather than a static import: the build reads
 * dimensions out of an imported image, which is what makes the poster
 * shift-free, and it has no equivalent to read out of a video — Next has no
 * loader for one, so importing it would fail the build outright.
 *
 * The type travels with the source because a browser picks a `<source>` by
 * looking at it and never by fetching the file to find out.
 */
export interface HeroVideoSource {
  /** Absolute, from the site root: `/hero/hero.mp4`. */
  src: string;
  /** `video/mp4`, `video/webm`. */
  type: string;
}

export interface Hero {
  /**
   * The still. Always present, and always the largest-contentful-paint
   * candidate — see `src/components/hero-media.tsx` for why the video is
   * never allowed to become one.
   */
  poster: Fotografia;
  /**
   * Absent until the client supplies footage. Its absence is the launch state,
   * not a fault: nothing on the page waits for it.
   */
  video?: HeroVideoSource;
}

/*
 * The client's own footage: a phone pan across a "Młoda Para" neon sign against
 * sheer curtains and greenery. Shot vertically (a Reel, not a landscape take),
 * which turns out not to matter — the hero band is `object-cover`, and it
 * crops this exactly the way it would any other source: full-bleed and
 * centred on both a tall phone viewport and a wide desktop one.
 *
 * The poster is a frame pulled from this same clip rather than a separate
 * photograph, so the still-to-video handoff shows the same shot rather than a
 * visible cut.
 *
 * Re-encoded from the client's 12.7 MB original to 1.77 MB H.264 (audio
 * stripped, orientation baked into the pixels rather than left as rotation
 * metadata) — comfortably inside the 3 MB / 10–15 s budget the design spec
 * sets, with room to spare since this clip is only 6.7 s.
 */
export const hero: Hero = {
  poster: {
    image: kadrTytulowy,
    alt: "Neonowy napis „Młoda Para” na tle zwiewnych zasłon i zieleni",
  },

  video: { src: "/hero/hero.mp4", type: "video/mp4" },
};
