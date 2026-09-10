import { DO_UZUPELNIENIA } from "@/lib/site";

import type { Fotografia, Realizacja } from "../types";

import zdjecie01 from "./01.jpg";
import zdjecie02 from "./02.jpg";
import zdjecie03 from "./03.jpg";
import zdjecie04 from "./04.jpg";
import zdjecie05 from "./05.jpg";
import zdjecie06 from "./06.jpg";
import zdjecie07 from "./07.jpg";

/*
 * Real event. `place` and `date` ship as `DO_UZUPEŁNIENIA` — the client has
 * the photographs but hasn't sent venue and date yet — so both are rendered
 * conditionally rather than shown as literal placeholder text; see
 * `RealizationCard` and `/realizacje/[slug]`.
 *
 * Two décor setups from the same wedding: the garden photo wall (01–04) and
 * the indoor reception, including the head table under the same "Młoda Para"
 * neon sign that appears in the site's hero footage (05–07).
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
    alt: "Balonowe koło w zieleni i srebrze między iglastymi drzewami, z widokiem na ścieżkę ogrodu",
  },
  {
    image: zdjecie03,
    alt: "Ta sama balonowa brama od strony stawu, z odbiciem chmur na wodzie",
  },
  {
    image: zdjecie04,
    alt: "Kobieta pozuje wewnątrz balonowego koła, trzymając je uniesionymi rękami, na tle ogrodowego trawnika",
  },
  {
    image: zdjecie05,
    alt: "Balonowa brama w zieleni, złocie i kremie z tabliczkami powitalnymi „Witamy” i inicjałami pary młodej, w jasnym wnętrzu sali",
  },
  {
    image: zdjecie06,
    alt: "Stół prezydialny na tle zasłon i zieleni z podświetlanym neonowym napisem „Młoda Para”, ozdobiony bukietem z róż i eustomy",
  },
  {
    image: zdjecie07,
    alt: "Sala weselna z długimi stołami gościnnymi nakrytymi do obiadu, z widokiem na stół prezydialny w głębi",
  },
];

export const wesele: Realizacja = {
  slug: "wesele",
  title: "Wesele",
  category: "wesela",
  place: DO_UZUPELNIENIA,
  date: DO_UZUPELNIENIA,
  style:
    "Balonowe kolumny i łuki w zieleni, złocie, srebrze i bieli — wewnątrz sali i w plenerze ogrodu",
  intro:
    "Kolumny i okrągłe bramy z balonów w zieleni, złocie i bieli — od powitania gości w sali po ściankę do zdjęć w ogrodzie. Spójna dekoracja na cały dzień, od stołu prezydialnego po plener.",
  cover: photos[0],
  photos,
};
