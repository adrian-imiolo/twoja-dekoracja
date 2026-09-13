"use client";

import { useEffect, useState } from "react";

/**
 * How the button finds the link it hands focus to.
 *
 * A DOM id rather than a ref, for the reason `HERO_POSTER_ID` gives: the
 * header is rendered on the server and this is not, so there is no ref to hand
 * across that boundary.
 */
export const HEADER_HOME_LINK_ID = "header-home-link";

/**
 * A floating way back to the top, bottom-right.
 *
 * `realization-nav.tsx` rejected a sticky header for permanently covering the
 * photographs being sold. This covers a corner of them, and only while it has
 * a job: from one screen past the header until the footer, whose navigation
 * already offers every page, comes into view.
 *
 * Hidden means not rendered. `e2e/responsive.spec.ts` reports any control
 * that fails `checkVisibility()` as reachable only on hover, so fading it out
 * or hiding it with CSS is not available. It fades in and disappears.
 */
export function BackToTop() {
  const [headerFarAway, setHeaderFarAway] = useState(false);
  const [footerOnScreen, setFooterOnScreen] = useState<boolean | null>(null);

  useEffect(() => {
    const header = document.querySelector("body > header");
    const footer = document.querySelector("body > footer");
    if (!header || !footer) return;

    /*
     * The root grown upward by a full viewport, so the header counts as
     * intersecting until it is more than one screen above the top edge. On the
     * home page that is the whole hero, so the button never sits over its
     * calls to action. Observers rather than a scroll listener: the browser
     * reports the two crossings and nothing is read on every frame.
     */
    const headerObserver = new IntersectionObserver(
      function trackHeader([entry]) {
        setHeaderFarAway(!entry.isIntersecting);
      },
      { rootMargin: "100% 0px 0px 0px" },
    );
    const footerObserver = new IntersectionObserver(function trackFooter([
      entry,
    ]) {
      setFooterOnScreen(entry.isIntersecting);
    });

    headerObserver.observe(header);
    footerObserver.observe(footer);

    return () => {
      headerObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  // `null` until the footer observer has reported, so a first frame never
  // shows the button over a footer that turns out to be on screen.
  if (!headerFarAway || footerOnScreen !== false) return null;

  function returnToTop() {
    /*
     * Smooth here rather than `scroll-behavior: smooth` site-wide, which would
     * also animate every in-page anchor, shared `/faq#...` links included.
     * Read at click time, like `hero-video.tsx` reads it at mount.
     */
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });

    // The button is about to stop existing, so a keyboard user carries on from
    // the top. `preventScroll`, or the focus call cancels the smooth scroll.
    document
      .getElementById(HEADER_HOME_LINK_ID)
      ?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={returnToTop}
      aria-label="Wróć na górę"
      className="fixed right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-10 flex size-11 items-center justify-center border border-blush-300 bg-plum-950 text-blush-200 transition-[opacity,color,background-color] hover:bg-blush-300 hover:text-plum-950 sm:right-8 starting:opacity-0"
    >
      {/*
       * On the grid and stroke `channel-icons.tsx` uses, so the site's marks
       * read as one set. The label is on the button; the chevron is decoration.
       */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className="size-6"
      >
        <path
          d="m6 15 6-6 6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
