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
|  `npm test` | Vitest — content and validation rules that need no browser |
| `npm run test:e2e` | Playwright — real browser against a real production build |

`npm run test:e2e` builds the site itself; run `npx playwright install chromium`
once before the first run.

## Environment

The site is static apart from one route handler, `POST /api/kontakt`, which
sends the inquiry form's contents to the owner through Resend.

| Variable | Required | What it is |
| --- | --- | --- |
| `RESEND_API_KEY` | In deployments | Resend API key used to send inquiries |
| `CONTACT_TO_EMAIL` | In deployments | Where inquiries are delivered |
| `CONTACT_FROM_EMAIL` | No | Sender address; defaults to Resend's shared `onboarding@resend.dev` until a domain is verified |
| `NEXT_PUBLIC_SITE_URL` | In deployments | Origin used for canonicals and link previews |

Without `RESEND_API_KEY` and `CONTACT_TO_EMAIL`, the contact form works
locally and in CI but writes the inquiry to the server log instead of sending
it — which is what lets the end-to-end suite drive the real route handler with
no key and no network. A **deployment** missing either variable fails the
submission outright and shows the visitor the phone number, rather than
confirming a send that never happened.

## Deployment

Hosted on Vercel. A push to `main` deploys to production; every pull request
gets a preview deployment. There is no manual deploy step.

## Docs

- `docs/superpowers/specs/` — design and implementation specs
- `docs/agents/` — conventions for agent-run workflows
- `CLAUDE.md` — repo instructions for Claude Code
