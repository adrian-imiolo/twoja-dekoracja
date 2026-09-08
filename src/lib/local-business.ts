import { instagramHref, isPending, site } from "@/lib/site";
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
 */
export function localBusinessSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // A name for the entity, so a later block on another page can point at
    // this one instead of describing the business a second time.
    "@id": `${site.url}/#pracownia`,
    /*
     * The brand, which every page already carries and no one is waiting on.
     * It is deliberately not guarded: a `LocalBusiness` with no `name` is a
     * block Google discards, and the thing #12 is waiting for is the person's
     * name, which is `legalName` below. Unregistered activity has no entity
     * to name apart from the individual running it.
     */
    name: site.name,
    url: site.url,
    description: site.description,
    ...ifKnown("legalName", site.owner),
    ...ifKnown("telephone", site.phone),
    ...ifKnown("email", site.email),
    ...(isPending(site.instagram)
      ? {}
      : { sameAs: [instagramHref(site.instagram)] }),
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

/**
 * A key, or nothing at all.
 *
 * The distinction this whole module turns on, and the reason it is a named
 * function with its own tests rather than a conditional spread written out
 * four times. A page renders the marker so a reader can see what is missing;
 * markup a machine reads must not, because a search engine has no way to tell
 * `[DO UZUPEŁNIENIA]` from a phone number somebody chose — it takes it as the
 * answer and publishes it. An absent key is read as "not stated", which is the
 * truth.
 */
export function ifKnown(
  klucz: string,
  wartosc: string,
): Record<string, string> {
  return isPending(wartosc) ? {} : { [klucz]: wartosc };
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
