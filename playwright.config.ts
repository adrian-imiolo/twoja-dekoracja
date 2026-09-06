import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
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
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
