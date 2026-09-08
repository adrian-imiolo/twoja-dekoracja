import { instagramHref, isPending } from "./site";

/**
 * What this block needs to know about the business.
 *
 * Declared here rather than imported as `typeof site`, so the schema states
 * its own requirements and `site` satisfies them structurally. That is what
 * lets a test hand it a business whose details have arrived.
 */
export interface BusinessFacts {
  name: string;
  url: string;
  description: string;
  /** The person behind it. Unregistered activity has no other legal name. */
  owner: string;
  phone: string;
  email: string;
  /** The handle as a human writes it, leading `@` and all. */
  instagram: string;
  serviceArea: readonly string[];
}

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
 * Facts arrive as an argument rather than being read from `site` so the
 * pending guard below can be exercised in both directions. `local-business.test.ts`
 * says why that is worth a parameter.
 */
export function localBusinessSchema(
  dane: BusinessFacts,
  zdjecia: readonly string[] = [],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // A name for the entity, so a later block on another page can point at
    // this one instead of describing the business a second time.
    "@id": `${dane.url}/#pracownia`,
    /*
     * The brand, which every page already carries and no one is waiting on.
     * It is deliberately not guarded: a `LocalBusiness` with no `name` is a
     * block Google discards, and the thing #12 is waiting for is the person's
     * name, which is `legalName` below. Unregistered activity has no entity
     * to name apart from the individual running it.
     */
    name: dane.name,
    url: dane.url,
    description: dane.description,
    ...ifKnown("legalName", dane.owner),
    ...ifKnown("telephone", dane.phone),
    ...ifKnown("email", dane.email),
    ...(isPending(dane.instagram)
      ? {}
      : { sameAs: [instagramHref(dane.instagram)] }),
    areaServed: dane.serviceArea.map((miasto) => ({
      "@type": "City",
      name: miasto,
    })),
    /*
     * Absolute, because a crawler fetches this without the page it was found
     * on — the same reason `metadataBase` exists for preview images, which
     * this block cannot borrow.
     */
    ...(zdjecia.length > 0
      ? { image: zdjecia.map((sciezka) => new URL(sciezka, dane.url).href) }
      : {}),
  };
}

/**
 * A key, or nothing at all.
 *
 * The distinction this whole module turns on. A page renders the marker so a
 * reader can see what is missing; markup a machine reads must not, because a
 * search engine has no way to tell `[DO UZUPEŁNIENIA]` from a phone number
 * somebody chose — it takes it as the answer and publishes it. An absent key
 * is read as "not stated", which is the truth.
 */
function ifKnown(klucz: string, wartosc: string): Record<string, string> {
  return isPending(wartosc) ? {} : { [klucz]: wartosc };
}
