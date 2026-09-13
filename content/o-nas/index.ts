import type { Fotografia } from "../realizacje/types";

import kadrPortretowy from "./portret.jpg";

/**
 * The photograph of the people behind the business.
 *
 * Its own module for the reason `content/hero` is: replacing it is an edit to
 * this folder rather than a change to a page. It carries its alt text with it
 * because `Fotografia` pairs the two: a portrait described as
 * "portret" tells a screen reader user nothing about the people they are being
 * asked to trust, and this is the one image on the site whose job is to
 * make the business feel like a person.
 *
 * PLACEHOLDER CONTENT. `portret.jpg` is the same generated plum card the
 * placeholder realizations use, marked *zdjęcie zastępcze*, so a preview
 * deployment can never be mistaken for the real thing.
 *
 * What replaces it is **one photograph of both owners together**, not two
 * separate portraits. The page names both of them under a single frame and the
 * copy beside it says "jesteśmy we dwie"; a picture of one of them under that
 * caption reads as the other not existing. It should also be a portrait: the
 * frame is tall, and a wide photograph put into it loses either the faces or
 * the work behind them. Its alt text is rewritten with it, naming both.
 */
export const portret: Fotografia = {
  image: kadrPortretowy,
  alt: "Zdjęcie zastępcze w miejscu portretu osób prowadzących pracownię",
};
