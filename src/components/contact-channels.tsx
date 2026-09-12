import type { ReactNode } from "react";

import {
  IkonaFacebooka,
  IkonaInstagrama,
  IkonaMaila,
  IkonaTelefonu,
} from "@/components/ui/channel-icons";
import { imie, instagramHref, site, telHref } from "@/lib/site";

/**
 * The ways of reaching this business that are not the form.
 *
 * Shared by the home page's closing band, by `/kontakt` and by the footer of
 * every page, because a visitor who has decided to call must not find a
 * different number depending on which page they decided it on. Only the
 * arrangement differs between the three, which is why the list's classes are
 * the caller's business and nothing else is.
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
  /*
   * Decoration over the label, not a replacement for it. Two of these are
   * brand marks a visitor recognises before they read anything, which is the
   * whole reason they are here — but a mark alone would leave the channel
   * unnamed for anyone who does not recognise it, so the text stays.
   */
  ikona: ReactNode;
  /*
   * Whether following this hands the visitor to somewhere that is not this
   * site, and so has to be opened beside it rather than over it. Decided per
   * channel rather than sniffed from the address at render, because the two
   * addresses that leave are not the only two that are not internal paths:
   * `tel:` and `mailto:` leave for another application entirely, and a new tab
   * for one of those is a blank tab left sitting on the visitor's desktop.
   *
   * It lives beside the channel rather than at the call site so that every
   * place offering these — the home page's closing band, `/kontakt` and the
   * footer — reads one decision instead of each repeating a rule of its own.
   */
  zewnetrzny: boolean;
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
    etykieta: `Telefon - ${imie(wlascicielka)}`,
    wartosc: wlascicielka.phone,
    adres: telHref(wlascicielka.phone),
    ikona: <IkonaTelefonu />,
    zewnetrzny: false,
  })),
  {
    etykieta: "E-mail",
    wartosc: site.email,
    adres: `mailto:${site.email}`,
    ikona: <IkonaMaila />,
    zewnetrzny: false,
  },
  {
    etykieta: "Instagram",
    // Shown to a human with its leading "@", which the profile URL cannot have.
    wartosc: site.instagram,
    adres: instagramHref(site.instagram),
    ikona: <IkonaInstagrama />,
    zewnetrzny: true,
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
    ikona: <IkonaFacebooka />,
    zewnetrzny: true,
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
            target={kanal.zewnetrzny ? "_blank" : undefined}
            /*
             * `noopener` so the profile cannot reach back through
             * `window.opener`; `noreferrer` so it is not told which page sent
             * the visitor. Both are named rather than left to the browser's
             * default, which only covers `noopener` and only in current ones.
             */
            rel={kanal.zewnetrzny ? "noopener noreferrer" : undefined}
            /*
             * Padded above and below rather than only spaced from the label,
             * so the thing a thumb lands on is taller than one line of text.
             * The padding takes the room the old margin gave it, so the
             * rhythm between label and value is unchanged.
             */
            className="mt-1 flex items-center gap-2.5 py-1 text-lg text-cream-50 transition-colors hover:text-blush-200"
          >
            <span className="text-blush-300">{kanal.ikona}</span>
            {kanal.wartosc}
            {/*
             * A link that swaps the tab out from under someone has to say so
             * before it is followed — WCAG 3.2.5. A sighted visitor reads
             * that from the brand mark; a screen reader is told in words.
             */}
            {kanal.zewnetrzny && (
              <span className="sr-only">(otwiera się w nowej karcie)</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
