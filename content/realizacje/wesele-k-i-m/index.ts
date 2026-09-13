import { DO_UZUPELNIENIA } from "@/lib/site";

import type { Fotografia, Realizacja } from "../types";

import zdjecie01 from "./01.jpg";
import zdjecie02 from "./02.jpg";
import zdjecie03 from "./03.jpg";

/*
 * Real event. `place` and `date` are still `DO_UZUPELNIENIA`; see
 * `miejsceITermin` in `src/lib/site.ts` for how that renders.
 *
 * Titled after the couple's initials rather than a name, because the only
 * identifying detail in the photographs themselves is the "K ♥ M" banner on
 * the welcome hoop. `chrzest-i-roczek` follows the same principle with
 * "Poli", read off its own backdrop rather than invented.
 */
const photos: readonly [Fotografia, ...Fotografia[]] = [
  {
    image: zdjecie01,
    alt: "Balonowe koło w zieleni, złocie i bieli z tabliczką powitalną „Witamy” i inicjałami pary młodej „K i M”, na tle pikowanej białej ściany",
  },
  {
    image: zdjecie02,
    alt: "Zbliżenie na balonowe koło w zieleni, złocie i bieli, z tabliczką powitalną „Witamy” i inicjałami „K i M” na złotej obręczy",
  },
  {
    image: zdjecie03,
    alt: "Stół prezydialny nakryty do kolacji w girlandzie zieleni ze światełkami i neonowym napisem „Młoda Para”, z kompozycją z róż i eustomy w pudrowym różu i kremie",
  },
];

export const weseleKiM: Realizacja = {
  slug: "wesele-k-i-m",
  title: "Wesele K i M",
  category: "wesela",
  place: DO_UZUPELNIENIA,
  date: DO_UZUPELNIENIA,
  style:
    "Balonowe koło w zieleni, złocie i bieli z tabliczką powitalną, i stół prezydialny w girlandzie zieleni pod neonowym napisem „Młoda Para”",
  intro:
    "Balonowe koło w zieleni i złocie, witające gości przy wejściu na salę. Stół prezydialny w girlandzie zieleni z neonowym napisem „Młoda Para” i różową kompozycją kwiatową.",
  cover: photos[0],
  photos,
};
