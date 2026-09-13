import { instagramHref, site } from "@/lib/site";
import { realizacje } from "@content/realizacje";

/**
 * The business as a search engine understands it.
 *
 * One block on the home page, describing the entity rather than the document:
 * who this is, what they do and where they work. Where they work decides
 * whether "dekoracje weselne Szczecin" ever finds them.
 *
 * Where they work is `areaServed` and nothing else. There is no `address` and
 * there will not be one: the business is działalność nierejestrowana run out
 * of a home, so the only street address it has is a residential one, and
 * publishing it would buy a map pin with the owners' home on it. The cost is
 * accepted: Google lists `address` as required for a local business rich
 * result
 * (https://developers.google.com/search/docs/appearance/structured-data/local-business),
 * so this block earns entity understanding and no card. See the design spec's
 * "Legal identity".
 *
 * Nothing here is guarded against `[DO UZUPEŁNIENIA]` any more. Every business
 * fact this block publishes is now a real value in `site`, so the conditional
 * that used to drop an unsupplied key could no longer fire, and a branch that
 * cannot be taken is worse than no branch, because it suggests a protection
 * that is not being performed. What survives is the test asserting the
 * serialized block never contains the marker, which is where a regression
 * would be caught.
 */
export function localBusinessSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // A name for the entity, so a later block on another page can point at
    // this one instead of describing the business a second time.
    "@id": `${site.url}/#pracownia`,
    // The brand, which is what a search result should say and what every page
    // already carries.
    name: site.name,
    url: site.url,
    description: site.description,
    /*
     * No `legalName`. Unregistered activity has no entity to name apart from
     * the individuals running it, so the only value this key could carry is
     * two people's full names, and those are published on one page only,
     * the privacy policy, where RODO obliges it. `sameAs` and `telephone` are
     * enough for a search engine to treat this as one business.
     */
    /*
     * Both numbers rather than a nominated primary. Neither is a switchboard
     * that reaches the other, so publishing one would send half the callers to
     * a person who cannot answer for the booking. `telephone` accepts repeated
     * values.
     */
    telephone: site.owners.map((wlascicielka) => wlascicielka.phone),
    email: site.email,
    // Every profile that is the same entity as this one, which is what makes a
    // search engine treat the site and the socials as one business.
    sameAs: [instagramHref(site.instagram), site.facebook],
    areaServed: site.serviceArea.map((miasto) => ({
      "@type": "City",
      name: miasto,
    })),
    /*
     * The archive's leading photograph, absolute. A `LocalBusiness` is shown
     * with its picture wherever it is shown at all, and the strongest work is
     * a truer picture of this business than a wordmark would be.
     *
     * Absolute because a crawler fetches this without the page it was found
     * on, for the same reason `metadataBase` exists for preview images, which
     * this block cannot borrow. `slice` rather than an index because an empty
     * archive should cost the key, not the build.
     */
    ...obraz(realizacje.slice(0, 1).map((realizacja) => realizacja.cover)),
  };
}

function obraz(
  fotografie: readonly { image: { src: string } }[],
): Record<string, string[]> {
  if (fotografie.length === 0) return {};

  return {
    image: fotografie.map(
      (fotografia) => new URL(fotografia.image.src, site.url).href,
    ),
  };
}
