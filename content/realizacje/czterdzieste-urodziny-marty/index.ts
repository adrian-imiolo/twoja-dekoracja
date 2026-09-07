import type { Fotografia, Realizacja } from "../types";

import zdjecie01 from "./01.jpg";
import zdjecie02 from "./02.jpg";
import zdjecie03 from "./03.jpg";
import zdjecie04 from "./04.jpg";
import zdjecie05 from "./05.jpg";
import zdjecie06 from "./06.jpg";

/*
 * PLACEHOLDER CONTENT — the same generated plum cards and invented copy as
 * `wesele-anny-i-piotra`, and equally unfit to publish.
 *
 * It exists because `imprezy` had no realization at all, and the realizations
 * index has a section per category: without one, half the page could neither
 * be seen nor tested. Six photographs rather than eight, so the two events do
 * not accidentally agree on a count the layout might be leaning on.
 */
const photos: readonly [Fotografia, ...Fotografia[]] = [
  {
    image: zdjecie01,
    alt: "Długi stół biesiadny w ciemnej zieleni, ze złotymi świecznikami na całej długości",
  },
  {
    image: zdjecie02,
    alt: "Ścianka fotograficzna z liści monstery i białych hortensji, ze złotą ramą",
  },
  {
    image: zdjecie03,
    alt: "Wysoki złoty świecznik z białą hortensją, ustawiony przy wejściu na salę",
  },
  {
    image: zdjecie04,
    alt: "Stół z tortem urodzinowym, otoczony niskimi kompozycjami z zieleni i eukaliptusa",
  },
  {
    image: zdjecie05,
    alt: "Detal nakrycia: złoty talerz, ciemnozielona serwetka i winietka z imieniem gościa",
  },
  {
    image: zdjecie06,
    alt: "Sala po zmroku, światło świec odbite w złotych elementach dekoracji stołów",
  },
];

export const czterdziesteUrodzinyMarty: Realizacja = {
  slug: "czterdzieste-urodziny-marty",
  title: "Czterdzieste urodziny Marty",
  category: "imprezy",
  place: "Willa Ogrody, Police",
  date: "Marzec 2026",
  style: "Głęboka zieleń, złoto i biała hortensja",
  intro:
    "Wieczorne przyjęcie urodzinowe dla trzydziestu osób. Głęboka zieleń i złoto zamiast balonów — stoły, ścianka fotograficzna i świece.",
  cover: photos[0],
  photos,
};
