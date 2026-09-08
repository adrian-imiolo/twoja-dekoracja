import Link from "next/link";

import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-plum-800">
      {/*
       * Wrapping rather than shrinking, because the wordmark's letter-spacing
       * is the brand and squeezing it is not an option. On the narrowest phone
       * the navigation drops to its own line; everywhere else the row holds.
       */}
      <div className="page-shell flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-8">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.35em] text-blush-200 uppercase transition-colors hover:text-blush-100 sm:text-2xl"
        >
          {site.wordmark}
        </Link>

        {/*
         * Two links, still not a navigation bar. These are the only pages that
         * exist beyond the home page, and each would otherwise be reachable
         * only from within the page body — which puts `/kontakt` behind a
         * scroll on every visit, on the one route the site is built to reach.
         * The rest of the navigation arrives with the pages it would point at.
         */}
        <nav aria-label="Główna" className="flex items-center gap-6 sm:gap-10">
          <Link
            href="/realizacje"
            className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
          >
            Realizacje
          </Link>
          <Link
            href="/kontakt"
            className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
          >
            Kontakt
          </Link>
        </nav>
      </div>
    </header>
  );
}
