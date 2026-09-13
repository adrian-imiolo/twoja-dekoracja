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
    alt: "Girlanda z czerwonych i lustrzanych balonów z neonowym napisem „Happy Birthday” w stonowanym, niebieskim świetle",
  },
  {
    image: zdjecie02,
    alt: "Ta sama girlanda balonowa w kadrze z oknem, za którym widać oświetlony choinką plac miejski nocą",
  },
];

export const urodziny30: Realizacja = {
  slug: "urodziny-30",
  title: "Urodziny 30",
  category: "imprezy",
  place: DO_UZUPELNIENIA,
  date: DO_UZUPELNIENIA,
  style:
    "Girlanda balonowa w czerwieni i złocie z neonowym napisem „Happy Birthday”",
  intro:
    "Girlanda z czerwonych i lustrzanych balonów z neonowym napisem „Happy Birthday” w klimatycznym, niebieskim świetle. Stonowana, klubowa oprawa na trzydzieste urodziny.",
  cover: photos[0],
  photos,
};
