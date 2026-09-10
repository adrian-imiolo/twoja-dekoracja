import Image from "next/image";
import Link from "next/link";

import znak from "@/app/icon.png";
import { QuietLink } from "@/components/quiet-link";
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
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          {/*
           * The same badge the browser tab shows, reused rather than
           * re-derived — one asset, two conventions (`src/app/icon.png` is
           * also the favicon file Next serves automatically). Decorative next
           * to a wordmark that already names the site, so a screen reader
           * does not announce the link twice.
           */}
          <Image src={znak} alt="" width={56} height={56} className="shrink-0" />
          <span className="font-wordmark text-2xl tracking-[0.35em] text-blush-200 uppercase sm:text-3xl">
            {site.wordmark}
          </span>
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
          <QuietLink href="/realizacje">Realizacje</QuietLink>
          <QuietLink href="/o-nas">O nas</QuietLink>
          <QuietLink href="/faq">FAQ</QuietLink>
          <QuietLink href="/kontakt">Kontakt</QuietLink>
        </nav>
      </div>
    </header>
  );
}
