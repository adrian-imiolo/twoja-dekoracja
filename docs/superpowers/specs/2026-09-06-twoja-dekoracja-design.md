# Twoja Dekoracja: portfolio site design

**Date:** 2026-09-06
**Status:** Approved, ready for implementation planning

## Purpose

A portfolio site for a real decoration business in Szczecin serving weddings,
birthdays and other private events. The site exists to generate inquiries.
Success six months after launch is measured in contacts received (form
submissions, calls, Instagram messages) from people who found the site through
Google or were sent to it directly.

Where atmosphere and findability conflict, findability wins.

## Constraints

- **Content lives in the repo.** The developer adds new realizations by pushing
  commits. No CMS, no admin panel, no client-facing upload flow.
- **Seven realizations at launch**: two weddings and five other events,
  thinner than the nine originally planned for. The design has to hold up at that
  volume without looking sparse; see "Pages" below for how the Wesela/Imprezy
  split was amended to fit it.
- **Photo archive is real but modest**: 24 WhatsApp-compressed photographs
  across the seven launch realizations (2–7 each), where 50+ were originally
  assumed. `next/image` handles format negotiation regardless of source
  quality; no separate editing pipeline was built for this archive.
- **Hero video has shipped.** The client's own footage, a vertical phone pan
  across a "Młoda Para" neon sign, was transcoded to a 1.77 MB H.264 clip,
  well inside budget. See "Hero video" below for why a portrait source works
  fine in a hero band that is itself portrait-shaped on a phone.
- **Polish only.** No internationalization scaffolding.
- **Szczecin and surrounding area** (Police, Stargard, Goleniów, Świnoujście)
  is the service region.
- **The business is unregistered** (działalność nierejestrowana). There is no
  NIP, REGON or company entity. This shapes the footer, the structured data and
  the privacy policy; see "Legal identity" below.

## Brand

Derived from the client's existing logo: a blush pink circular badge with a
hand-drawn single-line balloon-and-flower illustration in plum ink, the words
"Twoja dekoracja" set in wide-tracked lowercase, and the year 2024.

### Palette

| Token       | Value     | Role                                  |
| ----------- | --------- | ------------------------------------- |
| `plum-950`  | `#2B1D31` | Page ground                           |
| `plum-900`  | `#3A2842` | Raised surfaces, cards                |
| `plum-800`  | `#4A3350` | Borders, dividers                     |
| `plum-600`  | `#5C3D62` | Logo ink; buttons on light surfaces   |
| `blush-300` | `#E0AEC8` | Primary accent: rules, borders, links |
| `blush-200` | `#F0CFDF` | Secondary accent, brand text          |
| `blush-100` | `#F5DBE7` | Logo circle; light surface blocks     |
| `cream-50`  | `#F7EEF3` | Body text on dark                     |

The dark aubergine ground is the logo's own ink used at page scale, so the site
stays on-brand while making photographs the brightest thing on screen. The light
pink logo badge reads as a wax seal against it.

**Tone guard rail:** the dark palette must stay warm. Generous spacing, warm
copy, and no pure black or cold grey anywhere. The failure mode of this
direction is drifting from "elegant" to "cocktail bar."

### Typography

- **Display:** Marcellus, for headlines, realization titles and the wordmark.
- **Body/UI:** Jost, for paragraphs, navigation, labels and form fields.

Both loaded through `next/font/google` with `display: swap`, subset to
`latin-ext` so Polish diacritics render correctly.

## Architecture

### Stack

- **Next.js 16, App Router**, TypeScript in strict mode
- **Tailwind CSS 4**, brand tokens defined as CSS custom properties in the theme
- **`next/image`** for every photograph
- **Resend** for contact-form email delivery
- **Vercel** for hosting

Every page is statically generated. The only server code in the project is one
route handler for the contact form. There is no database, no authentication,
and no third-party service beyond Resend.

### Why not the shop repo's stack

`shop_sznyt_design` is a Vite SPA with an Express/Prisma/Stripe/Clerk backend.
Two reasons it is the wrong base here:

1. **Search visibility.** A client-rendered SPA gives Google an empty shell. For
   a local service business whose entire acquisition channel is search, per-page
   server-rendered HTML is a requirement.
2. **Images.** This site is almost entirely photographs. `next/image` handles
   format negotiation, responsive sizing and lazy loading as a matter of course;
   on Vite that work is manual and usually ends up skipped.

Some patterns carry across (the `Seo` component's shape, the
submit/loading/error state machine in `usePublicForm`, and the CI workflow) and
are adapted. The components themselves depend on React Router and a different
design system, so they are rewritten.

## Content model

```
content/realizacje/<slug>/
  index.ts        metadata + ordered photo imports
  01.jpg … NN.jpg
```

Each `index.ts` exports a typed `Realizacja`:

```ts
type Kategoria = "wesela" | "imprezy";

interface Fotografia {
  image: StaticImageData;
  alt: string; // descriptive Polish, written for this photograph
  position?: string; // CSS object-position
  zoom?: number; // CSS scale factor
  zoomOrigin?: string; // CSS transform-origin, "50% 50%" by default
}

type Galeria = readonly [Fotografia, ...Fotografia[]]; // never empty

interface Realizacja {
  slug: string;
  title: string; // "Wesele Anny i Piotra"
  category: Kategoria;
  place: string; // "Pałac Mała Wieś"
  date: string; // "Czerwiec 2025"
  style: string; // "Pastelowe róże, biel, zieleń"
  intro: string; // two sentences, maximum
  cover: Fotografia;
  photos: Galeria;
}
```

Photos are statically imported rather than referenced by path; the portfolio
spec's "Content model" section records what that buys. The three optional
fields `position`, `zoom` and `zoomOrigin` only shape the cropped cover in
listings; the gallery on a realization's own page shows every photograph whole.

A single registry module imports every realization and exports them in display
order. Display order is set by hand so the best work can lead.

Adding a realization is: create the folder, drop the photos, write the
`index.ts` (the photo imports, one photograph object with its alt text per
file, and the record; roughly forty to fifty-five lines for a typical gallery), add one line
to the registry, push.

If this becomes tedious past about twenty realizations, replace `index.ts`
authoring with a build-time script that scans folders using `sharp`. That
machinery is not justified for nine.

## Pages

### `/` (Home)

Video hero → a short statement of who the business is → four selected
realizations → an FAQ teaser of three questions → contact call to action.

Amended from the original two-way Wesela/Imprezy homepage split. That split
carried the search intent a combined `/realizacje` page can't ("dekoracje
weselne Szczecin" and "dekoracje urodzinowe Szczecin" are different queries),
but at seven launch realizations (two weddings, five events) it meant a
section holding two cards next to one holding five. Dropped in favour of one
"Wybrane realizacje" grid; the category survives as a small badge on each card
(`RealizationCard`), so the split can return once there is enough wedding work
to justify it.

### `/realizacje`

One unified grid, for the same reason as the home page above. Cards are large
and generously spaced: one per row below `lg`, three per row from it.

The grid ends with an invitation to write: the same callout panel that closes
`/o-nas`, with a heading, one line and the button to `/kontakt`. It is the
grid's last item and takes whatever the last row of cards leaves, spanning two
columns beside a lone card, one beside a pair, and the whole row when the
cards already fill theirs. A grid of two cards follows the same rule with two
columns. So the grid ends flush at any count, and adding a realization never
strands a card in the final row. Beside cards the panel
matches their height with its content centred; alone in a row it is sized by
its padding.

Not split into two category pages either: with two weddings and five events,
two thin pages would rank worse than one substantial one. Revisit when the
archive has enough weddings for its own section, let alone its own page.

### `/realizacje/[slug]`

Statically generated per realization. A detail header (place, date, style, two
sentences), then the gallery. Text is minimal; the photographs carry the page.

A real route, so it can be linked, shared and indexed. The client will want to
send someone a direct link to one wedding.

The gallery must degrade gracefully. Some realizations will have five photos
and some twenty-five. The layout is designed for the sparse case first.

### `/o-nas`

The story behind the business, a photograph of the person running it, and why
they do this work. For a service bought on trust, this page does real work.

### `/faq`

Eight to ten questions covering pricing, booking lead time, service area,
setup/teardown, and what a first conversation looks like. Emits `FAQPage`
structured data.

### `/kontakt`

The form, plus visible phone, email and Instagram for people who would rather
not fill anything in.

### `/polityka-prywatnosci`

The contact form collects personal data from EU residents, so RODO obliges the
site to state what is collected, why, on what basis, how long it is kept, and
how to request deletion.

Built with placeholder text at implementation time, filled in before launch.
The page structure, routing, footer link and styling are real; the legal copy is
marked `[DO UZUPEŁNIENIA]` until the client supplies their details.

Not being a registered company does not exempt the business here. Under RODO the
data controller is whoever decides how personal data is used; for an
unregistered business that is the individual, named personally, with a contact
address for data requests. The policy needs a real name and a real contact
channel.

## Hero video

Built poster-first. A static image is the hero; video is an enhancement layered
over it when the client supplies footage. Because the poster is always present,
the video can never regress the page's largest-contentful-paint.

- `muted`, `playsinline`, `loop`, `preload="none"`
- Poster image always present, and sized as the LCP element
- Video requested only after the poster has painted
- `prefers-reduced-motion: reduce` receives the poster and no video
- Budget: **≤ 3 MB** for a 10–15 second clip

Above that budget the site is trading search ranking for atmosphere on the one
page where ranking matters most.

The video shipped. The client's footage is a vertical phone pan (a Reel) across
a "Młoda Para" neon sign against sheer curtains and greenery, re-encoded from a
12.7 MB original to 1.77 MB H.264, comfortably under budget. The portrait
source turned out not to need a redesign either: the hero band is itself
`min-h-[78svh]`, so it is already portrait-shaped on a phone and only becomes
landscape on desktop, where `object-cover` crops the same source sensibly at
both extremes. The poster is a frame pulled from this same clip, so the
still-to-video handoff shows no visible cut.

## Contact form

`POST /api/kontakt` is the only server code in the project.

**Payload:** name, contact (email or phone), event type, approximate date,
message.

**Validation:** Zod schema shared between client and route handler, so the
browser and the server enforce the same rules.

**Delivery:** Resend, to `CONTACT_TO_EMAIL`.

**Abuse control:** a honeypot field plus a minimum time-to-submit check, and
per-IP rate limiting held in memory. Sufficient for a site at this volume;
nothing that requires a data store.

**Error handling:** the form always tells the user what happened: success, a
specific validation error, or a failure message that surfaces the phone number
as a fallback. The portfolio spec's "Contact submission" section records why a
silent failure here is the one to design against.

**Environment:** `RESEND_API_KEY`, `CONTACT_TO_EMAIL`.

## Legal identity

The business operates as **działalność nierejestrowana**, unregistered activity
under Polish law. Consequences for the site:

- **No NIP or REGON in the footer**, because none exist. The footer carries the
  person's name, the service region, phone, email and Instagram.
- **`LocalBusiness` structured data uses `areaServed`, not a street address.**
  Szczecin and the surrounding towns are declared as the service area. No
  `address` block is emitted, since publishing a home address is both unnecessary
  and unwise.
- **The privacy policy names an individual as data controller.**
- **No invoice or VAT language anywhere on the site.** An unregistered business
  issues a _rachunek_, not a _faktura VAT_, and the FAQ must not imply otherwise.

Outside the site's scope, the client should know that działalność
nierejestrowana carries a monthly revenue ceiling. If this site does its job,
they will cross it and need to register. That is their decision to plan for, but
it should not come as a surprise triggered by the site working.

## Analytics

In scope for v0, at the client's request.

Vercel Web Analytics is the recommendation: cookieless, no personal data, no
cross-site tracking, one component to add. It gives page views, referrers, top
pages and country, which covers what the client will look at.

Because it sets no cookies and stores no personal data, it does not require a
consent banner, and that is the main reason to prefer it. A cookie banner on a
nine-page portfolio costs conversions on every visit, and the site's only job is
conversions.

If the client specifically wants Google Analytics 4 (usually because someone
told them to, or they want it alongside Google Ads), then a RODO consent banner
becomes mandatory, GA4 must not load before consent, and the privacy policy
grows a section on Google as a processor. That is a real cost. Confirm what the
client needs before reaching for GA4, and default to Vercel Web Analytics
otherwise.

## Search visibility

- Per-page metadata through the Next metadata API
- `LocalBusiness` structured data: name, service area (Szczecin and surrounding
  towns), phone, Instagram profile. No street address (see "Legal identity")
- `FAQPage` structured data on `/faq`
- Generated `sitemap.ts` and `robots.ts`
- Descriptive Polish alt text on every photograph, written per realization

## Testing

- **Playwright:** the contact flow end to end (fill, submit, assert the success
  state), with Resend mocked. This is the revenue path and the only flow whose
  breakage is invisible in production.
- **Vitest:** contact form validation rules, and registry integrity: every slug
  resolves, every category is valid, no duplicate slugs, every realization has
  at least one photo.
- No tests for layout components, the FAQ page, or other framework wiring.

## Out of scope

- A CMS
- Internationalization
- A blog
- Google Analytics or any other cookie-setting tracker, and therefore a consent
  banner
- An animation library, until a CSS transition has been shown to be
  insufficient
- A newsletter, booking calendar or pricing calculator

## Open items

None of these block starting implementation. All of them block launching.

- Client's name as it should appear publicly, phone number, email address and
  Instagram handle
- Real copy for `/o-nas` and the FAQ answers
- Privacy policy details, which ship with `[DO UZUPEŁNIENIA]` placeholders
- Venue and date for each of the seven launch realizations. They ship as
  `[DO UZUPEŁNIENIA]`, rendered conditionally rather than shown as literal
  placeholder text (see `src/lib/site.ts`'s `miejsceITermin`)
- Confirmation that Vercel Web Analytics satisfies what the client means by
  "analytics", rather than GA4
