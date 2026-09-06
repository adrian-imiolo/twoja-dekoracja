/**
 * Facts about the business that more than one page needs.
 *
 * The owner's real name, phone, email and Instagram handle are outstanding
 * client input (issue #12) and ship as `[DO UZUPEŁNIENIA]` placeholders until
 * they arrive. The service area is settled and drives both the footer and,
 * later, the `LocalBusiness` structured data — there is no street address to
 * declare, because the business is działalność nierejestrowana.
 */
export const site = {
  name: "Twoja Dekoracja",
  wordmark: "twoja dekoracja",
  tagline: "Dekoracje weselne i okolicznościowe",
  description:
    "Dekoracje weselne, urodzinowe i okolicznościowe w Szczecinie i okolicach.",
  city: "Szczecin",
  serviceArea: ["Szczecin", "Police", "Stargard", "Goleniów", "Świnoujście"],
  owner: "[DO UZUPEŁNIENIA]",
  phone: "[DO UZUPEŁNIENIA]",
  email: "[DO UZUPEŁNIENIA]",
  instagram: "[DO UZUPEŁNIENIA]",
} as const;
