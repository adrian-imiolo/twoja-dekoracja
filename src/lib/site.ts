/**
 * Facts about the business that more than one page needs.
 *
 * The owner's name, phone, email and Instagram handle are outstanding client
 * input and ship as placeholders until they arrive; the footer needs a real
 * shape before the real values exist. Polish inflects place names, so the city
 * is held in both the nominative it is listed under and the locative that
 * prose needs — "w Szczecin" is a grammatical error a visitor will notice.
 */
const PENDING = "[DO UZUPEŁNIENIA]";

export const site = {
  name: "Twoja Dekoracja",
  wordmark: "twoja dekoracja",
  tagline: "Dekoracje weselne i okolicznościowe",
  description:
    "Dekoracje weselne, urodzinowe i okolicznościowe w Szczecinie i okolicach.",
  city: "Szczecin",
  cityLocative: "Szczecinie",
  serviceArea: ["Szczecin", "Police", "Stargard", "Goleniów", "Świnoujście"],
  owner: PENDING,
  phone: PENDING,
  email: PENDING,
  instagram: PENDING,
} as const;
