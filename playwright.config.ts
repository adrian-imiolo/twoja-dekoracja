import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
// Kept in step with `resolveSiteUrl`'s localhost fallback in `src/lib/site.ts`,
// which is what the built pages name themselves during this suite. Moving the
// port without moving that constant leaves the structured-data test asserting
// one origin against a site that publishes another.
const port = 3000;
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
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: baseURL,
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
