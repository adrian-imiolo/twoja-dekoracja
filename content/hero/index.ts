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
 * PLACEHOLDER CONTENT — `poster.jpg` is a generated plum card marked "zdjęcie
 * zastępcze", the same stand-in the placeholder realizations use, so a preview
 * deployment can never be mistaken for the business's actual work. Replace it
 * with a real photograph before launch.
 *
 * The replacement wants to be wide and to survive being cropped hard on a
 * phone: the frame is 16:9 on a laptop and much taller than it is wide in a
 * portrait viewport, and whatever sits in the middle of the image is the part
 * that always survives.
 */
export const hero: Hero = {
  poster: {
    image: kadrTytulowy,
    alt: "Sala weselna udekorowana świecami i kompozycjami z pudrowych róż",
  },

  /*
   * The video slot, deliberately empty — written out rather than left off, so
   * the hole is visible in the shape of the content rather than only in the
   * type.
   *
   * Filling it is the entire change: drop the file into `public/hero/` and put
   * `{ src: "/hero/hero.mp4", type: "video/mp4" }` here. The hero is already
   * built to layer a video over the poster without moving anything, so nothing
   * else on the page or in the layout is touched.
   *
   * Budget is 3 MB for a 10–15 second clip. Above that the site is trading
   * search ranking for atmosphere on the one page where ranking matters most.
   */
  video: undefined,
};
