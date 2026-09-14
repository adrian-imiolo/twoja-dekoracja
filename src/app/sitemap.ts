import type { MetadataRoute } from "next";

import { site } from "@/lib/site";
import { realizacjaHref, realizacje } from "@content/realizacje";

/**
 * Every address the site publishes, handed to a search engine as a list.
 *
 * The archive's half is generated from the registry rather than listed, because
 * a hand-maintained list goes stale when a realization is added: nothing says
 * its page is missing from here, and the one new page nobody links to yet is
 * the one that never gets crawled.
 *
 * The static half cannot be generated: those routes are files, and the
 * framework offers no enumeration of them. It is a written list, and what
 * keeps it honest is `e2e/routes.spec.ts`, which crawls the site from the home
 * page and asserts that what it reached and what is named here are the same
 * set. A second written list would have gone stale in step with this one.
 *
 * No `lastModified`, `changeFrequency` or `priority`. Google ignores the last
 * two outright
 * (https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
 * and the first would have to be invented: nothing in the content carries a
 * modification date, and stamping the build time on every entry tells a crawler
 * the whole site changed every deploy, which is both false and the fastest way
 * to have the field distrusted.
 */

/**
 * The pages that exist whatever is in the registry, in the order a visitor
 * meets them. Realization details are not here; they come and go with the
 * archive and are generated below.
 */
const TRASY_STALE = [
  "/",
  "/o-nas",
  "/realizacje",
  "/faq",
  "/kontakt",
  "/polityka-prywatnosci",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const sciezki = [...TRASY_STALE, ...realizacje.map(realizacjaHref)];

  // Absolute, and not through `metadataBase`: a sitemap is fetched on its own,
  // and the framework resolves nothing here.
  return sciezki.map((sciezka) => ({ url: new URL(sciezka, site.url).href }));
}
