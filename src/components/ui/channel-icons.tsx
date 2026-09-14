import type { ReactNode } from "react";

/**
 * The marks that sit beside a way of getting in touch.
 *
 * Inline SVG rather than an icon package or a font: five glyphs do not earn a
 * dependency, and a webfont would put a network request in front of the one
 * band on the site whose whole job is to be acted on immediately. Drawn on a
 * 24-unit grid and sized in `em`, so a mark scales with whatever text it is
 * set against rather than needing a size passed at every call.
 *
 * Every one of them inherits `currentColor` and is marked `aria-hidden`. The
 * channel is already named in text beside it, so a screen reader that also
 * announced the mark would read the same thing twice; these are decoration
 * over a label, never a label of their own.
 */
export function Glif({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="h-[1em] w-[1em] shrink-0"
    >
      {children}
    </svg>
  );
}

export function IkonaTelefonu() {
  return (
    <Glif>
      {/*
       * The handset, drawn as a stroke rather than filled: at 1em against
       * body text a solid receiver reads as a blob, and the outline keeps the
       * silhouette legible at the size this is used.
       */}
      <path
        d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Glif>
  );
}

export function IkonaMaila() {
  return (
    <Glif>
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      {/* The flap, so the rectangle does not read as a photograph. */}
      <path
        d="m3.5 7 8.5 6 8.5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Glif>
  );
}

export function IkonaInstagrama() {
  return (
    <Glif>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </Glif>
  );
}

export function IkonaFacebooka() {
  return (
    <Glif>
      {/*
       * The "f" as a single filled path. Facebook's mark is the letter inside
       * a circle, and the letter alone is the half that survives being shrunk
       * to the height of a line of text.
       */}
      <path
        d="M13.6 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A22 22 0 0 0 14.4 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.7V13h2.7v8Z"
        fill="currentColor"
      />
    </Glif>
  );
}
