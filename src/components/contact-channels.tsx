import { isPending, site, telHref } from "@/lib/site";

/**
 * The ways of reaching this business that are not the form.
 *
 * Shared by the home page's closing band and by `/kontakt`, because a visitor
 * who has decided to call must not find a different number depending on which
 * page they decided it on. Only the arrangement differs between the two, which
 * is why the list's classes are the caller's business and nothing else is.
 */

/**
 * One way of getting in touch.
 *
 * The address is a function of the value rather than a value beside it,
 * because the two must not be built independently: a `tel:` composed from the
 * placeholder dials nothing, and a tapped link that does nothing reads as a
 * broken site rather than an unfinished one. Keeping it a function means the
 * address is only ever composed for a value the site actually knows.
 */
interface Kanal {
  etykieta: string;
  wartosc: string;
  adres: (wartosc: string) => string;
}

/**
 * The channels, in the order someone deciding how to make contact meets them.
 *
 * Phone first: the reason for showing these at all, rather than only a form,
 * is the visitor who would rather call than write. All three are outstanding
 * client input and show as placeholders until they arrive, at which point they
 * become tappable with no change here.
 */
const KANALY: readonly Kanal[] = [
  {
    etykieta: "Telefon",
    wartosc: site.phone,
    adres: telHref,
  },
  {
    etykieta: "E-mail",
    wartosc: site.email,
    adres: (adres) => `mailto:${adres}`,
  },
  {
    etykieta: "Instagram",
    wartosc: site.instagram,
    // Shown to a human with its leading "@", which the profile URL cannot have.
    adres: (uchwyt) => `https://instagram.com/${uchwyt.replace(/^@/, "")}`,
  },
];

export function ContactChannels({ className }: { className: string }) {
  return (
    <ul className={className}>
      {KANALY.map((kanal) => (
        <li key={kanal.etykieta}>
          <span className="block text-xs tracking-[0.25em] text-blush-300 uppercase">
            {kanal.etykieta}
          </span>
          {isPending(kanal.wartosc) ? (
            <span className="mt-2 block text-cream-50/60">{kanal.wartosc}</span>
          ) : (
            <a
              href={kanal.adres(kanal.wartosc)}
              className="mt-2 block text-lg text-cream-50 transition-colors hover:text-blush-200"
            >
              {kanal.wartosc}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
