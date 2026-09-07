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

/**
 * The origin the site is served from, needed in absolute form because a
 * shared link's preview image is fetched by a messaging app rather than by the
 * browser that has the page — a relative URL never resolves there.
 *
 * The domain is outstanding client input, so this falls back through what the
 * environment knows: an explicit setting first, then the production domain
 * Vercel injects at build time, then localhost for `next dev` and the
 * end-to-end suite.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelDomain) return `https://${vercelDomain}`;

  return "http://localhost:3000";
}

export const site = {
  name: "Twoja Dekoracja",
  url: resolveSiteUrl(),
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
