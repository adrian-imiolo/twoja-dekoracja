import Image from "next/image";
import Link from "next/link";

import { coverStyle } from "@/lib/cover-style";
import { miejsceITermin } from "@/lib/site";
import {
  KATEGORIA_LABEL,
  realizacjaHref,
  type Realizacja,
} from "@content/realizacje";

/**
 * One realization as it appears in a listing.
 *
 * The whole card is the link rather than the title alone. On a phone the
 * photograph is the thing a visitor aims at, and a card whose only target is a
 * line of text reads as broken to the thumb.
 *
 * The cover is cropped to a common frame here, unlike the detail page's
 * gallery, which follows each photograph's own shape. A listing is a
 * comparison: portrait and landscape covers set side by side at their true
 * proportions make a ragged grid, and the eye reads the raggedness as a
 * difference between the realizations rather than between their photographs.
 */
export function RealizationCard({
  realizacja,
  sizes,
  titleAs: Title,
}: {
  realizacja: Realizacja;
  /**
   * The title's heading level. It comes from whoever laid out the listing,
   * because only they know whether the cards sit directly under the page's
   * `h1` or under a section `h2`. Required on purpose: a default would encode
   * one of those as the normal case and skip a level in the other.
   */
  titleAs: "h2" | "h3";
  /**
   * How wide the card will be rendered, in `next/image` terms. It
   * comes from whoever laid out the listing, because only they know how many
   * columns the card is sharing a row with.
   */
  sizes: string;
}) {
  return (
    <Link
      href={realizacjaHref(realizacja)}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush-300"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-plum-900">
        <Image
          src={realizacja.cover.image}
          /*
           * Empty on purpose, and not a lapse in the alt-text rule. The link
           * is already named by the title and place below, so an announced
           * description here would make a screen reader read every card twice.
           * The same photograph carries its authored Polish description on the
           * realization's own page, which is where a reader who wants it is.
           */
          alt=""
          placeholder="blur"
          fill
          sizes={sizes}
          style={coverStyle(realizacja.cover)}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <p className="mt-6 text-xs tracking-[0.25em] text-blush-300/80 uppercase">
        {KATEGORIA_LABEL[realizacja.category]}
      </p>
      <Title className="mt-2 font-display text-2xl text-blush-200 transition-colors group-hover:text-blush-100">
        {realizacja.title}
      </Title>
      {miejsceITermin(realizacja) ? (
        <p className="mt-2 text-sm tracking-[0.25em] text-blush-300 uppercase">
          {miejsceITermin(realizacja)}
        </p>
      ) : null}
      <p className="mt-3 text-cream-50/75">{realizacja.style}</p>
    </Link>
  );
}
