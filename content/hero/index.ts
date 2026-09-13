import type { Fotografia } from "../realizacje/types";

import kadrTytulowy from "./poster.jpg";

/**
 * What the home page's first screen shows.
 *
 * The design spec ("Hero video") commits to a hero that stands up as a still
 * and gains motion when there is footage to add. Keeping both the poster and
 * the video here makes that an edit to this file, with the page untouched.
 */

/**
 * The footage, once it exists.
 *
 * A path under `public/` rather than a static import: the build reads
 * dimensions out of an imported image to make the poster shift-free, and it has
 * no equivalent to read out of a video. Next has no loader for one, so
 * importing it would fail the build outright.
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
   * candidate; the design spec's "Hero video" section says why the video
   * never becomes one.
   */
  poster: Fotografia;
  /**
   * Optional, and absence is a state rather than a fault: nothing on the page
   * waits for footage, and a hero without it is the still on its own.
   *
   * This field is the site's only statement of whether footage exists.
   * Neither the component that mounts the video nor the page asserts it, so
   * adding or withdrawing footage is an edit here and nowhere else, with a
   * single exception: `e2e/home.spec.ts` holds a test that the footage plays,
   * which has to be deleted alongside a withdrawal.
   */
  video?: HeroVideoSource;
}

/*
 * The client's own footage, a vertical phone pan across a "Młoda Para" neon
 * sign, re-encoded from a 12.7 MB original to 1.77 MB H.264 with the audio
 * stripped and the orientation baked into the pixels rather than left as
 * rotation metadata. The poster is a frame pulled from the same clip. The
 * design spec's "Hero video" section covers the budget and why a portrait
 * source fits the band.
 */
export const hero: Hero = {
  poster: {
    image: kadrTytulowy,
    alt: "Neonowy napis „Młoda Para” na tle zwiewnych zasłon i zieleni",
  },

  video: { src: "/hero/hero.mp4", type: "video/mp4" },
};
