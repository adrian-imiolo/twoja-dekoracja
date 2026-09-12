import Image from "next/image";
import Link from "next/link";

import znak from "@/app/icon.png";
import { ContactChannels } from "@/components/contact-channels";
import { QuietLink } from "@/components/ui/quiet-link";
import { Wordmark } from "@/components/ui/wordmark";
import { STRONY } from "@/lib/nawigacja";
import { site } from "@/lib/site";

/*
 * Fixed when the site is built, which is when every one of its pages is
 * rendered. A site that gains a realization or two a year is rebuilt at least
 * that often, so the year keeps up without a line of script to move it at
 * midnight — and a build that has not happened this year is a site nobody
 * has touched this year, which is the honest thing for the line to say.
 */
const ROK = new Date().getFullYear();

/**
 * The last thing on every page, and the second real way out of it: who this
 * business is, where else on the site to go, and every way of reaching them
 * as a link that works — including the one RODO requires to be reachable from
 * anywhere.
 *
 * No registration numbers, because none exist — the business is działalność
 * nierejestrowana, with no NIP and no REGON to print. What stands in their
 * place is the owners' given names, the tagline and the region they work in,
 * which is what a visitor is actually checking for at the bottom of a page.
 * Surnames appear on one page only — the privacy policy, where RODO obliges
 * them — and the given names arrive here through `ContactChannels`, labelling
 * each number with whose it is.
 *
 * The channels are `ContactChannels` outright rather than a footer-sized copy
 * of them. A visitor who reaches the bottom of a page on a phone and wants to
 * call has to find the same number, under the same name, opening the same way
 * as the closing band and `/kontakt` — and one list rendered three times is
 * the only way that stays true. It is also what puts Facebook here: a numeric
 * profile id is nothing to print as text, but it is a perfectly good address
 * to link. What the footer asks for is the compact arrangement: a row per
 * channel, so the column is as tall as the site's navigation beside it rather
 * than twice that.
 */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-plum-800">
      <div className="page-shell pt-10 pb-6 sm:pt-12">
        {/*
         * One column on a phone; the identity across the top with the two
         * link columns beneath it from a tablet up; and from a laptop, the
         * identity on the left with both link columns gathered at the right
         * edge. Gathering them is the point: sized to their content and
         * pushed to the edge, they leave the empty width on the inside of the
         * row, where it reads as room around the wordmark rather than as a
         * column somebody forgot to fill.
         *
         * Collapsing rather than letting columns wrap is what keeps a footer
         * full of links from turning into a ragged block: everything starts
         * at one edge and reads top to bottom.
         */}
        <div className="grid gap-10 sm:grid-cols-[auto_1fr] sm:gap-x-12 lg:grid-cols-[1fr_auto_auto] lg:gap-x-20">
          <div className="flex flex-col items-start gap-4 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              {/*
               * The header's badge again, smaller: the same asset that is also
               * the favicon. Decorative beside a wordmark that names the site,
               * so a screen reader does not announce the link twice.
               */}
              <Image
                src={znak}
                alt=""
                width={40}
                height={40}
                className="shrink-0"
              />
              {/* Fluid as in the header: beside the badge on a 320px phone the
               * name only fits whole at 16px. */}
              <Wordmark className="text-[clamp(1rem,5vw,1.25rem)]" />
            </Link>
            <p className="text-sm leading-relaxed text-cream-50/70">
              {site.tagline}
              <span className="block">{site.city} i okolice</span>
            </p>
          </div>

          {/*
           * Both headings take the badge's height and centre in it, so that
           * across the row they sit on the wordmark's line rather than a
           * little above it — the one alignment a reader notices without
           * being able to say what is off.
           */}
          <nav aria-label="Na stronie">
            <h2 className="font-display text-lg leading-10 text-blush-200">
              Na stronie
            </h2>
            {/*
             * Each link its own row, because on a phone this column is a
             * stack of tap targets rather than a line of text — a row of
             * them would be the header's nav again, and the header's nav is
             * one scroll away. The link brings its own 36px target; the
             * row's padding is exactly what lets two neighbouring targets
             * meet without overlapping, and stretches each across the column.
             */}
            <ul className="mt-1">
              {STRONY.map((strona) => (
                <li key={strona.sciezka} className="py-2">
                  <QuietLink href={strona.sciezka} className="w-full">
                    {strona.nazwa}
                  </QuietLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-lg leading-10 text-blush-200">
              Kontakt
            </h2>
            <ContactChannels className="mt-1" zwarte />
          </div>
        </div>

        {/*
         * The strip that says the page is over: the smallest print on it, set
         * off by a rule. The privacy policy lives here rather than among the
         * site's pages, because it belongs to every page and interests almost
         * nobody until it interests them very much — and the bottom of the
         * footer is where a visitor looking for it already knows to look, on
         * every page including the form they are about to submit. Beside the
         * copyright line it is also out of the navigation, which then lists
         * the same four pages as the header and nothing that is not one.
         */}
        <div className="mt-8 flex flex-col items-start gap-2 border-t border-plum-800/70 pt-4 text-sm text-cream-50/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ROK} {site.name}
          </p>
          {/* The same 36px target as every other link here, on a 20px line. */}
          <Link
            href="/polityka-prywatnosci"
            className="-my-2 inline-block py-2 text-cream-50/75 transition-colors hover:text-blush-200"
          >
            Polityka prywatności
          </Link>
        </div>
      </div>
    </footer>
  );
}
