/**
 * Every page the site has beyond the home page, in the order a visitor uses
 * them: the work first, then the people behind it, then the questions that
 * stand between them and writing, then writing.
 *
 * Held once because two places offer the list — the header and the footer —
 * and a page added to one and forgotten in the other is a page reachable from
 * the top of the site and not from the bottom. The privacy policy is
 * deliberately not here: it lives in the footer alone, where someone looking
 * for it already looks, and where it does not take a quarter of the header's
 * navigation from the pages that sell the work.
 */
export const STRONY = [
  { sciezka: "/realizacje", nazwa: "Realizacje" },
  { sciezka: "/o-nas", nazwa: "O nas" },
  { sciezka: "/faq", nazwa: "FAQ" },
  { sciezka: "/kontakt", nazwa: "Kontakt" },
] as const;
