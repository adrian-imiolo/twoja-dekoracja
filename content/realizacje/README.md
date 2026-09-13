# Realizacje

One folder per event. Adding one is: create the folder, drop the photographs
in, write `index.ts`, add one line to the registry, push.

```
content/realizacje/
  index.ts                    the registry — display order lives here
  types.ts                    Realizacja, Fotografia, Kategoria
  integrity.ts                the rules TypeScript cannot express
  <slug>/
    index.ts                  metadata + ordered photo imports
    01.jpg … NN.jpg
```

## Adding a realization

1. Create `content/realizacje/<slug>/`. The folder name **is** the URL segment
   under `/realizacje`, so it must be lowercase ASCII with single hyphens — no
   Polish diacritics, even though everything else here is Polish.
2. Drop the photographs in, named `01.jpg` upwards in the order they should
   appear in the gallery.
3. Write `index.ts`. Copy `wesele-anny-i-piotra/index.ts` and replace it.
4. Import it in `content/realizacje/index.ts` and add it to `realizacje` at the
   position you want it shown.

Display order is authored, not sorted — neither alphabetical nor date-derived,
so the strongest work can lead regardless of when it happened.

## Two things that are not negotiable

**Photographs are statically imported**, never referenced by path string:

```ts
import zdjecie01 from "./01.jpg"; // ✅ the build learns width and height
const zdjecie01 = "/realizacje/x/01.jpg"; // ❌ it does not
```

The import is what gives the build intrinsic dimensions, and those are what
remove layout shift and produce blur-up placeholders without a single
hand-maintained number.

The `intro` is also the page's meta description, so it is the snippet Google
shows under the search result. Two sentences, under about 160 characters —
past that the listing ends mid-thought.

**Every photograph carries its own Polish alt text.** Not templated, not
derived from the title — a sentence describing what is in the frame. It is what
a screen reader user gets instead of the photograph, and it is what search
reads.

## When something is wrong

| What                                                          | Caught by                                               |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| Missing field, unknown category, empty gallery                | compile error — `tsc`, and so also `next build`         |
| Duplicate slug, bad slug shape, blank prose, missing alt text | `assertRealizacjeValid`, thrown when the registry loads |
| A folder you forgot to add to the registry                    | `registry.test.ts`                                      |
| The same photograph filed under two realizations              | `registry.test.ts`                                      |

The thrown rules fail `next build`: `/realizacje/[slug]` imports the registry
to generate its static params, so a malformed realization stops a deployment
rather than reaching the live site. `npm test` catches the same faults earlier
and names them more clearly.

## Outstanding

The six realizations currently published are real events with real
photographs. `place` and `date` are not yet known for any of them and ship as
`DO_UZUPEŁNIENIA` — see `src/lib/site.ts` — which `RealizationCard` and
`/realizacje/[slug]` render conditionally rather than as literal placeholder
text. Fill in the real venue and date per realization before launch.
