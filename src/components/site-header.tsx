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
      </div>
    </header>
  );
}
