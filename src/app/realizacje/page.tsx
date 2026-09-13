import type { Metadata } from "next";

import { RealizationCard } from "@/components/realization-card";
import { CalloutPanel } from "@/components/ui/callout-panel";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { sharePreview } from "@/lib/metadata";
import { gridLayout } from "@/lib/realizacje-grid";
import { site } from "@/lib/site";
import { realizacje } from "@content/realizacje";

/**
 * All the work, in one grid.
 *
 * Not split into Wesela / Imprezy sections. That split reads badly at the
 * archive's shape (two weddings sitting in their own section next to five
 * other events), so category is a small badge on each card instead
 * (`RealizationCard`). Revisit once there is enough wedding work to justify a
 * section of its own.
 */

export const metadata: Metadata = {
  title: "Realizacje",
  description: `Wesela i przyjęcia okolicznościowe, które dekorowaliśmy w ${site.cityLocative} i okolicach. Zdjęcia z każdej realizacji.`,
  ...sharePreview({
    path: "/realizacje",
    title: `Realizacje - ${site.name}`,
    description: `Wesela i przyjęcia okolicznościowe, które dekorowaliśmy w ${site.cityLocative} i okolicach.`,
  }),
};

export default function RealizacjePage() {
  const layout = gridLayout(realizacje.length);

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
      </header>

      <ul
        className={`mt-16 grid grid-cols-1 gap-12 sm:mt-20 sm:gap-16 ${layout.gridClassName}`}
      >
        {realizacje.map((realizacja) => (
          <li key={realizacja.slug}>
            <RealizationCard realizacja={realizacja} sizes={layout.sizes} />
          </li>
        ))}
        {/*
         * The invitation is an item of the grid rather than a panel after it,
         * so it fills the last row (see `gridLayout`). Beside cards it
         * stretches to their height and centres its content; alone in a row
         * its padding sizes it. The tighter padding from `lg` is for the
         * one-column span, where the button's label would otherwise wrap.
         */}
        <li className={layout.invitationClassName}>
          <CalloutPanel
            as="section"
            className="flex h-full flex-col justify-center px-8 py-12 text-center sm:px-16 sm:py-16 lg:px-6"
          >
            <h2 className="font-display text-2xl leading-tight text-cream-50 sm:text-3xl">
              Planujecie wesele albo przyjęcie?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-cream-50/80">
              Napiszcie, co i kiedy - odpiszemy, czy termin jest wolny.
            </p>
            <p className="mt-8">
              <PrimaryCta href="/kontakt">Napisz do nas</PrimaryCta>
            </p>
          </CalloutPanel>
        </li>
      </ul>
    </div>
  );
}
