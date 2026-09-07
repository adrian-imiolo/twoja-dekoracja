import Link from "next/link";

import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-plum-800">
      <div className="page-shell flex items-center justify-between py-8">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.35em] text-blush-200 uppercase transition-colors hover:text-blush-100 sm:text-2xl"
        >
          {site.wordmark}
        </Link>

        {/*
         * One link, not a navigation bar. The site has a single page worth
         * linking to so far, and `/realizacje` would otherwise be reachable
         * only by typing its address — an orphan page is invisible to a
         * visitor and nearly so to a crawler. The rest of the navigation
         * arrives with the pages it would point at.
         */}
        <Link
          href="/realizacje"
          className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
        >
          Realizacje
        </Link>
      </div>
    </header>
  );
}
