import { DO_UZUPELNIENIA } from "@/lib/site";

import type { Fotografia, Realizacja } from "../types";

import zdjecie01 from "./01.jpg";
import zdjecie02 from "./02.jpg";
import zdjecie03 from "./03.jpg";
import zdjecie04 from "./04.jpg";

/*
 * Real event. `place` and `date` ship as `DO_UZUPEŁNIENIA` — the client has
 * the photographs but hasn't sent venue and date yet — so both are rendered
 * conditionally rather than shown as literal placeholder text; see
 * `RealizationCard` and `/realizacje/[slug]`.
 *
 * The salon's own name and branding are visible in the source photographs but
 * deliberately left out of the copy — this describes the decoration, not the
 * client's client.
 */
const photos: readonly [Fotografia, ...Fotografia[]] = [
  {
    image: zdjecie01,
    alt: "Łuk z balonów w pudrowym różu, fiolecie i lawendzie przy wejściu do salonu kosmetycznego, z różowymi leżakami na chodniku",
  },
  {
    image: zdjecie02,
    alt: "Balonowy łuk w odcieniach różu i fioletu przy przeszklonym wejściu do lokalu usługowego",
  },
  {
    image: zdjecie03,
    alt: "Zbliżenie na balonowy łuk w różu, fiolecie i lawendzie oplatający szklane drzwi wejściowe",
  },
  {
    image: zdjecie04,
    alt: "Dwie kolumny z balonów w różu i fiolecie flankujące wejście do salonu, z donicami kwiatów przy chodniku",
  },
];

export const otwarcieSalonuKosmetycznego: Realizacja = {
  slug: "otwarcie-salonu-kosmetycznego",
  title: "Otwarcie salonu kosmetycznego",
  category: "imprezy",
  place: DO_UZUPELNIENIA,
  date: DO_UZUPELNIENIA,
  style:
    "Łuk balonowy w pudrowym różu, lawendzie i fiolecie przy wejściu do lokalu",
  intro:
    "Balonowy łuk w różu i fiolecie przy wejściu, na otwarcie nowego salonu kosmetycznego. Dekoracja pomyślana tak, by zatrzymać wzrok przechodniów na chodniku.",
  cover: photos[0],
  photos,
};
