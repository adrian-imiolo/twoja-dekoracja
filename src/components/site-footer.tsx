import Link from "next/link";

import { site } from "@/lib/site";

/**
 * The last thing on every page: who this business is, and the one link RODO
 * requires to be reachable from anywhere.
 *
 * No registration numbers, because none exist — the business is działalność
 * nierejestrowana, with no NIP and no REGON to print. What stands in their
 * place is the owner's name and the region they work in, which is what a
 * visitor is actually checking for at the bottom of a page.
 */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-plum-800">
      <div className="page-shell flex flex-col gap-3 py-12 text-sm text-cream-50/70">
        <p className="font-display tracking-[0.3em] text-blush-200 uppercase">
          {site.wordmark}
        </p>
        <p>
          {site.tagline} — {site.city} i okolice.
        </p>
        <p>
          {site.owner} · tel. {site.phone} · {site.email} · Instagram{" "}
          {site.instagram}
        </p>
        {/*
         * In the footer rather than in the header nav, because it belongs to
         * every page and interests almost nobody until it interests them very
         * much. The footer is where a visitor looking for it already knows to
         * look, and it is the one place that is on every page including the
         * form they are about to submit.
         */}
        <p className="mt-2">
          <Link
            href="/polityka-prywatnosci"
            className="text-blush-300 underline underline-offset-4 transition-colors hover:text-blush-100"
          >
            Polityka prywatności
          </Link>
        </p>
      </div>
    </footer>
  );
}
