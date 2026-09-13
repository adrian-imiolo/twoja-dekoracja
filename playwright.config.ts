import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
// Deliberately not 3000. The sibling `shop_sznyt_design` backend lives there,
// and two projects sharing a port means a suite that either cannot start or,
// worse, quietly reports on the other one's server.
const port = 3100;
const baseURL = `http://localhost:${port}`;

// The suite drives a real browser against a production build rather than the
// dev server: static rendering and font loading — the things this site's search
// visibility rests on — only exist after `next build`.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // On CI, annotate the failing lines *and* leave an HTML report behind for
  // the workflow to upload — the annotations alone lose the trace.
  reporter: isCI
    ? [["github"] as const, ["html", { open: "never" }] as const]
    : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    /*
     * A navigation that is going nowhere should say so in seconds.
     *
     * Playwright leaves this unbounded, so a stuck navigation is caught only
     * by the test's own budget — and a walk of the whole site gives itself
     * three minutes. That is what turned one image request the browser had
     * quietly abandoned into a 29-minute red build: three widths, three
     * attempts each, every one spending the full 180 seconds and then
     * reporting a timeout that named the budget rather than the address it
     * had been waiting on.
     *
     * Thirty seconds is far longer than a page here has ever needed — the
     * whole suite finishes inside ninety with a cold image cache — and short
     * enough that the next navigation to hang fails while the run is still
     * worth reading, pointing at the request instead of the clock.
     */
    navigationTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: baseURL,
    /*
     * The suite names the URL it will serve from rather than leaving the build
     * to guess it. `resolveSiteUrl` in `src/lib/site.ts` falls back to
     * localhost:3000, which was only ever right here by coincidence of the
     * port; saying it outright is what lets the port move. `NEXT_PUBLIC_*` is
     * inlined at build time, so this is the origin the canonicals and the
     * structured data actually carry.
     */
    env: { NEXT_PUBLIC_SITE_URL: baseURL },
    /*
     * Never adopt whatever is already listening. Reuse is how this suite spent
     * two days reporting on someone else's process: an unrelated server held
     * the port, every run measured that instead of the site, and a genuine
     * hero regression sat unnoticed behind the results.
     *
     * A port that is busy now fails the run outright, which is the point — a
     * suite that cannot reach its own build should say so rather than grade a
     * stranger. The cost is a build per run, and that is the cheaper mistake.
     */
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
