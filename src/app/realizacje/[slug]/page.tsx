import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RealizationGallery } from "@/components/realization-gallery";
import { asOgImage, sharePreview } from "@/lib/metadata";
import { site } from "@/lib/site";
import { findRealizacja, realizacje } from "@content/realizacje";

/**
 * One completed event, at its own address.
 *
 * A real route rather than a modal overlay: the owner sends a prospective
 * client a link to the one wedding that answers "have you worked somewhere
 * like ours?", and a modal can be neither linked, shared nor indexed.
 */

/**
 * Every published realization, rendered at build time. `dynamicParams = false`
 * closes the route to anything else, so a mistyped address is a static 404
 * rather than a server rendering an event that does not exist.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return realizacje.map((realizacja) => ({ slug: realizacja.slug }));
}

/**
 * What a search result and a pasted link show.
 *
 * The description is the authored introduction rather than a composition of
 * the event's fields: it is written as the two sentences that describe this
 * event, which is exactly what a snippet needs, and a template assembled from
 * place, date and style would read as a machine listing at every one of them.
 *
 * The preview image is the event's own cover photograph. A generated card
 * would put the brand in front of the work, and the work is what persuades
 * whoever the link was sent to.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const realizacja = findRealizacja(slug);

  // Unreachable while `dynamicParams` is false — but silently returning empty
  // metadata would turn a registry fault into a page that previews as nothing,
  // which is exactly the failure this route exists to avoid.
  if (!realizacja) notFound();

  const path = `/realizacje/${realizacja.slug}`;
  const title = `${realizacja.title} — ${realizacja.place}`;

  return {
    title,
    description: realizacja.intro,
    ...sharePreview({
      type: "article",
      path,
      title: `${title} — ${site.name}`,
      description: realizacja.intro,
      images: [asOgImage(realizacja.cover)],
    }),
  };
}

export default async function RealizacjaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const realizacja = findRealizacja(slug);

  if (!realizacja) notFound();

  return (
    <article className="page-shell py-16 sm:py-24">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
          {realizacja.title}
        </h1>
        <p className="mt-5 text-sm tracking-[0.25em] text-blush-300 uppercase">
          {realizacja.place} · {realizacja.date}
        </p>
        <p className="mt-6 font-display text-xl text-blush-200">
          {realizacja.style}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-cream-50/80">
          {realizacja.intro}
        </p>
      </header>

      <RealizationGallery photos={realizacja.photos} />
    </article>
  );
}
