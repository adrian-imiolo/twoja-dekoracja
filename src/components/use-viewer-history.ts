"use client";

import { useEffect, useState } from "react";

/**
 * Whether the full-screen viewer is open, kept in step with the browser's
 * history so the phone's back gesture closes it instead of leaving the page.
 *
 * All of it in one place: opening pushes a same-URL entry, every way out calls
 * `close`, which goes back, and the one `popstate` that follows is what
 * closes. The realization stays the page that is linked and shared, and a
 * shared link never opens a viewer.
 *
 * The push happens in `open`, on the click, rather than when the viewer
 * mounts: an effect runs twice under Strict Mode and would leave two entries,
 * one of them a back press that does nothing.
 */
export function useViewerHistory(): {
  isOpen: boolean;
  open: () => void;
  close: () => void;
} {
  const [otwarty, setOtwarty] = useState(false);

  useEffect(
    function zamykajPrzyCofnieciu() {
      if (!otwarty) return;

      function zamknij() {
        setOtwarty(false);
      }

      window.addEventListener("popstate", zamknij);
      return function przestanNasluchiwac() {
        window.removeEventListener("popstate", zamknij);
      };
    },
    [otwarty],
  );

  function otworz() {
    history.pushState({ viewer: true }, "");
    setOtwarty(true);
  }

  function cofnij() {
    history.back();
  }

  return { isOpen: otwarty, open: otworz, close: cofnij };
}
