# Twoja Dekoracja

Portfolio site for a decoration business in Szczecin — weddings, birthdays and
private celebrations. A static Next.js site whose sole purpose is generating
inquiries.

Specs live in `docs/superpowers/specs/`:

- `2026-09-06-twoja-dekoracja-design.md` — brand, palette, visual direction
- `2026-09-06-twoja-dekoracja-portfolio-spec.md` — problem, user stories,
  implementation and testing decisions

## Agent skills

### Issue tracker

Issues live in GitHub Issues, via the `gh` CLI. External PRs are not a triage
surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary — the five canonical role names are used verbatim as label
strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See
`docs/agents/domain.md`.

## Code style

Named callbacks, with one exception: a one-line inline arrow is fine as a
Playwright `evaluate`/`evaluateAll`/`poll` callback or as any array iteratee.
`evaluate` callbacks run serialized in the browser, where a name buys no stack
trace, and naming every short iteratee is noise. Multi-line callbacks and event
handlers get names.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
