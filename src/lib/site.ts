/**
 * Facts about the business that more than one page needs.
 *
 * Polish inflects place names, so the city is held in every case the site's
 * prose actually asks for rather than in the one a database would store: the
 * nominative it is listed under, the locative that "w …" takes and the
 * genitive that "ze …" takes. None can be derived from another by a template,
 * and both "w Szczecin" and "z Szczecinie" are errors a visitor from the city
 * notices before they notice anything else on the page.
 */
/**
 * What the site shows where it is waiting on the client.
 *
 * Exported because two kinds of hole need the same marker and a visitor must
 * not be able to tell them apart. A realization uses it for a venue or a date
 * nobody has looked up yet; `/polityka-prywatnosci` uses it inside prose, for
 * a sentence only the person running the business can write. Both are the same
 * promise to whoever is reading — this is unfinished, and here is where.
 *
 * `site` itself no longer holds one. Every business fact it carries is now
 * real, which is why nothing outside this module compares against the marker
 * to decide whether a phone number can be dialled.
 *
 * Rendering it is what this is for. Asking whether a value *is* it stays
 * `isPending`'s job: the sentinel's shape is then compared in exactly one
 * place, which is the point the doc below makes.
 */
export const DO_UZUPELNIENIA = "[DO UZUPEŁNIENIA]";

/**
 * Whether a fact is still a placeholder rather than something the site knows.
 *
 * A page asks this to decide what it can build out of a value. A venue the
 * site knows can be shown beside a date; the placeholder cannot be shown at
 * all, because literal `[DO UZUPEŁNIENIA]` on a published realization reads as
 * a fault rather than as an unfinished detail.
 *
 * A question rather than a comparison every caller writes for itself. The
 * marker is exported for rendering, but its *shape* is only ever tested here —
 * the moment a call site writes `=== DO_UZUPELNIENIA`, changing the marker
 * means finding every comparison rather than editing one line.
 */
export function isPending(value: string): boolean {
  return value === DO_UZUPELNIENIA;
}

/**
 * A realization's place and date as a visitor sees them: joined where both
 * are known, reduced to whichever one is where only one is, and absent
 * entirely where neither has arrived yet from the client.
 *
 * Literal `[DO UZUPEŁNIENIA]` text on a published realization card or page
 * would read as a bug rather than as unfinished, so a pending value is
 * dropped rather than shown — unlike the footer's contact channels, which are
 * expected to look unfinished until the client's details arrive.
 */
export function miejsceITermin(realizacja: {
  place: string;
  date: string;
}): string | null {
  const znane = [realizacja.place, realizacja.date].filter(
    (wartosc) => !isPending(wartosc),
  );
  return znane.length > 0 ? znane.join(" · ") : null;
}

/**
 * A phone number as something a phone can dial.
 *
 * Spaces are how a Polish number is written and not something a dialler
 * accepts. It lives beside the number rather than at each place one is shown,
 * because the two pages that offer a number and the form that offers it after
 * a failed send must not each strip it their own way.
 *
 * Only ever called for a number the site knows — `tel:[DO UZUPEŁNIENIA]` dials
 * nothing and reads as a broken site rather than an unfinished one.
 */
export function telHref(numer: string): string {
  return `tel:${numer.replace(/\s/g, "")}`;
}

/**
 * An Instagram handle as the address of the profile it names.
 *
 * The leading `@` is how a handle is written for a person and is not part of
 * the URL. It lives beside the handle for the same reason `telHref` lives
 * beside the number: the contact list offers the profile to a visitor and the
 * home page's structured data offers it to a search engine, and the two must
 * not each strip the `@` their own way — a `sameAs` carrying `@` is a link to
 * a profile that does not exist.
 *
 * Only ever called for a handle the site knows.
 */
export function instagramHref(uchwyt: string): string {
  return `https://instagram.com/${uchwyt.replace(/^@/, "")}`;
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
      "Build na Vercelu nie zna własnej domeny - ustaw NEXT_PUBLIC_SITE_URL.",
    );
  }

  return "http://localhost:3000";
}

/**
 * One of the people who runs the business, with the number that reaches her.
 *
 * The name and the number are one fact rather than two lists kept in step,
 * because every place the site offers a way of calling has to say whose phone
 * it is. Two bare numbers under one "Telefon" label read as a switchboard,
 * which is precisely what `/o-nas` spends a screen establishing this is not.
 */
export interface Wlasciciel {
  name: string;
  phone: string;
}

/**
 * Who runs the business, in the order they are introduced.
 *
 * A pair rather than a single owner, and the reason this module holds a list
 * at all: the site is two people who both turn up at the venue, and a visitor
 * choosing who to call is choosing between named people rather than dialling
 * an office. Order is authored — it is the order both names appear in
 * everywhere they appear together, so the footer and the contact list cannot
 * disagree about who is named first.
 */
const WLASCICIELKI: readonly Wlasciciel[] = [
  { name: "Agnieszka Imioło", phone: "+48 505 964 523" },
  { name: "Joanna Woźniak", phone: "+48 516 833 449" },
];

/**
 * The first name, which is how a person is labelled beside her own number.
 *
 * "Telefon - Agnieszka" is what somebody deciding who to call actually reads,
 * and it is all a visitor is given: surnames are published on one page only,
 * the privacy policy, where RODO obliges them. Everywhere else a given name
 * is warmer and is the whole of what is needed to pick a number.
 *
 * Splitting on the first space is deliberately not cleverer than it needs to
 * be: it handles a Polish given name, and a name it would get wrong is a name
 * to write into `WLASCICIELKI` the way it should be read.
 */
export function imie(wlasciciel: Wlasciciel): string {
  return wlasciciel.name.split(" ")[0];
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
  cityGenitive: "Szczecina",
  serviceArea: ["Szczecin"],
  owners: WLASCICIELKI,
  email: "twoja.dekoracja.kontakt@gmail.com",
  instagram: "@twoja.dekoracja",
  /*
   * Held as the whole address rather than as a handle, because this profile
   * has none — Facebook issues a numeric `profile.php?id=…` URL until a page
   * claims a vanity name, and there is nothing to compose a link out of. If
   * the profile ever gains one, this becomes a handle and grows a helper
   * beside `instagramHref`; until then the honest shape is the URL itself.
   */
  facebook: "https://www.facebook.com/profile.php?id=61561290465565",
} as const;
