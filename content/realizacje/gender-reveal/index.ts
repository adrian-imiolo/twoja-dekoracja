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
 */
const photos: readonly [Fotografia, ...Fotografia[]] = [
  {
    image: zdjecie01,
    alt: "Balonowe koło w błękicie, różu i beżu na pomoście nad leśnym jeziorem, z napisem „Oh Baby”",
  },
  {
    image: zdjecie02,
    alt: "Balonowe koło z napisem „Oh Baby” i figurkami niemowląt, widziane z pomostu prowadzącego nad wodę",
  },
  {
    image: zdjecie03,
    alt: "Kobieta pozuje z uniesionymi rękami obok balonowego koła na pomoście nad jeziorem",
  },
  {
    image: zdjecie04,
    alt: "Zbliżenie na balonowe koło z napisem „Oh Baby”, dwiema maskotkami niemowląt i motylkami wśród balonów",
  },
];

export const genderReveal: Realizacja = {
  slug: "gender-reveal",
  title: "Gender reveal nad jeziorem",
  category: "imprezy",
  place: DO_UZUPELNIENIA,
  date: DO_UZUPELNIENIA,
  style:
    "Balonowe koło w błękicie, różu i beżu, z personalizowanym napisem „Oh Baby” nad wodą",
  intro:
    "Balonowe koło w błękicie i różu na pomoście nad jeziorem, z napisem „Oh Baby” i figurkami niemowląt. Scenografia zaprojektowana z myślą o zdjęciach i wielkim ogłoszeniu.",
  cover: photos[0],
  photos,
};
