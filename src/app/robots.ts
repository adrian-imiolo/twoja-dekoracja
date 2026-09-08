import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * What a crawler is allowed to ask for.
 *
 * Everything, apart from the one route that is not a page. `/api/kontakt`
 * accepts a POST and answers nothing a visitor would read; leaving it crawlable
 * spends crawl budget on a route that can only ever return an error to a GET,
 * and puts an endpoint the site would rather not advertise into the index.
 *
 * The sitemap is named absolutely because that is what the robots.txt format
 * requires — a relative path there is ignored rather than resolved.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
