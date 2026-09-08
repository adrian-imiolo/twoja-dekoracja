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
         * Every page the site has beyond the home page, in the order a visitor
         * uses them: the work first, then the person behind it, then the
         * questions that stand between them and writing, then writing.
         *
         * Four links is the whole site and also the point at which the row
         * stops fitting a narrow phone beside a wordmark whose letter-spacing
         * is not negotiable, so the nav wraps within itself rather than
         * pushing the header wider. The privacy policy is deliberately not
         * here — it lives in the footer, where someone looking for it already
         * looks, and where it does not take a quarter of the navigation from
         * the pages that sell the work.
         */}
        <nav
          aria-label="Główna"
          className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-8"
        >
          <Link
            href="/realizacje"
            className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
          >
            Realizacje
          </Link>
          <Link
            href="/o-nas"
            className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
          >
            O nas
          </Link>
          <Link
            href="/faq"
            className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
          >
            FAQ
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
