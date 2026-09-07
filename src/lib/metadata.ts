import type { Realizacja } from "@content/realizacje";

/**
 * What a messaging app or a search engine is handed as a page's preview image.
 *
 * Shaped for the `openGraph.images` entry the Next metadata API expects, and
 * spelled out rather than imported from the framework's internals so a Next
 * upgrade cannot quietly reshape it.
 */
interface OgImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * A realization's cover photograph as a link preview.
 *
 * The dimensions travel with the URL because a preview card is laid out by
 * whoever renders it, from the metadata alone — they have the image but not
 * the page, so an image whose shape they have to discover renders as a
 * reflowing placeholder or not at all.
 *
 * Shared by the index and the detail pages because they answer the question
 * the same way on purpose: whatever is pasted, the preview is the work.
 */
export function coverAsOgImage(realizacja: Realizacja): OgImage {
  return {
    url: realizacja.cover.image.src,
    width: realizacja.cover.image.width,
    height: realizacja.cover.image.height,
    alt: realizacja.cover.alt,
  };
}
