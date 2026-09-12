import Image from "next/image";
import Link from "next/link";

import znak from "@/app/icon.png";
import { ContactChannels } from "@/components/contact-channels";
import { QuietLink } from "@/components/ui/quiet-link";
import { Wordmark } from "@/components/ui/wordmark";
import { STRONY } from "@/lib/nawigacja";
import { site } from "@/lib/site";

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
 * to link.
 */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-plum-800">
      {/*
       * One column on a phone, the identity over two columns from a tablet
       * up, and three columns only on a wide desktop. Collapsing rather than
       * letting columns wrap is what keeps a footer full of links from turning
       * into a ragged block: everything starts at one edge and reads top to
       * bottom.
       *
       * Three columns wait for `xl` rather than `lg` because two things here
       * are one word each and cannot wrap gracefully: the letter-spaced
       * wordmark and the e-mail address at the size `ContactChannels` sets
       * it. A laptop-width screen split three ways breaks the wordmark over
       * two lines, which is the one thing the brand does not permit. The
       * contact column stays the widest for the same reason.
       */}
      <div className="page-shell grid gap-12 py-14 sm:grid-cols-[1fr_1.8fr] sm:gap-10 xl:grid-cols-[1.3fr_1fr_1.5fr] xl:gap-16">
        <div className="flex flex-col gap-4 text-sm text-cream-50/70 sm:col-span-2 xl:col-span-1">
          <Link
            href="/"
            className="flex items-center gap-3 self-start transition-opacity hover:opacity-90"
          >
            {/*
             * The header's badge again, smaller: the same asset that is also
             * the favicon. Decorative beside a wordmark that names the site,
             * so a screen reader does not announce the link twice.
             */}
            <Image
              src={znak}
              alt=""
              width={48}
              height={48}
              className="shrink-0"
            />
            {/* Fluid as in the header: beside the badge on a 320px phone the
             * name only fits whole at 16px. */}
            <Wordmark className="text-[clamp(1rem,5vw,1.25rem)]" />
          </Link>
          <p className="leading-relaxed">
            {site.tagline}
            <span className="block">{site.city} i okolice</span>
          </p>
        </div>

        <nav aria-label="Na stronie">
          <h2 className="font-display text-lg text-blush-200">Na stronie</h2>
          {/*
           * Each link its own row with room above and below, because on a
           * phone this column is a stack of tap targets rather than a line of
           * text — a row of them would be the header's nav again, and the
           * header's nav is one scroll away. The link brings its own target
           * height; the row's padding is what keeps two neighbouring targets
           * from touching, and stretches each across the column's width.
           */}
          <ul className="mt-4 flex flex-col">
            {STRONY.map((strona) => (
              <li key={strona.sciezka} className="py-2.5">
                <QuietLink href={strona.sciezka} className="w-full">
                  {strona.nazwa}
                </QuietLink>
              </li>
            ))}
            {/*
             * In the footer rather than in the header nav, because it belongs
             * to every page and interests almost nobody until it interests
             * them very much. The footer is where a visitor looking for it
             * already knows to look, and it is the one place that is on every
             * page including the form they are about to submit.
             */}
            <li className="py-2.5">
              <QuietLink href="/polityka-prywatnosci" className="w-full">
                Polityka prywatności
              </QuietLink>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg text-blush-200">Kontakt</h2>
          <ContactChannels className="mt-4 grid gap-5" />
        </div>
      </div>
    </footer>
  );
}
