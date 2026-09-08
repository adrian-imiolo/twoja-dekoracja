import type { Fotografia } from "../realizacje/types";

import kadrPortretowy from "./portret.jpg";

/**
 * The photograph of the person behind the business.
 *
 * Its own module for the reason `content/hero` is: replacing it is an edit to
 * this folder rather than a change to a page. It carries its alt text with it
 * because `Fotografia` pairs the two on purpose — a portrait described as
 * "portret" tells a screen reader user nothing about the person they are being
 * asked to trust, and this is the one image on the site whose whole job is to
 * make the business feel like a person.
 *
 * PLACEHOLDER CONTENT — `portret.jpg` is the same generated plum card the
 * placeholder realizations use, marked *zdjęcie zastępcze*, so a preview
 * deployment can never be mistaken for the real thing. The replacement wants
 * to be a portrait rather than a landscape crop of one: the page gives it a
 * tall frame, and a wide photograph put into it loses either the face or the
 * work behind it. Its alt text is rewritten with it, naming the person.
 */
export const portret: Fotografia = {
  image: kadrPortretowy,
  alt: "Zdjęcie zastępcze w miejscu portretu osoby prowadzącej pracownię",
};
