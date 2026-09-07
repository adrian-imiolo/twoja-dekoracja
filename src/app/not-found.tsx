import Link from "next/link";

import { realizacje } from "@content/realizacje";

/**
 * Every address the site does not publish.
 *
 * Two roads lead here and both matter: a mistyped address, and a shared link
 * to a realization that has since been renamed — `/realizacje/[slug]` is
 * closed with `dynamicParams = false`, so a stale link is how a stranger most
 * often meets this page. Sending that stranger back to the home page to start
 * again is a dead end, so the page offers the work itself instead.
 *
 * Rendered inside the root layout, which is what keeps the header, the footer
 * and the plum ground — a 404 stripped of them reads as a broken deployment
 * rather than a wrong turn.
 */

/**
 * How many realizations the page offers.
 *
 * The registry's order is authored with the strongest work first, so the top
 * of it is what belongs in front of someone whose link went nowhere. Capped
 * because the archive only grows: an uncapped list would eventually bury the
 * one sentence on the page that explains what happened.
 */
const MAX_SUGGESTIONS = 3;

export default function NotFound() {
  const suggested = realizacje.slice(0, MAX_SUGGESTIONS);

  return (
    <div className="page-shell py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm tracking-[0.25em] text-blush-300 uppercase">
          Nie znaleziono strony
        </p>
        <h1 className="mt-5 font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
          Tej strony u nas nie ma
        </h1>
        {/*
         * Impersonal, and not because it is more elegant: Polish inflects the
         * second person past tense for gender, so "trafiłeś" and "trafiłaś"
         * force the page to guess who is reading it. Half the time it would
         * guess wrong, on the page where the visitor is already lost.
         */}
        <p className="mt-6 text-lg leading-relaxed text-cream-50/80">
          Adres mógł się zmienić albo link jest już nieaktualny. Poniżej
          czekają nasze realizacje — to dobre miejsce, żeby zacząć.
        </p>
      </div>

      <ul className="mx-auto mt-12 grid max-w-2xl gap-4">
        {suggested.map((realizacja) => (
          <li key={realizacja.slug}>
            <Link
              href={`/realizacje/${realizacja.slug}`}
              className="block border border-plum-800 px-6 py-5 transition-colors hover:border-blush-300 hover:bg-plum-900"
            >
              <span className="font-display text-xl text-blush-200">
                {realizacja.title}
              </span>
              <span className="mt-1 block text-sm text-cream-50/70">
                {realizacja.place} · {realizacja.date}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-center">
        <Link
          href="/"
          className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
        >
          Strona główna
        </Link>
      </p>
    </div>
  );
}
