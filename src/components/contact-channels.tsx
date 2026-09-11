import { imie, instagramHref, site, telHref } from "@/lib/site";

/**
 * The ways of reaching this business that are not the form.
 *
 * Shared by the home page's closing band and by `/kontakt`, because a visitor
 * who has decided to call must not find a different number depending on which
 * page they decided it on. Only the arrangement differs between the two, which
 * is why the list's classes are the caller's business and nothing else is.
 */

/**
 * One way of getting in touch: what it is called, what a visitor reads, and
 * where tapping it goes.
 *
 * The address is held beside the value rather than derived from it at render,
 * because the two are not always the same string. A phone number is its own
 * label and `tel:` is a transformation of it; the Facebook profile has no
 * readable form at all — its address is `profile.php?id=61561290465565`, which
 * is not something to print at somebody. Separating the two lets a channel be
 * named in Polish and addressed in whatever shape the service actually uses.
 */
interface Kanal {
  etykieta: string;
  wartosc: string;
  adres: string;
}

/**
 * The channels, in the order someone deciding how to make contact meets them.
 *
 * Phones first, and one per person: the reason for showing any of this rather
 * than only the form is the visitor who would rather call than write, and that
 * visitor is choosing who to speak to. An unlabelled second number would read
 * as an overflow line for the first.
 *
 * Both names come from `site.owners` rather than being written out here, so
 * the order a visitor meets the two of them is the same order the footer and
 * `/o-nas` introduce them in — set once, in one place.
 */
const KANALY: readonly Kanal[] = [
  ...site.owners.map((wlascicielka) => ({
    etykieta: `Telefon — ${imie(wlascicielka)}`,
    wartosc: wlascicielka.phone,
    adres: telHref(wlascicielka.phone),
  })),
  {
    etykieta: "E-mail",
    wartosc: site.email,
    adres: `mailto:${site.email}`,
  },
  {
    etykieta: "Instagram",
    // Shown to a human with its leading "@", which the profile URL cannot have.
    wartosc: site.instagram,
    adres: instagramHref(site.instagram),
  },
  {
    etykieta: "Facebook",
    /*
     * The business's name rather than the address, because the address is a
     * numeric profile id. Every other channel here prints something a visitor
     * could copy down and use elsewhere; this one cannot, so it prints the
     * thing they are being taken to instead.
     */
    wartosc: site.name,
    adres: site.facebook,
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
          <a
            href={kanal.adres}
            className="mt-2 block text-lg text-cream-50 transition-colors hover:text-blush-200"
          >
            {kanal.wartosc}
          </a>
        </li>
      ))}
    </ul>
  );
}
