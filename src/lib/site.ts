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
 * Whether a fact is still a placeholder rather than something the site knows.
 *
 * A page asks this to decide what it can build out of a value. A phone number
 * the site knows becomes a `tel:` link the visitor taps; the placeholder can
 * only be shown as text, because a link to `tel:[DO UZUPEŁNIENIA]` dials
 * nothing and looks like a fault rather than an unfinished detail.
 *
 * Exported as a question rather than exporting `PENDING` itself so the
 * sentinel stays one string in one file — the moment its shape is compared at
 * a call site, changing it means finding every comparison.
 */
export function isPending(value: string): boolean {
  return value === PENDING;
}

/**
 * The origin the site is served from, needed in absolute form because a shared
 * link's preview image is fetched by a messaging app rather than by the browser
 * that has the page — a relative URL never resolves there.
 *
 * The custom domain is outstanding client input, so this reads what the
 * environment knows: an explicit setting first, then the production domain
 * Vercel injects into every one of its builds.
 *
 * Falling back to localhost is correct for `next dev` and for the end-to-end
 * suite, which builds and serves locally — and catastrophic in a deployment,
 * where it would publish canonicals and preview images pointing at the
 * visitor's own machine. Since that fault is invisible in the rendered page
 * and only shows up as links that quietly stop previewing, a deployed build
 * that cannot name itself fails here instead of shipping.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;

  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelDomain) return `https://${vercelDomain}`;

  if (process.env.VERCEL) {
    throw new Error(
      "Build na Vercelu nie zna własnej domeny — ustaw NEXT_PUBLIC_SITE_URL.",
    );
  }

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
