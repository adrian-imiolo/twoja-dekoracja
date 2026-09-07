import type { Metadata } from "next";
import Link from "next/link";

import { RealizationCard } from "@/components/realization-card";
import { coverAsOgImage } from "@/lib/metadata";
import { site } from "@/lib/site";
import {
  type Kategoria,
  realizacje,
  realizacjeInCategory,
} from "@content/realizacje";

/**
 * All the work, on one page, under two headings.
 *
 * Deliberately not two category pages. With three weddings and six other
 * events, splitting the archive gives Google two thin pages where one
 * substantial one ranks better, and a visitor who wants only weddings is one
 * anchor away rather than one page away. Revisit when the archive roughly
 * doubles.
 */

/**
 * The sections, in the order they are shown. Weddings lead because they are
 * the larger commission and the search term the business most wants to be
 * found for.
 *
 * The anchor is the category itself rather than a second string beside it:
 * `Kategoria`'s values are already lowercase ASCII, which is exactly what a
 * fragment needs, so the two cannot drift apart.
 */
const SEKCJE: readonly { kategoria: Kategoria; heading: string; lead: string }[] =
  [
    {
      kategoria: "wesela",
      heading: "Wesela",
      lead: "Dekoracje ślubne i weselne — od bramy ceremonii po salę.",
    },
    {
      kategoria: "imprezy",
      heading: "Imprezy",
      lead: "Urodziny, chrzciny, jubileusze i przyjęcia okolicznościowe.",
    },
  ];

export const metadata: Metadata = {
  title: "Realizacje",
  description: `Wesela i przyjęcia okolicznościowe, które dekorowaliśmy w ${site.cityLocative} i okolicach. Zdjęcia z każdej realizacji.`,
  alternates: { canonical: "/realizacje" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: site.name,
    url: "/realizacje",
    title: `Realizacje — ${site.name}`,
    description: `Wesela i przyjęcia okolicznościowe, które dekorowaliśmy w ${site.cityLocative} i okolicach.`,
    // The registry's order is authored with the strongest work first, so its
    // head is the right thing to put in front of whoever the link was sent to.
    images: realizacje.slice(0, 1).map(coverAsOgImage),
  },
  twitter: { card: "summary_large_image" },
};

/**
 * How a section's grid is laid out for the number of cards it holds.
 *
 * Two columns are skipped entirely, and that is the whole point: the archive
 * launches as three weddings and six other events, and three cards across two
 * columns strand one alone in the final row. Three columns divide both counts
 * exactly. Below `lg` there is a single large card per row, which is also what
 * "large and generously spaced" means on a laptop that is not full width.
 *
 * A shorter section gets fewer columns rather than a lone card floating at a
 * third of the page — and a section of one is capped instead, because a card
 * given the full measure stops reading as a card and starts reading as a
 * banner.
 *
 * **This is not a general rule against orphans, and should not be read as
 * one.** Three columns strand the last card of a section of four, five, seven
 * or eight; nothing here or in the test suite will say so. Centring an
 * incomplete final row is the general fix, and it costs a flex layout whose
 * card width has to restate the gap — which is worth paying for when a fourth
 * wedding arrives, and is not worth paying for a count the design spec fixes
 * at three and six. Both specs already say to revisit this page when the
 * archive roughly doubles; a section reaching four is that moment.
 *
 * The widest a card can get comes back with the columns rather than being
 * restated in the card component: it is the same decision, and `next/image`
 * silently serves a soft picture when the two disagree.
 */
function gridLayout(count: number): { className: string; sizes: string } {
  if (count >= 3) {
    return {
      className: "lg:grid-cols-3",
      sizes: "(min-width: 64rem) 22rem, 100vw",
    };
  }
  if (count === 2) {
    return {
      className: "lg:grid-cols-2",
      sizes: "(min-width: 64rem) 34rem, 100vw",
    };
  }
  return { className: "sm:max-w-xl", sizes: "(min-width: 40rem) 36rem, 100vw" };
}

export default function RealizacjePage() {
  /*
   * A category with nothing in it is dropped rather than rendered as a heading
   * over empty space — and dropped from the anchor nav with it, so the page
   * never offers a link to a section that is not there.
   */
  const sekcje = SEKCJE.map((sekcja) => ({
    ...sekcja,
    pozycje: realizacjeInCategory(sekcja.kategoria),
  })).filter((sekcja) => sekcja.pozycje.length > 0);

  return (
    <div className="page-shell py-16 sm:py-24">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
          Realizacje
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-cream-50/80">
          Wesela i przyjęcia okolicznościowe, które dekorowaliśmy w{" "}
          {site.cityLocative} i okolicach.
        </p>

        <nav
          aria-label="Kategorie realizacji"
          className="mt-8 flex justify-center gap-8"
        >
          {sekcje.map((sekcja) => (
            <Link
              key={sekcja.kategoria}
              href={`#${sekcja.kategoria}`}
              className="text-sm tracking-[0.25em] text-blush-300 uppercase transition-colors hover:text-blush-100"
            >
              {sekcja.heading}
            </Link>
          ))}
        </nav>
      </header>

      {sekcje.map((sekcja) => {
        const layout = gridLayout(sekcja.pozycje.length);

        return (
          <section
            key={sekcja.kategoria}
            aria-labelledby={sekcja.kategoria}
            className="mt-20 sm:mt-28"
          >
            <h2
              id={sekcja.kategoria}
              className="scroll-mt-12 font-display text-3xl text-blush-200 sm:text-4xl"
            >
              {sekcja.heading}
            </h2>
            <p className="mt-3 max-w-xl text-cream-50/75">{sekcja.lead}</p>

            <ul
              className={`mt-12 grid grid-cols-1 gap-12 sm:mt-16 sm:gap-16 ${layout.className}`}
            >
              {sekcja.pozycje.map((realizacja) => (
                <li key={realizacja.slug}>
                  <RealizationCard
                    realizacja={realizacja}
                    sizes={layout.sizes}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
