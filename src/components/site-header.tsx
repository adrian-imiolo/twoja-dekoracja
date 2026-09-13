import Image from "next/image";
import Link from "next/link";

import znak from "@/app/icon.png";
import { QuietLink } from "@/components/ui/quiet-link";
import { Wordmark } from "@/components/ui/wordmark";
import { STRONY } from "@/lib/nawigacja";

export function SiteHeader() {
  return (
    <header className="border-b border-plum-800">
      {/*
       * Wrapping rather than shrinking, because the wordmark's letter-spacing
       * is the brand and squeezing it is not an option. On a phone the
       * navigation drops to its own line; everywhere else the row holds.
       */}
      <div className="page-shell flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-8">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          {/*
           * The same badge the browser tab shows, reused rather than
           * re-derived: one asset, two conventions (`src/app/icon.png` is
           * also the favicon file Next serves automatically). Decorative next
           * to a wordmark that already names the site, so a screen reader
           * does not announce the link twice.
           */}
          <Image
            src={znak}
            alt=""
            width={56}
            height={56}
            className="shrink-0"
          />
          {/*
           * Scales with the screen up to its full size rather than stepping
           * at a breakpoint, because the room beside the badge runs out
           * gradually. At 320px the whole name fits beside it at 16px and
           * no bigger, on a 390px phone at 20px.
           */}
          <Wordmark className="text-[clamp(1rem,5vw,1.5rem)] sm:text-3xl" />
        </Link>

        {/*
         * Four links is the whole site and also the point at which the row
         * stops fitting a narrow phone beside a wordmark whose letter-spacing
         * is not negotiable, so the nav wraps within itself rather than
         * pushing the header wider. The row gap is set by the links' tap
         * boxes, not their text: each is 36px tall on a 20px line, so two
         * rows need at least 16px between the lines before the boxes stop
         * overlapping, and a little more before a thumb can tell them apart.
         */}
        <nav
          aria-label="Główna"
          className="flex flex-wrap items-center gap-x-6 gap-y-5 sm:gap-x-8"
        >
          {STRONY.map((strona) => (
            <QuietLink key={strona.sciezka} href={strona.sciezka}>
              {strona.nazwa}
            </QuietLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
