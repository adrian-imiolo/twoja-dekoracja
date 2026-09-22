import Image from "next/image";
import Link from "next/link";

import znak from "@/app/icon.png";
import { HEADER_HOME_LINK_ID } from "@/components/back-to-top";
import { HeaderMenu } from "@/components/header-menu";
import { NavLink } from "@/components/ui/nav-link";
import { Wordmark } from "@/components/ui/wordmark";
import { STRONY } from "@/lib/nawigacja";

export function SiteHeader() {
  return (
    <header className="border-b border-plum-800">
      {/*
       * Below `sm` the four pages go behind a menu button. Wrapped under the
       * wordmark they took two rows and a third of a 320px screen before the
       * page began, and a button is the only arrangement that gives that
       * screen back: a 2×2 grid is still two rows. From `sm` up the row holds
       * without it, and the button is not shown.
       *
       * Below `sm` the badge, the wordmark and the 44px icon button share one
       * row, and at 320px that row is 272px. The badge shrinks to 32px and
       * the wordmark gives up size, never its letter-spacing, which is the
       * brand. What the row can't do is lose the badge, the other half of the
       * brand, or push the wordmark under the 12px the suite reads as legible.
       */}
      <div className="page-shell flex flex-wrap items-center justify-between gap-x-3 gap-y-4 py-8 sm:gap-x-6">
        {/*
         * The 32px badge is shorter than the button, so below `sm` the link
         * takes the button's 44px: a tap target on its own, and the same
         * height as the other half of the row.
         */}
        <Link
          id={HEADER_HOME_LINK_ID}
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
            className="shrink-0 max-sm:size-8"
          />
          {/*
           * Scales with the screen up to its full size rather than stepping
           * at a breakpoint, because the room beside the badge and the button
           * runs out gradually. The row's fixed parts (page padding, badge,
           * button, gaps) take a constant 148px, so the room left is the
           * viewport minus a constant, which a plain `vw` can't track. The
           * slope and offset are fitted to that room so 320px is the tightest
           * width: 13.5px with 2.5px to spare, 18.75px on a 390px phone, and
           * the full 24px from 460px.
           */}
          <Wordmark className="text-[clamp(0.75rem,7.5vw_-_10.5px,1.5rem)] sm:text-3xl" />
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
            <NavLink
              key={strona.sciezka}
              href={strona.sciezka}
              className="max-sm:my-0 max-sm:block max-sm:py-3"
            >
              {strona.nazwa}
            </NavLink>
          ))}
        </HeaderMenu>
      </div>
    </header>
  );
}
