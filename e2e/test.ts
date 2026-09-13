import { test as base, type Request } from "@playwright/test";

export { expect } from "@playwright/test";
export type { Locator, Page } from "@playwright/test";

/**
 * Playwright's `test`, with one guard against the server this suite runs on.
 *
 * `next start` (16.3.x) optimizes each image width once and makes every other
 * request for it wait on that first one. The first one reads the source file
 * through its own connection, so if the browser drops that request partway
 * through, the job never settles. From then on that image at that width hangs
 * for the life of the server, and any later page that shows it never fires
 * `load`. Retries don't help: they talk to the same server.
 *
 * A test that ends while images are still arriving is exactly such a dropped
 * request. The header's menu tests poisoned the first wedding photograph at
 * 640px this way, and the phone gallery test timed out on every run after.
 * So each test leaves its page only once the image requests it started have
 * finished.
 *
 * Only the test server has this problem. On Vercel images go through Vercel's
 * optimizer, not this code path.
 */
export const test = base.extend({
  page: async ({ page }, runTest) => {
    const inFlight = new Set<Request>();

    function track(request: Request) {
      if (new URL(request.url()).pathname === "/_next/image") {
        inFlight.add(request);
      }
    }
    function settle(request: Request) {
      inFlight.delete(request);
    }

    page.on("request", track);
    page.on("requestfinished", settle);
    page.on("requestfailed", settle);

    await runTest(page);

    // Capped: a request that is already stuck will not finish by waiting, and
    // the test that tripped over it has failed and said so.
    const deadline = Date.now() + 10_000;
    while (inFlight.size > 0 && Date.now() < deadline && !page.isClosed()) {
      await page.waitForTimeout(50);
    }
  },
});
