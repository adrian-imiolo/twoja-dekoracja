# Per-IP rate limiting is held in process memory

The inquiry endpoint counts submissions per sender in a plain `Map` at module
scope in `src/app/api/kontakt/route.ts`: five per sliding hour, at most ten
thousand senders remembered, all of it lost when the instance is recycled. Both
specs asked for this ("per-IP rate limiting held in process memory",
`docs/superpowers/specs/2026-09-06-twoja-dekoracja-portfolio-spec.md:246`), and
it was reaffirmed when the alternatives were put to the owner while picking up
issue #8. It is written down because the code looks broken to anyone who knows
how serverless works.

## Considered options

**Vercel WAF rate-limit rule.** The only option that holds across instances: it
counts in one place, applies to every instance, and rejects a flood before it
reaches the function. Rejected because it lives in the Vercel dashboard rather
than in this repository, cannot be covered by the test suite, and needs a paid
plan. Three costs to protect one person's inbox on a nine-page portfolio.

**Vercel BotID.** Rejected for the same reason, plus it answers a different
question: it decides whether a caller is a bot, where the risk here is a
plausible-looking script repeating a plausible-looking inquiry.

**In process memory.** Chosen. It needs no service, data store, money or
configuration outside the repository, and it is testable without a network.

## Consequences

**The limit leaks across instances, and that is accepted.** A deployment
running several instances gives one sender an allowance per instance they land
on, and a redeploy forgets everyone. A flood still loses most of its volume,
and the thing being protected is one owner's inbox. Do not "fix" this by
reaching for a data store. Revisit the WAF rule instead, and only if real spam
gets through.

**There is no limit at all where `x-real-ip` is absent.** Only that header is
trusted, because `x-forwarded-for` is written by the client and metering it
would have metered a value any sender can rotate at will. Vercel always sets
`x-real-ip`; another host might not, and would silently have no rate limit.

**Senders behind one address share one allowance.** The sixth genuine inquiry
in an hour from an office or a carrier's CGNAT is discarded and, like every
tripped control here, is told it was sent. This is the silent lost inquiry the
portfolio spec warns about (`…portfolio-spec.md:251`), accepted as improbable
at this volume. `[zapytanie] Zgłoszenie odrzucone: limit nadawcy.` in
`vercel logs` is the only evidence it happened.

**It adds a third test seam, against the spec's own rule.** The testing
decisions allow two seams (`…portfolio-spec.md:327`), and this introduces two
more injected dependencies: the limiter itself, and the clock it reads. The
counts have to outlive the request, so something longer-lived than a function
call must hold them; the alternative was hidden mutable state inside
`handler.ts`, which would have made the handler's behaviour depend on invisible
globals and contradicted its own split of responsibilities with `route.ts`. The
clock is injected because the window is an hour wide and the alternative is a
test suite that takes an hour. This licenses injecting long-lived state from
`route.ts`, and nothing more.
