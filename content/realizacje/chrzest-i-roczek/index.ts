import { DO_UZUPELNIENIA } from "@/lib/site";

import type { Fotografia, Realizacja } from "../types";

import zdjecie01 from "./01.jpg";
import zdjecie02 from "./02.jpg";
import zdjecie03 from "./03.jpg";
import zdjecie04 from "./04.jpg";
import zdjecie05 from "./05.jpg";

/*
 * Real event. `place` and `date` ship as `DO_UZUPEŁNIENIA` — the client has
 * the photographs but hasn't sent venue and date yet — so both are rendered
 * conditionally rather than shown as literal placeholder text; see
 * `RealizationCard` and `/realizacje/[slug]`.
 *
 * "Poli" is the child's name as printed on the client's own backdrop signage.
 */
const photos: readonly [Fotografia, ...Fotografia[]] = [
  {
    image: zdjecie01,
    alt: "Ścianka z papierowych stokrotek w pudrowym różu i kremie, z personalizowanym napisem „Chrzest święty i roczek Poli” oraz białą cyfrą 1",
    position: "center 15%",
  },
  {
    image: zdjecie02,
    alt: "Kwiatowa ścianka z dużym białym kwiatem stokrotki i balonową cyfrą 1, obok tablicy z comiesięcznymi zdjęciami dziecka",
  },
  {
    image: zdjecie03,
    alt: "Bukiet różowo-białych kwiatów na pierwszym planie, z rozmytą ścianką balonową w tle sali",
  },
  {
    image: zdjecie04,
    alt: "Nakryty stół biesiadny ze złotymi serwetkami i wazonikami kwiatów, z balonową ścianką w głębi sali",
  },
  {
    image: zdjecie05,
    alt: "Sala przyjęć z rzędem nakrytych stołów, kwiatową ścianką i stanowiskiem ze słodkim bukietem w tle",
  },
];

export const chrzestIRoczek: Realizacja = {
  slug: "chrzest-i-roczek",
  title: "Chrzest i roczek Poli",
  category: "imprezy",
  place: DO_UZUPELNIENIA,
  date: DO_UZUPELNIENIA,
  style:
    "Ścianka z papierowych stokrotek w pudrowym różu, kremie i bieli, z personalizowanym szyldem i cyfrą na roczek",
  intro:
    "Ścianka z papierowych stokrotek w różu i kremie, z imiennym szyldem i cyfrą na pierwsze urodziny. Delikatna, kwiatowa oprawa chrztu i roczku w jednej sali.",
  cover: photos[0],
  photos,
};
