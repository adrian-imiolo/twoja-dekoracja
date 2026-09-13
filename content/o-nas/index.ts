import { imie, site } from "@/lib/site";

import type { Fotografia } from "../realizacje/types";

import zdjecieWspolne from "./portret.jpg";

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
 * It is one photograph of both owners together, not two separate portraits.
 * The page names both of them under a single frame and the copy beside it
 * says "jesteśmy we dwie"; a picture of one of them under that caption reads
 * as the other not existing. It is landscape, 3:2, cropped once from the
 * original so that the page and the share preview show the same frame: a CSS
 * crop would leave the preview with the ceiling and floor the page hides.
 *
 * The names in the alt text come from `site.owners` so that the caption under
 * the frame and the description read to a screen reader cannot disagree about
 * who is in it.
 */
export const portret: Fotografia = {
  image: zdjecieWspolne,
  alt: `${site.owners.map(imie).join(" i ")}, właścicielki pracowni ${site.name}, przy dekoracji balonowej na chrzest i roczek`,
};
