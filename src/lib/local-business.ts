import { instagramHref, site } from "@/lib/site";
import { realizacje } from "@content/realizacje";

/**
 * The business as a search engine understands it.
 *
 * One block on the home page, describing the entity rather than the document:
 * who this is, what they do and — the part that decides whether "dekoracje
 * weselne Szczecin" ever finds them — where they work.
 *
 * Where they work is `areaServed` and nothing else. There is no `address` and
 * there will not be one: the business is działalność nierejestrowana run out
 * of a home, so the only street address it has is a residential one, and
 * publishing that buys a map pin at a price nobody should pay. The cost is
 * real and is accepted deliberately — Google wants an address before it will
 * show a local rich result, so this block earns entity understanding rather
 * than a card. See the design spec's "Legal identity".
 *
 * Nothing here is guarded against `[DO UZUPEŁNIENIA]` any more. Every business
 * fact this block publishes is now a real value in `site`, so the conditional
 * that used to drop an unsupplied key could no longer fire, and a branch that
 * cannot be taken is worse than no branch — it suggests a protection that is
 * not being performed. What survives is the test asserting the serialized
 * block never contains the marker, which is where a regression would actually
 * be caught.
 */
export function localBusinessSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // A name for the entity, so a later block on another page can point at
    // this one instead of describing the business a second time.
    "@id": `${site.url}/#pracownia`,
    // The brand, which is what a search result should say and what every page
    // already carries. The people behind it are `legalName` below.
    name: site.name,
    url: site.url,
    description: site.description,
    /*
     * Both names, because unregistered activity has no entity to name apart
     * from the individuals running it — and here there are two of them. A
     * `legalName` carrying one of the pair would be a claim that the other is
     * staff, which is not what this business is.
     */
    legalName: site.owners.map((wlascicielka) => wlascicielka.name).join(" i "),
    /*
     * Both numbers rather than a nominated primary. Neither is a switchboard
     * that reaches the other, so publishing one would send half the callers to
     * a person who cannot answer for the booking. `telephone` accepts repeated
     * values, and two is the truth.
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
     * on — the same reason `metadataBase` exists for preview images, which
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
