import type { CSSProperties } from "react";

import type { Fotografia } from "@content/realizacje";

/**
 * The inline style that crops a cover into `RealizationCard`'s frame.
 *
 * Falsy rather than absent is the test for both fields, so a `zoom` of `0`
 * means no zoom rather than a cover scaled to nothing. A photograph with
 * neither field gets no style at all and keeps the default centre crop.
 */
export function coverStyle(cover: Fotografia): CSSProperties | undefined {
  if (!cover.position && !cover.zoom) return undefined;
  if (!cover.zoom) return { objectPosition: cover.position };

  return {
    objectPosition: cover.position,
    transform: `scale(${cover.zoom})`,
    transformOrigin: cover.zoomOrigin ?? "50% 50%",
  };
}
