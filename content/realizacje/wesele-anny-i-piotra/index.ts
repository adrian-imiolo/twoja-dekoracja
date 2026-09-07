import type { Fotografia, Realizacja } from "../types";

import zdjecie01 from "./01.jpg";
import zdjecie02 from "./02.jpg";
import zdjecie03 from "./03.jpg";
import zdjecie04 from "./04.jpg";
import zdjecie05 from "./05.jpg";
import zdjecie06 from "./06.jpg";
import zdjecie07 from "./07.jpg";
import zdjecie08 from "./08.jpg";

/*
 * PLACEHOLDER CONTENT — both the photographs and the copy below stand in for a
 * real event that the client has yet to supply. The images are generated plum
 * cards marked "zdjęcie zastępcze"; they are deliberately obvious so a preview
 * deployment can never be mistaken for the business's actual portfolio.
 *
 * This realization is not fit to publish. Replace the eight JPEGs and every
 * string here with a real event before the site goes live.
 */
const photos: readonly [Fotografia, ...Fotografia[]] = [
  {
    image: zdjecie01,
    alt: "Stół prezydialny w sali balowej, przystrojony girlandą z eukaliptusa i pudrowych róż",
  },
  {
    image: zdjecie02,
    alt: "Okrągły stół gościnny z niskim bukietem w białym wazonie i ręcznie pisanymi winietkami",
  },
  {
    image: zdjecie03,
    alt: "Brama ślubna z białych piwonii i gałązek eukaliptusa ustawiona w pałacowym ogrodzie",
  },
  {
    image: zdjecie04,
    alt: "Rząd świec w szklanych kloszach wzdłuż przejścia między krzesłami ceremonii",
  },
  {
    image: zdjecie05,
    alt: "Detal nakrycia: serwetka spięta wstążką w kolorze pudrowego różu i gałązka eukaliptusa",
  },
  {
    image: zdjecie06,
    alt: "Tort weselny na okrągłym stole udekorowanym świeżymi kwiatami i niskimi świecami",
  },
  {
    image: zdjecie07,
    alt: "Ścianka za stołem prezydialnym uplotona z suszonych traw i białych kwiatów",
  },
  {
    image: zdjecie08,
    alt: "Sala balowa o zmierzchu, ciepłe światło świec odbite w kieliszkach na stołach",
  },
];

export const weseleAnnyIPiotra: Realizacja = {
  slug: "wesele-anny-i-piotra",
  title: "Wesele Anny i Piotra",
  category: "wesela",
  place: "Pałac Krąg",
  date: "Czerwiec 2026",
  style: "Pudrowy róż, biel i eukaliptus",
  intro:
    "Kameralne wesele dla siedemdziesięciu osób w barokowych wnętrzach Pałacu Krąg. Pudrowy róż i biel przełamane gałązkami eukaliptusa — od bramy ceremonii po stół prezydialny.",
  cover: photos[0],
  photos,
};
