import type { Metadata } from "next";

import { site } from "@/lib/site";
import { type Fotografia, realizacje } from "@content/realizacje";

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
 * A photograph as a link preview.
 *
 * The dimensions travel with the URL because a preview card is laid out by
 * whoever renders it, from the metadata alone — they have the image but not
 * the page, so an image whose shape they have to discover renders as a
 * reflowing placeholder or not at all.
 */
export function asOgImage(fotografia: Fotografia): OgImage {
  return {
    url: fotografia.image.src,
    width: fotografia.image.width,
    height: fotografia.image.height,
    alt: fotografia.alt,
  };
}

/**
 * The preview a page falls back to when it has no photograph of its own.
 *
 * The registry's order is authored with the strongest work first, so its head
 * is what belongs in front of whoever the link was sent to. A wordmark card
 * would be the obvious alternative and is the wrong one: the link is asking
 * someone to judge decorations, and a logo shows them none.
 *
 * `slice` rather than an index because the registry is only typed as a list —
 * an empty archive yields a preview with no image rather than a crash, which
 * is the right failure for a site whose content is authored by hand.
 */
function domyslnyPodglad(): OgImage[] {
  return realizacje.slice(0, 1).map((realizacja) => asOgImage(realizacja.cover));
}

/**
 * How every page describes itself to whoever it is pasted in front of.
 *
 * One helper rather than the same six keys written out on each page. That is
 * not only about repetition: `type`, `locale` and `siteName` are the same
 * answer everywhere by definition, and a page that quietly disagrees about one
 * of them is a defect nothing on the site would show — the page renders
 * perfectly and only the shared link is wrong.
 *
 * Every page gets an image, including the ones with nothing of their own to
 * show. A preview with a title and no image is a grey rectangle in a chat
 * thread, which is most of the way back to a bare URL.
 *
 * `url` and the image paths stay relative and are resolved against
 * `metadataBase` in the root layout, so the origin is decided in one place.
 */
export function sharePreview(strona: {
  /** The page's own path, e.g. `/kontakt`. */
  path: string;
  /** The preview's headline. Longer than the `<title>` may afford to be. */
  title: string;
  description: string;
  /** A page's own photographs, when it has better ones than the archive head. */
  images?: readonly OgImage[];
  /** `article` for a single realization; everything else is a `website`. */
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: strona.type ?? "website",
      locale: "pl_PL",
      siteName: site.name,
      url: strona.path,
      title: strona.title,
      description: strona.description,
      images: [...(strona.images ?? domyslnyPodglad())],
    },
    // Every preview this site produces leads with a photograph, so the large
    // card is the only one that makes sense of it.
    twitter: { card: "summary_large_image" },
  };
}
