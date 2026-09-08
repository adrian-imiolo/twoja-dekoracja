# Spec — Twoja Dekoracja portfolio site

**Date:** 2026-09-06
**Status:** Ready for implementation
**Companion document:** `2026-09-06-twoja-dekoracja-design.md` (brand, palette, visual direction)

---

## Problem Statement

A decoration business in Szczecin — weddings, birthdays, and private
celebrations — has no website. Its entire presence is an Instagram profile.

This costs it work in three specific ways.

Someone searching "dekoracje weselne Szczecin" or "dekoracje urodzinowe
Szczecin" cannot find the business at all. Search is how people look for a
supplier they have never heard of, and the business is invisible in exactly the
moment a stranger is ready to hire.

Someone who *is* referred — by a venue, a photographer, a friend — has nowhere
credible to be sent. An Instagram grid mixes finished work with stories, reposts
and personal posts, and cannot be skimmed by someone deciding whether to trust a
supplier with the decoration of their wedding.

And someone convinced by the work has no reliable way to make contact. Instagram
DMs are missed, buried, or filtered into message requests. Inquiries are lost
silently, which is the worst way to lose them: the business never learns it
happened.

The underlying problem is that the business has good work and good photographs
of it, and no way for a stranger to find that work, trust it, and make contact.

## Solution

A small static portfolio website in Polish, at a domain the business owns,
serving one purpose: turning a stranger into an inquiry.

The site shows the work first. Real photographs of real events, presented on a
dark plum ground drawn from the business's own logo so that the photography is
the brightest thing on every screen. Nine realizations at launch, split into
weddings and other celebrations, each with its own page that can be linked,
shared and found on Google.

The site is built to be found. Every page is server-rendered and statically
generated, carries structured data describing a local business serving Szczecin,
and is fast enough on a phone over mobile data that a visitor does not leave
before the first photograph appears.

The site makes contact easy and reliable. A short form asks only what is needed
to reply usefully, delivers to the owner's inbox, and always tells the visitor
what happened — including, when something breaks, a phone number to call
instead.

The site is maintained by pushing commits. New work is added by dropping
photographs into a folder and writing a dozen lines of metadata. There is no
CMS, no admin panel, no login, and no database.

## User Stories

### Finding the business

1. As someone planning a wedding in Szczecin, I want to find this business by searching "dekoracje weselne Szczecin", so that I can consider a local supplier I had not heard of.
2. As someone planning a 40th birthday party, I want to find the business by searching for birthday decorations rather than wedding decorations, so that I do not assume they only do weddings.
3. As someone who saw the business's work at a friend's wedding, I want to find them by searching their name, so that I can get in touch without asking my friend for a contact.
4. As a search engine, I want each realization to be a distinct indexable page with its own title and description, so that I can rank the business for a variety of specific queries.
5. As a visitor arriving from Google, I want the page I land on to make immediately clear what the business does and where it operates, so that I know within seconds whether it is relevant to me.
6. As a visitor on a phone over mobile data, I want the first screen to appear almost immediately, so that I do not give up and return to the search results.
7. As someone who found the Instagram profile first, I want the website linked from it and the Instagram linked from the website, so that I can move between the two.

### Judging the work

8. As a prospective client, I want to see photographs of real completed events rather than stock imagery, so that I can judge what this business actually produces.
9. As a prospective client, I want to see the work immediately on the homepage without hunting through navigation, so that I can decide quickly whether the style suits me.
10. As someone planning a wedding, I want to see only weddings when I want to, so that I am not scrolling past children's parties.
11. As someone planning a birthday party, I want to see that the business does more than weddings, so that I do not rule them out as wedding specialists.
12. As a prospective client, I want to open a single event and see many photographs of it, so that I can understand a complete decoration rather than one flattering angle.
13. As a prospective client, I want to know where an event took place, so that I can tell whether they have worked at venues like mine.
14. As a prospective client, I want to know roughly when an event took place, so that I can judge whether the work is current.
15. As a prospective client, I want a short description of the style of each event, so that I have language for what I do and do not like.
16. As a prospective client, I want photographs to be large and uncluttered by text, so that I can actually see the detail of the decoration.
17. As a visitor, I want photographs to load progressively rather than appearing as blank rectangles, so that the page feels alive while it loads.
18. As a visitor, I want the page layout to stay still as images load, so that I do not lose my place or tap the wrong thing.
19. As someone browsing on a phone, I want galleries to work with vertical scrolling, so that I am not fighting a layout designed for a mouse.

### Sharing and returning

20. As someone who found a wedding I love, I want to send my partner a direct link to that specific event, so that they see exactly what I saw.
21. As the business owner, I want to send a prospective client a link to one relevant realization, so that I can answer "have you worked at a venue like ours?" with evidence.
22. As someone sharing a link in a messaging app, I want a preview image and title to appear, so that the link looks credible rather than suspicious.
23. As a returning visitor, I want to find the event I looked at before, so that I can show it to someone else.

### Building trust

24. As a prospective client, I want to know who is behind the business, so that I am hiring a person rather than an anonymous brand.
25. As a prospective client, I want to see a photograph of the person I would be working with, so that the first meeting feels less like a cold call.
26. As a prospective client, I want to understand why they do this work, so that I can tell whether they care about it.
27. As a cautious visitor, I want the site to look professionally made, so that I trust the business with an expensive and unrepeatable event.
28. As a prospective client, I want to know which areas they serve, so that I do not waste time inquiring about a venue outside their range.

### Answering questions before contact

29. As a prospective client, I want to know roughly how far in advance to book, so that I know whether I am already too late.
30. As a prospective client, I want to understand how pricing works even without exact figures, so that I know whether this is plausibly within my budget.
31. As a prospective client, I want to know whether they handle setup and takedown, so that I understand what I am and am not responsible for.
32. As a prospective client, I want to know what happens after I make contact, so that I know what I am committing to by writing.
33. As a prospective client, I want to know whether they travel outside Szczecin, so that I can ask about a venue further away.
34. As a hesitant visitor, I want answers to obvious questions on the site, so that I do not have to make contact just to ask something basic.

### Making contact

35. As a prospective client, I want to send an inquiry through a form, so that I do not have to compose an email from scratch.
36. As a prospective client, I want the form to ask only a few questions, so that inquiring feels quick rather than like an application.
37. As a prospective client, I want to give the date of my event, so that they can tell me straight away whether they are free.
38. As a prospective client, I want to say what kind of event it is, so that the reply is relevant.
39. As a prospective client, I want to describe what I have in mind in my own words, so that I am not forced into predefined categories.
40. As a prospective client, I want to leave either a phone number or an email address, so that I am contacted the way I prefer.
41. As a prospective client, I want clear confirmation that my message was sent, so that I do not send it three times.
42. As a prospective client, I want to be told exactly which field is wrong when something is missing, so that I can fix it without guessing.
43. As a prospective client, I want a phone number shown if the form fails, so that a technical fault does not stop me from making contact.
44. As someone who would rather call than write, I want a visible phone number I can tap, so that I can call directly from my phone.
45. As someone who prefers Instagram, I want a link to the profile, so that I can message the way I already communicate.
46. As the business owner, I want every inquiry delivered to my inbox, so that I do not miss work.
47. As the business owner, I want the inquiry email to contain the event type and date in a readable form, so that I can triage without opening the site.
48. As the business owner, I want to reply directly to the inquiry email, so that answering does not require copying an address by hand.
49. As the business owner, I want automated spam kept out of my inbox, so that real inquiries are not lost among junk.

### Legal and privacy

50. As a visitor, I want to know what happens to the personal data I submit, so that I can decide whether to submit it.
51. As a visitor, I want to find the privacy policy from any page, so that I do not have to search for it.
52. As a visitor, I want to know how to request deletion of my data, so that I can exercise my rights under RODO.
53. As a visitor, I want not to be tracked across other websites, so that inquiring about decorations does not follow me around the internet.
54. As a visitor, I do not want a cookie banner interrupting me, so that I can look at the work without dismissing a dialog first.

### Maintaining the site

55. As the developer, I want to add a new realization by dropping photographs into a folder and writing a small metadata file, so that updates take minutes.
56. As the developer, I want image dimensions derived automatically from the files, so that I never hand-maintain numbers that can drift out of sync.
57. As the developer, I want to control the order in which realizations appear, so that the strongest work leads.
58. As the developer, I want a broken realization to fail the build rather than the live site, so that mistakes are caught before deployment.
59. As the developer, I want to replace the hero still with a video later without redesigning anything, so that the client's footage can arrive at any time.
60. As the developer, I want the site to deploy on push, so that publishing new work requires no manual steps.
61. As the business owner, I want to see how many people visit and where they come from, so that I know whether the site is working.

### Accessibility and resilience

62. As a visitor using a screen reader, I want meaningful descriptions of photographs, so that I understand what is being shown.
63. As a visitor who navigates by keyboard, I want to reach every link and form field in a sensible order, so that I can use the site without a mouse.
64. As a visitor sensitive to motion, I want animation suppressed when I have asked my system for reduced motion, so that the site does not make me unwell.
65. As a visitor with low vision, I want text to have sufficient contrast against the dark background, so that I can read it.
66. As a visitor on a slow connection, I want the site to be usable before every photograph has loaded, so that I am not staring at a blank page.

## Implementation Decisions

### Framework and hosting

Next.js 16 with the App Router, TypeScript in strict mode, Tailwind CSS 4,
deployed on Vercel. Every route is statically generated at build time. The only
server-side code is a single route handler for contact submissions.

Next.js is chosen over the Vite + React Router stack used in the sibling
`shop_sznyt_design` project for two reasons that both trace to the problem
statement: search visibility requires server-rendered HTML per route, and a
photography-led site requires automatic image optimization. Patterns from that
project — its SEO component's shape, the submit/loading/error state machine in
its public form hook, and its CI workflow — are adapted. Its components are not
reused, as they depend on React Router and a different design system.

### Content model

Realizations are stored in the repository, one directory per event, containing
image files and a single metadata module. The metadata module exports a typed
record: slug, title, category (`wesela` or `imprezy`), place, human-readable
date, style description, a two-sentence introduction, a cover image, and an
ordered list of photographs.

Photographs are **statically imported** rather than referenced by path string.
This gives the build intrinsic dimensions for every image, which in turn yields
automatic low-quality placeholders and eliminates cumulative layout shift
without any hand-maintained dimension data — satisfying stories 17, 18 and 56 as
a property of the approach rather than as work to remember.

A single registry module imports every realization and exports them in an
explicit display order. Order is authored, not derived from dates or filenames,
so the strongest work can lead.

No CMS, no database, no admin interface. The developer is the only person who
updates content, and infrastructure for a second author is not justified at nine
realizations.

### Routes

- Home — hero, positioning statement, split into the two categories, four selected realizations, FAQ teaser, contact call to action
- Realizations index — one page, two anchored sections for weddings and other events
- Realization detail — statically generated per event, one route per realization
- About
- FAQ
- Contact
- Privacy policy

The realizations index is deliberately a single page with two sections rather
than two category pages. Splitting three weddings and six events across two thin
pages would rank worse than one substantial page. The distinct search intents
behind stories 1 and 2 are served by the homepage's category split instead. This
decision is revisited when the archive roughly doubles.

Realization details are real routes rather than modal overlays. A modal cannot
be linked, shared or indexed, which would defeat stories 4, 20, 21 and 22.

### Hero

The hero is built poster-first. A static image is the hero element and the LCP
candidate; video is an enhancement layered over it when footage exists.

At launch there is no video — the client will supply it later — so the hero
ships as a still. When video arrives it is muted, looping, plays inline, is not
preloaded, is requested only after the poster has painted, and is suppressed
entirely under a reduced-motion preference. Budget is 3 MB for a 10–15 second
clip.

This ordering is a deliberate architectural choice, not a temporary workaround:
it makes the missing video a content gap rather than a launch blocker, and it
means the eventual video can never regress the site's largest-contentful-paint.

### Contact submission

A single route handler accepts inquiry submissions. The payload is name,
contact, event type, approximate date, and message.

Validation uses one schema shared between browser and server, so both enforce
identical rules and error messages cannot drift apart.

**Email delivery sits behind a narrow port.** The application depends on an
interface that accepts a validated inquiry and reports success or failure; the
Resend-backed implementation is supplied at the application boundary. This is
the single piece of indirection introduced purely for testability, and it exists
because the revenue-generating flow is otherwise untestable without sending real
mail.

The inquiry email sets the visitor's address as reply-to, so the owner can reply
directly (story 48), and puts event type and date in the subject line for triage
without opening the message (story 47).

Abuse is handled by a honeypot field plus a minimum time-to-submit threshold,
and per-IP rate limiting held in process memory. This is proportionate to the
expected volume and requires no data store.

**Error handling is a functional requirement, not a nicety.** The form reports
success, field-specific validation failures, or a delivery failure that surfaces
the phone number as an alternative. A silently failing contact form is the worst
defect this site can ship, because it destroys the site's only purpose while
appearing to work.

Configuration is two environment variables: the Resend API key and the
destination address.

### Analytics

Vercel Web Analytics, included in the first release at the client's request.

It is cookieless and stores no personal data, and therefore requires no consent
banner. That is the substantive reason for the choice: a consent dialog on every
visit to a nine-page portfolio costs conversions, and conversion is the site's
only purpose. Stories 53 and 54 are satisfied by this decision rather than by
additional work.

Google Analytics 4 would reverse this: it would require a compliant consent
banner, deferred loading until consent, and a processor section in the privacy
policy. It is not adopted unless the client specifically requires it.

### Legal identity

The business operates as *działalność nierejestrowana* — unregistered activity
under Polish law, with no NIP, REGON, or company entity.

- The footer carries the owner's name, service region, phone, email and
  Instagram. No company registration numbers, because none exist.
- Structured data describes a local business by **service area** — Szczecin,
  Police, Stargard, Goleniów, Świnoujście — and emits no street address.
  Publishing a residential address is unnecessary and unwise.
- The privacy policy names an **individual** as data controller. RODO applies to
  unregistered activity; the controller is simply a person rather than a company.
- No VAT or invoice language appears anywhere. An unregistered business issues a
  *rachunek*, not a *faktura VAT*, and the FAQ must not imply otherwise.

The privacy policy ships with placeholder legal copy marked for completion. Its
route, layout, and footer link are real from the first release; only the text is
outstanding.

### Search visibility

Per-page metadata via the framework metadata API. Structured data describing the
local business on the home page and the FAQ on the FAQ page. Generated sitemap
and robots files. Open Graph images so shared links render a preview (story 22).

Alternative text for photographs is authored per realization in Polish, not
generated from a template, because templated alt text serves neither screen
reader users (story 62) nor search.

## Testing Decisions

### What makes a good test here

A test asserts what a visitor or the business owner can observe: a page shows
the work, a form reports success, an inquiry reaches the owner. It does not
assert that a component received a particular prop, that a class name is
present, or that a function was called. Markup, class names and component
structure will change throughout the life of this site; behaviour will not.

Tests are written against the two seams identified below and nowhere else. The
count of seams is kept deliberately low — indirection introduced solely to
enable testing is a cost, and is only paid where the alternative is leaving a
critical flow untested.

### Seams

**The HTTP boundary of the running application.** Playwright drives a real
browser against a real server. This is the highest available seam and covers
almost the entire product: navigation, the realizations index and its two
sections, realization detail pages, and the contact form's full behaviour.

**The outbound email port.** The one place where the application reaches the
outside world. Tests substitute a recording fake for the Resend implementation,
which makes the delivery flow assertable without sending mail and without
network access.

No third seam. No component-level tests, no mocking of framework internals, no
markup snapshots.

### What is tested

Through the browser seam:

- A visitor can reach a realization detail page from the homepage and see its
  photographs
- A realization's link carries a title, a description and an image that
  resolves absolutely, so it previews when pasted into a messaging app
- The realizations index shows both category sections, each containing its
  realizations
- Submitting a valid inquiry produces a visible success state
- Submitting an invalid inquiry produces field-specific errors and does not
  send
- A delivery failure produces an error state that includes the phone number
- Every navigable route responds successfully

Through the email port:

- A valid submission produces exactly one inquiry, carrying the submitted
  values, addressed to the configured recipient, with reply-to set to the
  visitor
- A submission failing validation produces no inquiry
- A submission tripping the honeypot or time threshold produces no inquiry

As static assertions over content — closer to a build-time check than a test:

- Every slug in the registry resolves to a realization
- Every category is one of the two permitted values
- No duplicate slugs
- Every realization has at least one photograph and a cover image

### What is not tested

Layout components, the FAQ page, the privacy policy page, the about page,
metadata generation, and sitemap output. These are either static content or
framework wiring, where a test would restate the implementation rather than
constrain behaviour.

One exception, added when `/realizacje/[slug]` was built: the shared-link
preview above. The reasoning for the exclusion does not reach it. Whether a
title renders is framework wiring, but whether the preview image resolves to an
absolute URL is a behaviour with a silent failure mode — the page looks
perfect, and only the link previews as nothing, which is precisely the outcome
story 22 exists to prevent.

### Prior art

None in this repository — it is new. The sibling `shop_sznyt_design` project
uses Vitest with Playwright for end-to-end coverage and is the closest reference
for tooling configuration, though its tests target a different framework and
architecture and should not be used as a structural model.

## Out of Scope

No content management system, admin interface, or client-facing upload. Content
is maintained by the developer through commits.

No internationalization. The site is Polish-only. No routing, dictionary, or
locale scaffolding is added in anticipation of a second language.

No online shop, cart, checkout, payments, or pricing calculator. The sibling
project's commerce functionality is explicitly not carried over.

No user accounts, authentication, or client portal.

No blog, newsletter, or booking calendar.

No Google Analytics or any cookie-setting tracker, and therefore no consent
banner.

No animation library. Transitions are written in CSS until a specific need
demonstrates that a library is required.

No hero video in the first release. The design accommodates it; the footage does
not exist yet.

No separate category pages for weddings and events. Revisited when the archive
roughly doubles.

No automated image ingestion pipeline. Metadata modules are hand-authored;
scanning folders with an image library is deferred until the archive exceeds
roughly twenty realizations.

## Further Notes

### Outstanding client input

None of these block implementation. All of them block launch.

- The owner's name as it should appear publicly, phone number, email address,
  and Instagram handle
- Real copy for the about page and answers for the FAQ
- A photograph of the person running the business, for the about page. It ships
  as the same generated placeholder card the launch realizations use, and story
  25 — seeing who you would be working with — is not served until it is real
- Privacy policy details, replacing placeholder text
- Photographs and metadata for the nine launch realizations
- Hero video, whenever it is shot
- Confirmation that Vercel Web Analytics is what the client means by
  "analytics", rather than Google Analytics

### Risks

**Nine realizations is a thin archive.** The layouts must look deliberate at
that volume rather than sparse, and detail pages must hold up when an event has
only five photographs. Design for the sparse case first; a layout that only
works when full will look broken at launch.

**A dark palette is unforgiving of inconsistent photography.** This works in the
site's favour — a dark ground hides uneven exposure across a mixed archive — but
it demands genuine attention to text contrast, which is the accessibility risk
in stories 62 and 65.

**The chosen visual direction can drift cold.** The palette is dark aubergine
taken from the logo's ink, while the logo itself is soft, pale, and hand-drawn.
Warm copy and generous spacing are what keep the site elegant rather than
severe. This was raised during design, overruled deliberately, and is recorded
here as something to check finished pages against rather than as an unresolved
objection.

### A note for the client, outside the site's scope

*Działalność nierejestrowana* carries a monthly revenue ceiling. If this site
succeeds at its purpose, the business will cross it and need to register. That
is a decision for the owner to plan for, but it should not arrive as a surprise
caused by the site working.
