import type { Metadata } from "next";

import { RealizationCard } from "@/components/realization-card";
import { sharePreview } from "@/lib/metadata";
import { site } from "@/lib/site";
import { realizacje } from "@content/realizacje";

/**
 * All the work, in one grid.
 *
 * Not split into Wesela / Imprezy sections. That split reads badly at the
 * launch archive's actual shape — one wedding sitting alone in its own
 * section next to five other events — so category is a small badge on each
 * card instead (`RealizationCard`) rather than a section boundary. Revisit
 * once there is enough wedding work to justify a section of its own.
 */

export const metadata: Metadata = {
  title: "Realizacje",
  description: `Wesela i przyjęcia okolicznościowe, które dekorowaliśmy w ${site.cityLocative} i okolicach. Zdjęcia z każdej realizacji.`,
  ...sharePreview({
    path: "/realizacje",
    title: `Realizacje — ${site.name}`,
    description: `Wesela i przyjęcia okolicznościowe, które dekorowaliśmy w ${site.cityLocative} i okolicach.`,
  }),
};

/**
 * How the grid is laid out for the number of cards it holds.
 *
 * Three columns divide the launch count of six exactly, leaving no orphan in
 * the final row. Below `lg` there is a single large card per row, which is
 * also what "large and generously spaced" means on a laptop that is not full
 * width.
 *
 * This is not a general rule against orphans. Three columns strand the last
 * card of a grid of four, five, seven or eight, and nothing here or in the
 * test suite says otherwise — it is sized for the archive this page actually
 * has, revisited as that archive grows.
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
        className={`mt-16 grid grid-cols-1 gap-12 sm:mt-20 sm:gap-16 ${layout.className}`}
      >
        {realizacje.map((realizacja) => (
          <li key={realizacja.slug}>
            <RealizationCard realizacja={realizacja} sizes={layout.sizes} />
          </li>
        ))}
      </ul>
    </div>
  );
}
