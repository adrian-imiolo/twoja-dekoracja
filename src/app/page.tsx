import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HeroMedia } from "@/components/hero-media";
import { RealizationCard } from "@/components/realization-card";
import { coverAsOgImage } from "@/lib/metadata";
import { isPending, site } from "@/lib/site";
import {
  type Kategoria,
  realizacje,
  realizacjeInCategory,
} from "@content/realizacje";

/**
 * The page a stranger from Google lands on.
 *
 * It has seconds to answer three questions — what this business does, where it
 * does it, and whether the work is any good — and then to hand the visitor the
 * one of two roads they came for. Everything below is in that order: a
 * photograph, a sentence, the fork, the work, the questions people ask before
 * writing, and a way to write.
 */

/**
 * The two roads into the archive.
 *
 * This split is the reason the home page exists in the shape it does.
 * `/realizacje` is deliberately one page holding both categories, which is
 * right for ranking a thin archive and wrong for search intent: "dekoracje
 * weselne Szczecin" and "dekoracje urodzinowe Szczecin" are different queries
 * asked by different people. The headings here carry those queries, and each
 * sends its visitor straight to the section they meant.
 */
const DROGI: readonly {
  kategoria: Kategoria;
  heading: string;
  lead: string;
  cta: string;
}[] = [
  {
    kategoria: "wesela",
    heading: "Dekoracje weselne",
    lead: "Brama ceremonii, przejście, sala i stół prezydialny — cała oprawa jednego dnia, spójna od pierwszego zdjęcia do ostatniego.",
    cta: "Zobacz wesela",
  },
  {
    kategoria: "imprezy",
    heading: "Dekoracje urodzinowe i okolicznościowe",
    lead: "Urodziny, chrzciny, jubileusze i przyjęcia rodzinne — od ścianki za tortem po aranżację całej sali.",
    cta: "Zobacz imprezy",
  },
];

/**
 * How many realizations the home page shows before sending the visitor on.
 *
 * Enough to prove the archive is real, few enough that the page still ends
 * somewhere. How they are laid out is `SIATKA`'s business, not this number's.
 */
const WYBRANE = 4;

/**
 * The two-across grid both card sections use, and how wide a card in it
 * actually gets.
 *
 * The class list and the `sizes` string are one decision and are kept in one
 * place for the reason `/realizacje` gives for the same pairing: `next/image`
 * says nothing when the two disagree, it just serves a soft picture. Stating
 * them separately at each section would be the third and fourth place this
 * width is written down.
 *
 * Two columns rather than four, because two is the only arrangement that holds
 * at both counts these sections can take — four selected realizations once the
 * launch archive lands, and the two placeholder events until it does. Four
 * across would also make a card small enough that the decoration in it stops
 * being legible, which is the one thing a visitor came to look at.
 */
const SIATKA = {
  className: "mt-12 grid grid-cols-1 gap-12 sm:mt-16 lg:grid-cols-2 lg:gap-16",
  sizes: "(min-width: 64rem) 34rem, 100vw",
} as const;

/**
 * The three questions, answered here rather than teased.
 *
 * A teaser that withholds its answers sends a hesitant visitor away to look
 * for them, and `/faq` does not exist yet — so these three are the whole
 * answer, short enough not to bury the page. When the FAQ page lands, this
 * section gains a link to it and keeps the answers: a question with its answer
 * visible is also what Google reads, and a list of bare questions is not.
 *
 * PLACEHOLDER COPY, except the service area, which comes from `site`. The
 * answers below are plausible rather than confirmed and are deliberately
 * non-committal about lead times. The client confirms or rewrites all of them
 * before launch.
 */
const PYTANIA: readonly { pytanie: string; odpowiedz: string }[] = [
  {
    pytanie: "Gdzie pracujecie?",
    odpowiedz: `${site.city} i okolice — ${site.serviceArea
      .filter((miasto) => miasto !== site.city)
      .join(
        ", ",
      )}. Przy większych realizacjach dojeżdżamy również dalej, więc dalszy adres nie przekreśla rozmowy.`,
  },
  {
    pytanie: "Z jakim wyprzedzeniem rezerwować termin?",
    odpowiedz:
      "Terminy weselne w sezonie rozchodzą się z dużym wyprzedzeniem, przy mniejszych przyjęciach bywa, że wystarczy kilka tygodni. Najprościej napisać z datą — odpowiemy, czy jest jeszcze wolna.",
  },
  {
    pytanie: "Czy zajmujecie się montażem i demontażem dekoracji?",
    odpowiedz:
      "Tak. Przywozimy dekorację, składamy ją przed przyjęciem i zabieramy po nim, bez angażowania gości ani obsługi sali.",
  },
];

/**
 * One way of getting in touch.
 *
 * The address is a function of the value rather than a value beside it,
 * because the two must not be built independently: a `tel:` composed from the
 * placeholder dials nothing, and a tapped link that does nothing reads as a
 * broken site rather than an unfinished one. Keeping it a function means the
 * address is only ever composed for a value the site actually knows.
 */
interface Kanal {
  etykieta: string;
  wartosc: string;
  adres: (wartosc: string) => string;
}

/**
 * The channels, in the order someone deciding how to make contact meets them.
 *
 * Phone first: the design spec's whole reason for showing these rather than
 * only a form is the visitor who would rather call than write. All three are
 * outstanding client input and show as placeholders until they arrive, at
 * which point they become tappable with no change here.
 */
const KANALY: readonly Kanal[] = [
  {
    etykieta: "Telefon",
    wartosc: site.phone,
    // Spaces are how a Polish number is written and not something a dialler
    // accepts.
    adres: (numer) => `tel:${numer.replace(/\s/g, "")}`,
  },
  {
    etykieta: "E-mail",
    wartosc: site.email,
    adres: (adres) => `mailto:${adres}`,
  },
  {
    etykieta: "Instagram",
    wartosc: site.instagram,
    // Shown to a human with its leading "@", which the profile URL cannot have.
    adres: (uchwyt) => `https://instagram.com/${uchwyt.replace(/^@/, "")}`,
  },
];

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: site.name,
    url: "/",
    title: `${site.name} — ${site.tagline.toLowerCase()} w ${site.cityLocative}`,
    description: site.description,
    // The strongest work rather than a logo: whoever the link was sent to is
    // being asked to judge decorations, and a wordmark shows them none.
    images: realizacje.slice(0, 1).map(coverAsOgImage),
  },
  twitter: { card: "summary_large_image" },
};

export default function HomePage() {
  /*
   * The category's own work supplies the picture, so the fork shows what it
   * leads to. A category with nothing in it is dropped rather than shown as an
   * empty frame linking to an empty section — `flatMap` rather than a filter
   * because dropping it is what proves to the type checker that the survivors
   * have a cover.
   */
  const drogi = DROGI.flatMap((droga) => {
    const okladka = realizacjeInCategory(droga.kategoria)[0]?.cover;
    return okladka ? [{ ...droga, okladka }] : [];
  });

  const wybrane = realizacje.slice(0, WYBRANE);

  return (
    <>
      {/*
       * The band is sized by the copy standing in it, not by the photograph
       * behind it — which is what lets the eventual video drop in without
       * moving anything. `svh` rather than `vh` so a phone's collapsing
       * address bar does not leave the first screen taller than the screen.
       */}
      <section className="relative flex min-h-[78svh] items-end overflow-hidden">
        <HeroMedia />

        <div className="page-shell relative w-full py-20 sm:py-28">
          <p className="text-sm tracking-[0.25em] text-blush-300 uppercase">
            {site.serviceArea.slice(0, 2).join(" · ")} i okolice
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight text-cream-50 sm:text-6xl">
            {site.tagline} w {site.cityLocative}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-50/85">
            Projektujemy i budujemy oprawę wesel, urodzin i przyjęć rodzinnych —
            od bramy ceremonii po ostatnią świecę na stole.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/realizacje"
              className="border border-blush-300 px-8 py-4 text-sm tracking-[0.2em] text-blush-200 uppercase transition-colors hover:bg-blush-300 hover:text-plum-950"
            >
              Zobacz realizacje
            </Link>
            {/*
             * An address on this page rather than `/kontakt`, which does not
             * exist yet. It becomes that route's address when it does, and in
             * the meantime the site's one call to action leads somewhere real
             * instead of to a 404.
             */}
            <Link
              href="#kontakt"
              className="border border-plum-800 px-8 py-4 text-sm tracking-[0.2em] text-cream-50/85 uppercase transition-colors hover:border-blush-300 hover:text-blush-200"
            >
              Napisz do nas
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm tracking-[0.25em] text-blush-300 uppercase">
            Kim jesteśmy
          </p>
          {/*
           * PLACEHOLDER COPY — describes the service in the terms the design
           * spec assumes, and says nothing about the person behind it, because
           * the site does not know their name yet. Rewritten with the client
           * before launch, alongside `/o-nas`.
           */}
          <h2 className="mt-6 font-display text-3xl leading-tight text-cream-50 sm:text-4xl">
            Pracownia dekoracji okolicznościowych
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream-50/80">
            Dekorujemy wesela i przyjęcia w {site.cityLocative} i okolicach.
            Przyjeżdżamy na salę, budujemy dekorację od zera i zabieramy ją po
            przyjęciu — tak, żeby jedyną rzeczą, o której trzeba pamiętać, było
            to, kogo posadzić przy którym stole.
          </p>
          <p className="mt-8 text-sm tracking-[0.2em] text-blush-300 uppercase">
            {site.serviceArea.join(" · ")}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="co-dekorujemy"
        className="page-shell pb-20 sm:pb-28"
      >
        <h2
          id="co-dekorujemy"
          className="font-display text-3xl text-blush-200 sm:text-4xl"
        >
          Co dekorujemy
        </h2>

        <ul className={SIATKA.className}>
          {drogi.map((droga) => (
            <li key={droga.kategoria}>
              <Link
                href={`/realizacje#${droga.kategoria}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush-300"
              >
                <div className="relative aspect-3/2 overflow-hidden bg-plum-900">
                  <Image
                    src={droga.okladka.image}
                    /*
                     * Empty for the same reason the realization cards' covers
                     * are: the link is already named by the heading and the
                     * sentence below it, and a described photograph inside it
                     * would make a screen reader read the card twice.
                     */
                    alt=""
                    placeholder="blur"
                    fill
                    sizes={SIATKA.sizes}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <h3 className="mt-6 font-display text-2xl text-blush-200 transition-colors group-hover:text-blush-100 sm:text-3xl">
                  {droga.heading}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-cream-50/75">
                  {droga.lead}
                </p>
                <p className="mt-5 text-sm tracking-[0.2em] text-blush-300 uppercase">
                  {droga.cta}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="wybrane" className="page-shell pb-20 sm:pb-28">
        <h2
          id="wybrane"
          className="font-display text-3xl text-blush-200 sm:text-4xl"
        >
          Wybrane realizacje
        </h2>

        <ul className={SIATKA.className}>
          {wybrane.map((realizacja) => (
            <li key={realizacja.slug}>
              <RealizationCard realizacja={realizacja} sizes={SIATKA.sizes} />
            </li>
          ))}
        </ul>

        <p className="mt-16">
          <Link
            href="/realizacje"
            className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
          >
            Wszystkie realizacje
          </Link>
        </p>
      </section>

      <section
        aria-labelledby="czeste-pytania"
        className="page-shell pb-20 sm:pb-28"
      >
        <h2
          id="czeste-pytania"
          className="font-display text-3xl text-blush-200 sm:text-4xl"
        >
          Częste pytania
        </h2>

        <dl className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-3 lg:gap-12">
          {PYTANIA.map((pozycja) => (
            <div key={pozycja.pytanie}>
              <dt className="font-display text-xl text-cream-50">
                {pozycja.pytanie}
              </dt>
              <dd className="mt-3 leading-relaxed text-cream-50/75">
                {pozycja.odpowiedz}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/*
       * The one thing the site exists to produce. The form itself is a later
       * issue; until it lands this section is the contact — which is also why
       * it carries the channels rather than only pointing at them.
       */}
      <section id="kontakt" className="page-shell scroll-mt-12 pb-24 sm:pb-32">
        <div className="border border-plum-800 bg-plum-900 px-8 py-16 text-center sm:px-16">
          <h2 className="font-display text-3xl leading-tight text-cream-50 sm:text-4xl">
            Porozmawiajmy o Waszym przyjęciu
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream-50/80">
            Napiszcie, co planujecie i kiedy — odpiszemy, czy termin jest wolny
            i co da się z niego zrobić.
          </p>

          <ul className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-10">
            {KANALY.map((kanal) => (
              <li key={kanal.etykieta}>
                <KanalKontaktu kanal={kanal} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function KanalKontaktu({ kanal }: { kanal: Kanal }) {
  return (
    <span className="block">
      <span className="block text-xs tracking-[0.25em] text-blush-300 uppercase">
        {kanal.etykieta}
      </span>
      {isPending(kanal.wartosc) ? (
        <span className="mt-2 block text-cream-50/60">{kanal.wartosc}</span>
      ) : (
        <a
          href={kanal.adres(kanal.wartosc)}
          className="mt-2 block text-lg text-cream-50 transition-colors hover:text-blush-200"
        >
          {kanal.wartosc}
        </a>
      )}
    </span>
  );
}
