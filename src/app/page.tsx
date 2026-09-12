import type { Metadata } from "next";
import Link from "next/link";

import { ContactChannels } from "@/components/contact-channels";
import { HeroMedia } from "@/components/hero-media";
import { JsonLd } from "@/components/json-ld";
import { RealizationCard } from "@/components/realization-card";
import { CalloutPanel } from "@/components/ui/callout-panel";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { QuietLink } from "@/components/ui/quiet-link";
import { localBusinessSchema } from "@/lib/local-business";
import { sharePreview } from "@/lib/metadata";
import { site } from "@/lib/site";
import { wybranePytania } from "@content/faq";
import { realizacje } from "@content/realizacje";

/**
 * The page a stranger from Google lands on.
 *
 * It has seconds to answer three questions — what this business does, where it
 * does it, and whether the work is any good — and then to hand the visitor on
 * to the work itself. Everything below is in that order: a photograph, a
 * sentence, the work, the questions people ask before writing, and a way to
 * write.
 */

/**
 * How many realizations the home page shows before sending the visitor on.
 *
 * Enough to prove the archive is real, few enough that the page still ends
 * somewhere. How they are laid out is `SIATKA`'s business, not this number's.
 */
const WYBRANE = 4;

/**
 * The grid "Wybrane realizacje" is shown in, and how wide a card in it
 * actually gets.
 *
 * The class list and the `sizes` string are one decision and are kept in one
 * place for the reason `/realizacje` gives for the same pairing: `next/image`
 * says nothing when the two disagree, it just serves a soft picture.
 *
 * Two columns rather than four: four across would make a card small enough
 * that the decoration in it stops being legible, which is the one thing a
 * visitor came to look at.
 */
const SIATKA = {
  className: "mt-12 grid grid-cols-1 gap-12 sm:mt-16 lg:grid-cols-2 lg:gap-16",
  sizes: "(min-width: 64rem) 34rem, 100vw",
} as const;

/**
 * The three questions, answered here rather than teased.
 *
 * A teaser that withholds its answers sends a hesitant visitor away to look
 * for them, so these three are answered in full on the page and `/faq` is
 * offered underneath for the rest. A question with its answer visible is also
 * what Google reads, and a list of bare questions is not.
 *
 * Which three, and why these: they are the ones a visitor is most likely to
 * leave over rather than ask about. Where the business works decides whether
 * the rest of the page is even relevant, the lead time decides whether they
 * are already too late, and setup and takedown is the thing people assume they
 * will be left holding.
 *
 * Named rather than sliced off the front of the FAQ, so `/faq` stays free to
 * order itself for someone reading the whole page — it leads with price, which
 * is the wrong thing to end the home page on.
 */
const PYTANIA = wybranePytania("obszar", "termin", "montaz");

export const metadata: Metadata = {
  description: site.description,
  ...sharePreview({
    path: "/",
    title: `${site.name} - ${site.tagline.toLowerCase()} w ${site.cityLocative}`,
    description: site.description,
  }),
};

/**
 * The business itself, described for a search engine.
 *
 * On the home page and only here: it describes the entity rather than the
 * document, so repeating it under every route would offer the same business
 * several times over and invite a crawler to decide which copy is canonical.
 *
 */
const pracowniaSchema = localBusinessSchema();

export default function HomePage() {
  const wybrane = realizacje.slice(0, WYBRANE);

  return (
    <>
      <JsonLd data={pracowniaSchema} />

      {/*
       * The band is sized by the copy standing in it, not by the photograph
       * behind it — which is what lets the eventual video drop in without
       * moving anything. `svh` rather than `vh` so a phone's collapsing
       * address bar does not leave the first screen taller than the screen.
       */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <HeroMedia />

        <div className="page-shell relative w-full py-20 sm:py-28">
          <p className="text-sm tracking-[0.25em] text-blush-300 uppercase">
            {site.city} i okolice
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight text-cream-50 sm:text-6xl">
            {site.tagline} w {site.cityLocative}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-50/85">
            Projektujemy i budujemy oprawę wesel, urodzin i przyjęć rodzinnych -
            od bramy ceremonii po ostatnią świecę na stole.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <PrimaryCta href="/realizacje">Zobacz realizacje</PrimaryCta>
            <Link
              href="/kontakt"
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
           * before launch, alongside `/o-nas`, which this section now hands
           * off to rather than trying to be.
           */}
          <h2 className="mt-6 font-display text-3xl leading-tight text-cream-50 sm:text-4xl">
            Pracownia dekoracji okolicznościowych
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream-50/80">
            Dekorujemy wesela i przyjęcia w {site.cityLocative} i okolicach.
            Przyjeżdżamy na salę, budujemy dekorację od zera i zabieramy ją po
            przyjęciu - tak, żeby jedyną rzeczą, o której trzeba pamiętać, było
            to, kogo posadzić przy którym stole.
          </p>
          <p className="mt-8 text-sm tracking-[0.2em] text-blush-300 uppercase">
            {site.city} i okolice
          </p>
          <p className="mt-8">
            <QuietLink href="/o-nas">Poznaj nas</QuietLink>
          </p>
        </div>
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

        {/*
         * The hero's button rather than a quiet link: four realizations are a
         * sample and the archive is the work, so this is the hand-off the page
         * is built to make, and as a caption under the last card it was
         * competing with the next section's heading and losing. The FAQ
         * teaser's link below stays quiet for the other half of that reason —
         * two bordered buttons on one screen share the attention this one
         * needs all of.
         *
         * No count in the label ("Wszystkie realizacje (7)"), tempting as it
         * is: at 320px the button is already 268px of a 272px column, and the
         * three extra characters push it past the gutter. The archive's own
         * page answers "how many" on arrival.
         */}
        <p className="mt-16 text-center">
          <PrimaryCta href="/realizacje">Wszystkie realizacje</PrimaryCta>
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
            <div key={pozycja.id}>
              <dt className="font-display text-xl text-cream-50">
                {pozycja.pytanie}
              </dt>
              <dd className="mt-3 leading-relaxed text-cream-50/75">
                {pozycja.odpowiedz}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-12">
          <QuietLink href="/faq">Wszystkie pytania</QuietLink>
        </p>
      </section>

      {/*
       * The one thing the site exists to produce, closing the page it opened.
       * It carries the channels rather than only pointing at `/kontakt`,
       * because the visitor who has read this far and would rather call should
       * not have to load another page to find the number.
       */}
      <section id="kontakt" className="page-shell scroll-mt-12 pb-24 sm:pb-32">
        <CalloutPanel className="px-8 py-16 text-center sm:px-16">
          <h2 className="font-display text-3xl leading-tight text-cream-50 sm:text-4xl">
            Zostaw nam wiadomość
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream-50/80">
            Napiszcie, co planujecie i kiedy - odpiszemy, czy termin jest wolny
            i co da się z niego zrobić.
          </p>

          <p className="mt-10">
            <PrimaryCta href="/kontakt">Wypełnij formularz</PrimaryCta>
          </p>

          {/*
           * Wrapping, because this band carries five channels — two named
           * phones, an address, and two profiles — and a single row of them
           * would either squeeze the email past legibility or push off the
           * side of a narrow laptop.
           */}
          <ContactChannels className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-8" />
        </CalloutPanel>
      </section>
    </>
  );
}
