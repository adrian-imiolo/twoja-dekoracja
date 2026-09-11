import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { CalloutPanel } from "@/components/ui/callout-panel";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { sharePreview } from "@/lib/metadata";
import { site } from "@/lib/site";
import { pytania } from "@content/faq";

/**
 * The page that answers the questions a visitor would otherwise have to make
 * contact to ask — which is the point: the hesitant ones never do, they leave.
 *
 * Every answer is visible on load. No accordion, no "read more". A question
 * whose answer is hidden behind a click is not an answer to someone scanning
 * the page in ten seconds, and `FAQPage` structured data describes what is on
 * the page rather than what a click would reveal — Google has been explicit
 * that content hidden behind an interaction is worth less to it.
 *
 * The questions themselves live in `content/faq` because the home page shows
 * three of them and the two pages must not disagree.
 */

const OPIS = `Cena, terminy, obszar działania, montaż i demontaż - odpowiedzi na najczęstsze pytania o dekoracje wesel i przyjęć w ${site.cityLocative}.`;

export const metadata: Metadata = {
  title: "Częste pytania",
  description: OPIS,
  ...sharePreview({
    path: "/faq",
    title: `Częste pytania - ${site.name}`,
    description: OPIS,
  }),
};

/**
 * The page's questions as schema.org data.
 *
 * Built from the same array the page renders, never from a second copy: a
 * search result that shows an answer the page does not contain is the one
 * failure mode of structured data that gets a site penalised rather than
 * ignored.
 */
const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: pytania.map((pozycja) => ({
    "@type": "Question",
    name: pozycja.pytanie,
    acceptedAnswer: {
      "@type": "Answer",
      text: pozycja.odpowiedz,
    },
  })),
};

export default function FaqPage() {
  return (
    <div className="page-shell py-20 sm:py-28">
      <JsonLd data={faqPageSchema} />

      <header className="max-w-2xl">
        <h1 className="font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
          Częste pytania
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-cream-50/85">{OPIS}</p>
      </header>

      {/*
       * A description list rather than a stack of headings: the pairing is the
       * content, and it is what a screen reader announces as a pair. Each entry
       * carries the question's id so a single answer can be linked directly —
       * the owner sends "here's how the rezerwacja works" far more often than
       * they send the whole page.
       */}
      <dl className="mt-16 max-w-3xl border-t border-plum-800">
        {pytania.map((pozycja) => (
          <div
            key={pozycja.id}
            id={pozycja.id}
            className="scroll-mt-12 border-b border-plum-800 py-10"
          >
            <dt className="font-display text-2xl leading-snug text-blush-200">
              {pozycja.pytanie}
            </dt>
            <dd className="mt-4 leading-relaxed text-cream-50/80">
              {pozycja.odpowiedz}
            </dd>
          </div>
        ))}
      </dl>

      {/*
       * The page exists to remove reasons not to write, so it ends by asking
       * for exactly that. A visitor who has read this far and still has a
       * question has one the page could not answer, which is the moment the
       * form is worth the most.
       */}
      <CalloutPanel
        as="section"
        className="mt-20 max-w-3xl px-8 py-12 sm:px-12"
      >
        <h2 className="font-display text-2xl leading-snug text-cream-50 sm:text-3xl">
          Nie ma tu Waszego pytania?
        </h2>
        <p className="mt-4 leading-relaxed text-cream-50/80">
          Napiszcie - odpowiadamy na wszystko, także zanim cokolwiek zostanie
          ustalone.
        </p>
        <p className="mt-8">
          <PrimaryCta href="/kontakt">Zadaj pytanie</PrimaryCta>
        </p>
      </CalloutPanel>
    </div>
  );
}
