import { DO_UZUPELNIENIA } from "@/lib/site";

import type { Fotografia, Realizacja } from "../types";

import zdjecie01 from "./01.jpg";
import zdjecie02 from "./02.jpg";
import zdjecie03 from "./03.jpg";

/*
 * Real event. `place` and `date` are still `DO_UZUPELNIENIA`; see
 * `miejsceITermin` in `src/lib/site.ts` for how that renders.
 *
 * One décor setup, photographed three times: the round balloon photo wall on
 * the lawn. The indoor reception this folder used to also carry belongs to a
 * different wedding and now lives only in `wesele-k-i-m`; the two were filed as
 * one realization by mistake, and the client confirmed they are not. A fourth
 * garden frame went at the same time, withdrawn by the client as too near a
 * repeat of the first. The title names the garden rather than the couple
 * because nothing in these frames identifies them, and "Wesele" alone no longer
 * tells the two apart.
 */
const photos: readonly [Fotografia, ...Fotografia[]] = [
  {
    image: zdjecie01,
    alt: "Okrągła brama z balonów w zieleni, bieli i srebrze, ustawiona na trawniku ogrodu z altaną w tle",
    position: "center 52%",
    zoom: 1.2,
  },
  {
    image: zdjecie02,
    alt: "Ta sama balonowa brama widziana z daleka, pośrodku ogrodowego trawnika, między strzyżonymi iglakami",
  },
  {
    image: zdjecie03,
    alt: "Kobieta pozuje wewnątrz balonowego koła, trzymając je uniesionymi rękami, na tle ogrodowego trawnika",
  },
];

export const wesele: Realizacja = {
  slug: "wesele",
  title: "Wesele w ogrodzie",
  category: "wesela",
  place: DO_UZUPELNIENIA,
  date: DO_UZUPELNIENIA,
  style:
    "Okrągła ścianka z balonów w butelkowej zieleni, srebrze i bieli, z tropikalnymi liśćmi - w plenerze ogrodu",
  intro:
    "Okrągła ścianka do zdjęć z balonów w butelkowej zieleni, srebrze i bieli, na trawniku w ogrodzie. Wysoka na tyle, że goście mieszczą się w niej w całości.",
  cover: photos[0],
  photos,
};
