# Twoja Dekoracja

Portfolio site for a decoration business in Szczecin — weddings, birthdays and
private celebrations. A statically generated Next.js site whose sole purpose is
generating inquiries.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest — validation rules and registry integrity |
| `npm run test:e2e` | Playwright — real browser against a real production build |

`npm run test:e2e` builds the site itself; run `npx playwright install chromium`
once before the first run.

## Deployment

Hosted on Vercel. A push to `main` deploys to production; every pull request
gets a preview deployment. There is no manual deploy step.

## Docs

- `docs/superpowers/specs/` — design and implementation specs
- `docs/agents/` — conventions for agent-run workflows
- `CLAUDE.md` — repo instructions for Claude Code
