# Realizacje

One folder per realization. Adding one is: create the folder, drop the
photographs in, write `index.ts`, add one line to the registry, push.

```
content/realizacje/
  index.ts                    the registry; display order lives here
  types.ts                    Realizacja, Fotografia, Kategoria
  integrity.ts                the rules TypeScript cannot express
  <slug>/
    index.ts                  metadata + ordered photo imports
    01.jpg … NN.jpg
```

## Adding a realization

1. Create `content/realizacje/<slug>/`. The folder name **is** the URL segment
   under `/realizacje`, so it must be lowercase ASCII with single hyphens and
   no Polish diacritics, even though everything else here is Polish.
2. Drop the photographs in, named `01.jpg` upwards in the order they should
   appear in the gallery.
3. Write `index.ts`. Copy an existing one, such as `wesele/index.ts`, and
   replace its contents.
4. Import it in `content/realizacje/index.ts` and add it to `realizacje` at the
   position you want it shown.

Display order is authored by hand, so the strongest work can lead regardless
of when it happened.

## Two things that are not negotiable

Photographs are statically imported, never referenced by path string:

```ts
import zdjecie01 from "./01.jpg"; // the build learns width and height
const zdjecie01 = "/realizacje/x/01.jpg"; // the build learns nothing
```

The portfolio spec's "Content model" section records what the import buys.

The `intro` is also the page's meta description, so it is the snippet Google
shows under the search result. Two sentences, under about 160 characters; past
that the listing ends mid-thought.

Every photograph carries its own Polish alt text: a sentence describing what is
in the frame, written for that photograph and not derived from the title. It is
what a screen reader user gets instead of the photograph, and it is what search
reads.

## When something is wrong

| What                                                          | Caught by                                               |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| Missing field, unknown category, empty gallery                | compile error in `tsc`, and so also `next build`        |
| Duplicate slug, bad slug shape, blank prose, missing alt text | `assertRealizacjeValid`, thrown when the registry loads |
| A folder you forgot to add to the registry                    | `registry.test.ts`                                      |
| The same photograph filed under two realizations              | `registry.test.ts`                                      |

The thrown rules fail `next build`: `/realizacje/[slug]` imports the registry
to generate its static params, so a malformed realization stops a deployment
before it reaches the live site. `npm test` catches the same faults earlier
and names them more clearly.

## Outstanding

The seven realizations currently published are real events with real
photographs. `place` and `date` are not yet known for any of them and ship as
`DO_UZUPELNIENIA` (see `miejsceITermin` in `src/lib/site.ts`), which
`RealizationCard` and `/realizacje/[slug]` render conditionally. Fill in the
real venue and date per realization before launch.
