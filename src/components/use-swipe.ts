"use client";

import { useRef, useState, type TouchEvent } from "react";

/**
 * A finger dragging a track of photographs, shared by the gallery's stage and
 * the full-screen viewer so a swipe feels the same in both.
 *
 * The axis is decided once, by the first clear movement. A horizontal drag
 * moves the track and, released far enough, steps one photograph. A vertical
 * drag only means something where there is `onDismiss`: in the viewer it moves
 * the photograph and closes past a threshold; on the stage it is the page
 * scrolling, and is left to the browser.
 */
export function useSwipe({
  index,
  count,
  onStep,
  onDismiss,
}: {
  index: number;
  count: number;
  onStep: (step: number) => void;
  onDismiss?: () => void;
}): {
  offset: Przesuniecie | null;
  handlers: Uchwyty;
  /**
   * Whether a click now is the one a browser may fire at the end of a drag,
   * and should be ignored. Only right after the drag: a click a moment later,
   * from a mouse or a key, is meant.
   */
  justDragged: () => boolean;
} {
  const dotyk = useRef<Dotyk | null>(null);
  const koniecPrzeciagniecia = useRef(Number.NEGATIVE_INFINITY);
  const [przesuniecie, setPrzesuniecie] = useState<Przesuniecie | null>(null);

  function zacznijDotyk(zdarzenie: TouchEvent) {
    const palec = zdarzenie.touches[0];
    if (!palec || zdarzenie.touches.length > 1) return;
    dotyk.current = {
      x: palec.clientX,
      y: palec.clientY,
      os: null,
      ostatnie: { x: 0, y: 0 },
    };
  }

  function przeciagnij(zdarzenie: TouchEvent) {
    const start = dotyk.current;
    const palec = zdarzenie.touches[0];
    if (!start || !palec) return;

    const x = palec.clientX - start.x;
    const y = palec.clientY - start.y;

    // A swipe that wobbles does not start closing, and a drag down does not
    // change photographs.
    if (start.os === null) {
      if (Math.max(Math.abs(x), Math.abs(y)) < PROG_OSI) return;
      start.os = Math.abs(x) >= Math.abs(y) ? "x" : "y";
    }

    if (start.os === "y" && !onDismiss) return;

    // Past the first or last photograph the track gives, but reluctantly.
    const naKrancu = (index === 0 && x > 0) || (index === count - 1 && x < 0);
    const nowe =
      start.os === "y" ? { x: 0, y } : { x: naKrancu ? x / 3 : x, y: 0 };

    // Kept on the ref as well as in state: a quick flick can end before the
    // last move has rendered, and the release would read a stale distance.
    start.ostatnie = nowe;
    setPrzesuniecie(nowe);
  }

  function pusc() {
    const start = dotyk.current;
    dotyk.current = null;
    setPrzesuniecie(null);
    if (!start?.os) return;
    koniecPrzeciagniecia.current = performance.now();
    const koniec = start.ostatnie;

    if (start.os === "y") {
      if (onDismiss && Math.abs(koniec.y) >= PROG_ZAMKNIECIA) onDismiss();
      return;
    }

    if (Math.abs(koniec.x) < PROG_MACHNIECIA) return;
    const krok = koniec.x < 0 ? 1 : -1;
    if (index + krok < 0 || index + krok > count - 1) return;
    onStep(krok);
  }

  return {
    offset: przesuniecie,
    handlers: {
      onTouchStart: zacznijDotyk,
      onTouchMove: przeciagnij,
      onTouchEnd: pusc,
      onTouchCancel: pusc,
    },
    justDragged: function wlasniePrzeciagniety() {
      return performance.now() - koniecPrzeciagniecia.current < OKNO_KLIKNIECIA;
    },
  };
}

type Przesuniecie = { x: number; y: number };

type Uchwyty = {
  onTouchStart: (zdarzenie: TouchEvent) => void;
  onTouchMove: (zdarzenie: TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
};

type Dotyk = {
  x: number;
  y: number;
  os: "x" | "y" | null;
  ostatnie: Przesuniecie;
};

/** Movement, in pixels, before a touch commits to a direction. */
const PROG_OSI = 10;
/** Horizontal travel, in pixels, that changes the photograph. */
const PROG_MACHNIECIA = 50;
/** Vertical travel, in pixels, that dismisses. */
const PROG_ZAMKNIECIA = 100;
/** Milliseconds after a drag in which a click is taken to be the drag's own. */
const OKNO_KLIKNIECIA = 300;
