import Link from "next/link";

import { PrimaryCta } from "@/components/ui/primary-cta";
import { sasiednieRealizacje, type Realizacja } from "@content/realizacje";

/**
 * The way on from the bottom of a realization.
 *
 * Seven photographs down on a phone, the header scrolled away long ago and the
 * page would otherwise hand straight to the footer. That is the worst place
 * to lose someone: they have just looked at every photograph of one event,
 * which is the moment they most want the next one.
 *
 * Previous and next rather than only a way back: the back link answers "get
 * me out", the neighbours answer "show me another", and the second is what
 * this site is for. Each link names the event it leads to rather than only a
 * direction, so the choice is between two events, not two arrows. The ends
 * drop the missing side rather than wrapping — see `sasiednieRealizacje`.
 *
 * A band here rather than a sticky header, which would solve the same problem
 * by permanently covering part of the photographs that are the thing being
 * sold.
 */
export function RealizationNav({ slug }: { slug: string }) {
  const { poprzednia, nastepna } = sasiednieRealizacje(slug);

  return (
    <nav
      aria-label="Inne realizacje"
      className="mx-auto mt-16 max-w-5xl border-t border-plum-800 pt-10 sm:mt-24 sm:pt-12"
    >
      {/*
       * Two columns from `sm` up, one below: at 390px two titles side by side
       * would squeeze into a few characters per line each. On one column the
       * order stays previous-then-next so reading down is reading forward.
       */}
      <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
        {poprzednia ? (
          <NeighbourLink kierunek="poprzednia" realizacja={poprzednia} />
        ) : null}
        {/*
         * Pinned to the right-hand column so the first event's lone "next"
         * still sits where "next" sits everywhere else, rather than sliding
         * into the empty "previous" slot.
         */}
        {nastepna ? (
          <NeighbourLink kierunek="nastepna" realizacja={nastepna} />
        ) : null}
      </div>

      {/*
       * The one loud thing in the band. The neighbours are a choice between
       * two named events and read as titles; this is the way out of the choice
       * altogether, which is what the visitor who has stopped caring about
       * this event needs to find without hunting for it.
       */}
      <p className="mt-10 text-center sm:mt-12">
        <PrimaryCta href="/realizacje">Wszystkie realizacje</PrimaryCta>
      </p>
    </nav>
  );
}

/**
 * The direction decides both what the eyebrow says and which column the link
 * sits in, so they cannot be combined the wrong way round.
 */
const KIERUNEK = {
  poprzednia: { etykieta: "Poprzednia realizacja", klasy: "" },
  nastepna: {
    etykieta: "Następna realizacja",
    klasy: "sm:col-start-2 sm:text-right",
  },
} as const;

function NeighbourLink({
  kierunek,
  realizacja,
}: {
  kierunek: keyof typeof KIERUNEK;
  realizacja: Realizacja;
}) {
  const { etykieta, klasy } = KIERUNEK[kierunek];

  return (
    <Link
      href={`/realizacje/${realizacja.slug}`}
      className={`group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush-300 ${klasy}`}
    >
      <span className="block text-xs tracking-[0.25em] text-blush-300/80 uppercase">
        {etykieta}
      </span>
      <span className="mt-2 block font-display text-2xl text-blush-200 transition-colors group-hover:text-blush-100">
        {realizacja.title}
      </span>
    </Link>
  );
}
