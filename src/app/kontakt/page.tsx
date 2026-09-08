import type { Metadata } from "next";

import { ContactChannels } from "@/components/contact-channels";
import { InquiryForm } from "@/components/inquiry-form";
import { sharePreview } from "@/lib/metadata";
import { site } from "@/lib/site";

/**
 * The page the whole site funnels into.
 *
 * The form is the point, and the channels beside it are not a fallback for it:
 * a good share of the people who decide to get in touch would rather call or
 * send an Instagram message than fill anything in, and a page that only offers
 * a form loses them silently. Both are above the fold on a phone for that
 * reason.
 */

const OPIS =
  "Napisz do nas — powiedz, co planujecie i kiedy, a odpiszemy, czy termin jest wolny.";

/**
 * What a search result shows, which the page's own lead deliberately does not
 * repeat: someone reading the page is already here and knows what the business
 * does, and someone reading the result does not.
 */
const META_OPIS = `Zapytaj o dekoracje weselne i okolicznościowe w ${site.cityLocative}. ${OPIS}`;

export const metadata: Metadata = {
  title: "Kontakt",
  description: META_OPIS,
  ...sharePreview({
    path: "/kontakt",
    title: `Kontakt — ${site.name}`,
    description: META_OPIS,
  }),
};

export default function KontaktPage() {
  return (
    <div className="page-shell py-20 sm:py-28">
      <h1 className="max-w-3xl font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
        Porozmawiajmy o Waszym przyjęciu
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-50/85">
        {OPIS} Zwykle odpisujemy tego samego albo następnego dnia.
      </p>

      {/*
       * The channels lead on a phone, where they sit above the form, and sit
       * beside it from the width at which both fit — the visitor who came to
       * call should not have to scroll past five inputs to find the number.
       */}
      <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-24">
        <section aria-labelledby="formularz" className="order-2 lg:order-1">
          <h2
            id="formularz"
            className="font-display text-2xl text-blush-200 sm:text-3xl"
          >
            Napisz do nas
          </h2>
          <div className="mt-8 max-w-xl">
            <InquiryForm />
          </div>
        </section>

        <section
          aria-labelledby="inne-kanaly"
          className="order-1 lg:order-2 lg:pt-1"
        >
          <h2
            id="inne-kanaly"
            className="font-display text-2xl text-blush-200 sm:text-3xl"
          >
            Albo po prostu zadzwoń
          </h2>
          <ContactChannels className="mt-8 grid gap-6" />
          <p className="mt-8 text-sm leading-relaxed text-cream-50/60">
            {site.serviceArea.join(" · ")}
          </p>
        </section>
      </div>
    </div>
  );
}
