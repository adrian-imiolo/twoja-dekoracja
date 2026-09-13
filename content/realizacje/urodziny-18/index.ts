import { DO_UZUPELNIENIA } from "@/lib/site";

import type { Fotografia, Realizacja } from "../types";

import zdjecie01 from "./01.jpg";
import zdjecie02 from "./02.jpg";

/*
 * Real event. `place` and `date` ship as `DO_UZUPEŁNIENIA` — the client has
 * the photographs but hasn't sent venue and date yet — so both are rendered
 * conditionally rather than shown as literal placeholder text; see
 * `RealizationCard` and `/realizacje/[slug]`.
 *
 * Only two photographs — thinner than most realizations, launched anyway
 * rather than held back; the gallery layout is built for the sparse case.
 */
const photos: readonly [Fotografia, ...Fotografia[]] = [
  {
    image: zdjecie01,
    alt: "Balonowa brama w bordowej czerwieni, czerni i kremie w kamiennym, sklepionym wnętrzu piwnicy, obok stołu bilardowego",
    /*
     * A 4:5 photograph in the card's 4:3 frame: the frame holds 60% of the
     * height, but the arch plus the numerals span 66% of it (rows ~430–1615
     * of 1800), so no pan fits the whole subject and `zoom` only shrinks the
     * window. This pan keeps the "18" whole and lets the arch bleed off the
     * top edge, which reads as a crop rather than as a cut-off caption.
     * Measured in a browser for #32 — don't re-tune the percentage; the
     * remaining escape is a different photograph.
     */
    position: "center 72%",
  },
  {
    image: zdjecie02,
    alt: "Inne ujęcie balonowej bramy w bordowej czerwieni i czerni, z cyframi „18” i wiszącymi lampami w kształcie szyszek",
  },
];

export const urodziny18: Realizacja = {
  slug: "urodziny-18",
  title: "Urodziny 18",
  category: "imprezy",
  place: DO_UZUPELNIENIA,
  date: DO_UZUPELNIENIA,
  style:
    "Balonowa brama w bordowej czerwieni, czerni i kremie, w kamiennych piwnicznych wnętrzach",
  intro:
    "Balonowa brama w bordowej czerwieni, czerni i kremie w klimatycznych, kamiennych piwnicach. Mocna, klubowa stylistyka na osiemnaste urodziny.",
  cover: photos[0],
  photos,
};
