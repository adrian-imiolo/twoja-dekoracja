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
 * the caller's business — and why the footer's one-line rows are a switch
 * here rather than a second list of channels kept in step with this one.
 */

/**
 * One way of getting in touch: what kind of thing it is, whose it is, what a
 * visitor reads, and where tapping it goes.
 *
 * The address is held beside the value rather than derived from it at render,
 * because the two are not always the same string. A phone number is its own
 * label and `tel:` is a transformation of it; the Facebook profile has no
 * readable form at all — its address is `profile.php?id=61561290465565`, which
 * is not something to print at somebody. Separating the two lets a channel be
 * named in Polish and addressed in whatever shape the service actually uses.
 */
interface Kanal {
  /*
   * What kind of way in this is, as a visitor names it: "Telefon", "E-mail",
   * or the service a profile is on. Held apart from whose it is because the
   * two layouts below need them separately — the full one prints both as a
   * label, the compact one reads the kind to a screen reader and shows only
   * the name.
   */
  rodzaj: string;
  /*
   * Whose, where more than one person offers the same kind of channel. Only
   * the phones carry one: the site is two people who each answer their own
   * number, and a number without a name reads as a switchboard — which is
   * precisely what `/o-nas` spends a screen establishing this is not.
   */
  kto?: string;
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
 * The channel's name in full — "Telefon - Agnieszka", "E-mail" — for the
 * layout that sets it on a line of its own above the link.
 */
function etykieta(kanal: Kanal): string {
  return kanal.kto ? `${kanal.rodzaj} - ${kanal.kto}` : kanal.rodzaj;
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
    rodzaj: "Telefon",
    kto: imie(wlascicielka),
    wartosc: wlascicielka.phone,
    adres: telHref(wlascicielka.phone),
    ikona: <IkonaTelefonu />,
    zewnetrzny: false,
  })),
  {
    rodzaj: "E-mail",
    wartosc: site.email,
    adres: `mailto:${site.email}`,
    ikona: <IkonaMaila />,
    zewnetrzny: false,
  },
  {
    rodzaj: "Instagram",
    // Shown to a human with its leading "@", which the profile URL cannot have.
    wartosc: site.instagram,
    adres: instagramHref(site.instagram),
    ikona: <IkonaInstagrama />,
    zewnetrzny: true,
  },
  {
    rodzaj: "Facebook",
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

/**
 * Where an e-mail address may break if it has to: before the "@", so the two
 * halves a reader knows — the name and the provider — stay whole. Without a
 * break opportunity of its own, the address is broken wherever the line runs
 * out, which on a 320px phone in the closing band is "@g / mail.com". The
 * Instagram handle starts with "@" and has nothing before it to break after.
 */
function zLamaniemPrzedMalpa(wartosc: string): ReactNode {
  const malpa = wartosc.indexOf("@");
  if (malpa <= 0) return wartosc;

  return (
    <>
      {wartosc.slice(0, malpa)}
      <wbr />
      {wartosc.slice(malpa)}
    </>
  );
}

const ODNOSNIK =
  "flex items-center gap-2.5 text-cream-50 transition-colors hover:text-blush-200";

/*
 * Padded above and below rather than only spaced from the label, so the thing
 * a thumb lands on is 36px tall — a line of text plus enough padding to make
 * that up at either size, since the text is a step smaller on a phone and the
 * padding grows by the same amount to keep the target where it was.
 */
const ODNOSNIK_PELNY = `${ODNOSNIK} mt-1 py-1.5 text-base sm:py-1 sm:text-lg`;

/*
 * The same 36px target at one size everywhere: a footer row sits beside small
 * print rather than beside a heading, and 16px is what stands out from the
 * tagline and the copyright line without outgrowing the column on a phone.
 */
const ODNOSNIK_ZWARTY = `${ODNOSNIK} py-1.5 text-base`;

export function ContactChannels({
  className,
  zwarte = false,
}: {
  className: string;
  /*
   * One line per channel instead of a label over each link. The kind is read
   * to a screen reader only; a phone shows whose it is inline before the
   * number; the rest are what they look like — an address, a handle, a name
   * beside the mark of the service it is on. Five labelled rows were the
   * tallest thing on every page of the site once they reached the footer,
   * and a label reading "E-mail" over an e-mail address was telling a sighted
   * visitor nothing the mark and the "@" had not.
   */
  zwarte?: boolean;
}) {
  return (
    <ul className={className}>
      {KANALY.map((kanal) => (
        <li key={kanal.adres}>
          {!zwarte && (
            <span className="block text-xs tracking-[0.25em] text-blush-300 uppercase">
              {etykieta(kanal)}
            </span>
          )}
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
            className={zwarte ? ODNOSNIK_ZWARTY : ODNOSNIK_PELNY}
          >
            <span className="text-blush-300">{kanal.ikona}</span>
            {zwarte && (
              <>
                {/*
                 * What the row is, for whoever cannot see the mark: without it
                 * the Facebook row is a link called "Twoja Dekoracja" that
                 * opens in a new tab and says nothing about where to.
                 */}
                <span className="sr-only">{kanal.rodzaj}:</span>
                {/*
                 * Dimmed, so the number stays the thing the eye lands on, and
                 * given a minimum width so the two numbers under two names of
                 * different lengths line up as the column they are.
                 */}
                {kanal.kto && (
                  <span className="min-w-22 opacity-70">{kanal.kto}</span>
                )}
              </>
            )}
            {/*
             * The e-mail address is the longest thing on the site with no
             * space in it, and a flex item will not shrink below its content.
             * Left alone it sets the width of every column it sits in — the
             * footer's, `/kontakt`'s, the closing band's — and on a 320px
             * phone pushes each of them past the screen. `overflow-wrap:
             * anywhere` lets it break mid-word only where nothing else fits,
             * and `min-w-0` lets the flex item give up the width. A size down
             * on phones keeps it whole in the closing band on a 390px screen,
             * where at 18px it is a few pixels too wide.
             */}
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {zLamaniemPrzedMalpa(kanal.wartosc)}
            </span>
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
