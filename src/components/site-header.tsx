import Image from "next/image";
import Link from "next/link";

import znak from "@/app/icon.png";
import { HeaderMenu } from "@/components/header-menu";
import { QuietLink } from "@/components/ui/quiet-link";
import { Wordmark } from "@/components/ui/wordmark";
import { STRONY } from "@/lib/nawigacja";

export function SiteHeader() {
  return (
    <header className="border-b border-plum-800">
      {/*
       * Below `sm` the four pages go behind a "Menu" button. Wrapped under the
       * wordmark they took two rows and a third of a 320px screen before the
       * page began, and a button is the only arrangement that gives that
       * screen back: a 2×2 grid is still two rows. From `sm` up the row holds
       * without it, and the button is not shown.
       *
       * The button needs room on the wordmark's row, and at 320px that row is
       * already full. The badge gives way rather than the wordmark, whose
       * letter-spacing is the brand and is not negotiable. Shrinking it enough
       * to fit a button beside the badge would take it to 11.5px, under the
       * 12px the suite reads as legible. The badge is still in the browser
       * tab, in the footer, and here from `sm` up.
       */}
      <div className="page-shell flex flex-wrap items-center justify-between gap-x-3 gap-y-4 py-8 sm:gap-x-6">
        {/*
         * Without the badge the link is only as tall as the wordmark's line,
         * so below `sm` it takes the button's 44px instead: a tap target on
         * its own, and the same height as the other half of the row.
         */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 max-sm:min-h-11"
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
            className="shrink-0 max-sm:hidden"
          />
          {/*
           * Scales with the screen up to its full size rather than stepping
           * at a breakpoint, because the room beside the menu button runs out
           * gradually. At 320px it is 16px, which leaves the button a few
           * pixels to spare, and on a 390px phone 19.5px.
           */}
          <Wordmark className="text-[clamp(1rem,5vw,1.5rem)] sm:text-3xl" />
        </Link>

        {/*
         * From `sm` up, a row that wraps within itself rather than pushing the
         * header wider. The row gap is set by the links' tap boxes, not their
         * text: each is 36px tall on a 20px line, so two rows need at least
         * 16px between the lines before the boxes stop overlapping.
         *
         * Below `sm`, the open panel stacks one link per row across its full
         * width, as the footer's list does. Each row is a 44px target, the
         * size a menu a thumb opened on purpose is held to, with the 36px
         * link's margin trick undone so the rows touch rather than overlap.
         */}
        <HeaderMenu className="flex flex-wrap items-center gap-x-6 gap-y-5 sm:gap-x-8">
          {STRONY.map((strona) => (
            <QuietLink
              key={strona.sciezka}
              href={strona.sciezka}
              className="max-sm:my-0 max-sm:block max-sm:py-3"
            >
              {strona.nazwa}
            </QuietLink>
          ))}
        </HeaderMenu>
      </div>
    </header>
  );
}
