import { expect, test, type Page } from "@playwright/test";

import { site } from "../src/lib/site";
import { przejdzCalyServis, przewinCalaStrone } from "./crawl";

/**
 * Every page, at the widths a visitor actually has.
 *
 * The portfolio spec's story 6 names a visitor on a phone over mobile data as
 * the person this site is built for, and a layout that holds on a developer's
 * monitor says nothing about theirs. So each width below walks the whole site
 * and measures every page, rather than a handful of pages each asserting its
 * own viewport — a page added later is measured the day it is linked, and a
 * page that stops fitting fails here rather than in a phone's hand.
 *
 * What "fits" means, and why each rule is the one it is:
 *
 * - Nothing scrolls sideways. On a phone a page that is a few pixels too wide
 *   drifts under the thumb and never sits still.
 * - Nothing is pushed off the side, clipped, or spilling out of its box. An
 *   element that ends past the right edge is unreadable; one that a container
 *   has cut short is, too; and text running out past its panel's edge is
 *   still ugly when it stops short of the screen's. A photograph set to cover
 *   its frame is the one thing allowed to be cut, and it is recognised as
 *   such by being the media itself.
 * - Nothing overlaps. Two pieces of text drawn over each other is what a
 *   fixed height or a negative margin does at a width nobody looked at.
 * - Text is legible without pinching. Anything smaller than 12px is.
 * - The wordmark is on one line. It is one word to the brand — the header's
 *   own comment calls its letter-spacing non-negotiable — and a wrapped name
 *   is the one fault the checks above cannot see, being neither too wide nor
 *   clipped. `Wordmark` forbids the wrap outright, so this is the guard for
 *   the day that is removed.
 * - Nothing needs hover to be reachable. Every link and control is visible
 *   with the pointer nowhere near it, which is where a thumb always is.
 * - Every tap target is one a thumb lands on. WCAG 2.5.8 sets a floor of
 *   24px and exempts links inline in a sentence, whose size a line of text
 *   dictates; a target standing on its own — a nav link, a button, a field —
 *   has no such excuse and is held to 36px, the height the footer's links
 *   and the contact channels were designed to and `footer.spec.ts` already
 *   asks of them.
 */

/**
 * The widths that matter, and why these four.
 *
 * 320 is the narrowest phone still worth supporting and the width at which a
 * letter-spaced wordmark beside four nav links first has to give. 390 is the
 * phone most visitors hold. 768 is a tablet held upright, the first width
 * `sm:` and `md:` layouts both apply at; 1024 is a tablet turned sideways or
 * a small laptop, where `lg:` grids first appear and are at their tightest.
 */
const SZEROKOSCI = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
] as const;

/** Below this a visitor is holding a phone; from it, a tablet. */
const SZEROKOSC_TABLETU = 768;

/**
 * The page nobody links to. The crawl cannot find it, and a visitor who
 * mistypes an address on a phone still deserves a page that fits.
 */
const STRONA_404 = "/oferta-ktorej-nie-ma";

const MIN_ROZMIAR_TEKSTU = 12;
const MIN_CEL_W_TEKSCIE = 24;
const MIN_CEL_SAMODZIELNY = 36;

/** Every way a page can fail to fit, and how each reads in a failure. */
const USTERKI = {
  pozaKrawedzia: "pushed off the side",
  przyciete: "clipped",
  wylewaSie: "spills out",
  nachodza: "overlaps",
  zaMalyTekst: "text too small",
  zlamanyZnak: "wordmark broken over lines",
  niewidoczneCele: "reachable only on hover",
  zaMaleCele: "tap target too small",
} as const;

type Usterka = keyof typeof USTERKI;

interface Pomiar {
  scrollWidth: number;
  innerWidth: number;
  usterki: Record<Usterka, string[]>;
}

/**
 * Everything measured in one pass over the page, so a failure names every
 * offender at once rather than the first one on each run.
 */
async function zmierzStrone(page: Page): Promise<Pomiar> {
  return page.evaluate(
    ({ minTekst, minCelWTekscie, minCelSamodzielny, znak, nazwyUsterek }) => {
      const usterki = Object.fromEntries(
        nazwyUsterek.map((nazwa) => [nazwa, [] as string[]]),
      ) as Record<Usterka, string[]>;

      const opisz = (element: Element) => {
        const klasa =
          element instanceof HTMLElement && element.className
            ? `.${element.className.trim().split(/\s+/).slice(0, 3).join(".")}`
            : "";
        const tekst = (element.textContent ?? "").trim().slice(0, 30);
        return `${element.tagName.toLowerCase()}${klasa}${tekst ? ` "${tekst}"` : ""}`;
      };

      const media = (element: Element) => element.matches("img, video");

      const kontenerPrzycinajacy = (element: Element) => {
        for (
          let przodek = element.parentElement;
          przodek && przodek !== document.body;
          przodek = przodek.parentElement
        ) {
          const { overflowX } = getComputedStyle(przodek);
          if (overflowX === "hidden" || overflowX === "clip") return przodek;
        }
        return null;
      };

      const maWlasnyTekst = (element: Element) =>
        [...element.childNodes].some(
          (wezel) =>
            wezel.nodeType === Node.TEXT_NODE &&
            (wezel.textContent ?? "").trim() !== "",
        );

      const cele = "a, button, input, select, textarea";
      const tekstowe: { element: Element; prostokat: DOMRect }[] = [];

      for (const element of document.body.querySelectorAll("*")) {
        // Hidden from everyone on purpose — the form's honeypot.
        if (element.closest('[aria-hidden="true"]')) continue;

        const prostokat = element.getBoundingClientRect();
        const styl = getComputedStyle(element);

        /*
         * A thumb cannot hover. A control that is in the page but not on it
         * — faded out, hidden, or laid out to nothing until a pointer rests
         * on something — is unreachable on every phone.
         */
        if (
          element.matches(cele) &&
          !element.checkVisibility({
            opacityProperty: true,
            visibilityProperty: true,
          })
        ) {
          usterki.niewidoczneCele.push(opisz(element));
          continue;
        }

        // Nothing to see: laid out empty, or the 1px-by-1px box that text for
        // screen readers alone is folded into. Both are clipped on purpose.
        if (prostokat.width <= 1 || prostokat.height <= 1) continue;
        if (styl.visibility === "hidden") continue;

        /*
         * Past the edge of whatever bounds it: the screen, or a container
         * that clips, whichever is nearer. Only a photograph covering its
         * frame may be cut by a container, and only because that is what
         * covering means.
         */
        const przycinajacy = kontenerPrzycinajacy(element);
        const prawaGranica = przycinajacy
          ? Math.min(
              window.innerWidth,
              przycinajacy.getBoundingClientRect().right,
            )
          : window.innerWidth;
        if (
          (prostokat.right > prawaGranica + 1 || prostokat.left < -1) &&
          !(przycinajacy && media(element))
        ) {
          usterki.pozaKrawedzia.push(opisz(element));
        }

        const { overflowX } = styl;
        const wystaje = element.scrollWidth > element.clientWidth + 1;
        const przycinaMedia = [...element.children].some(media);
        if (
          (overflowX === "hidden" || overflowX === "clip") &&
          wystaje &&
          !przycinaMedia
        ) {
          usterki.przyciete.push(opisz(element));
        }

        /*
         * Content wider than the box it was given, still inside the viewport
         * — an e-mail address with no break in it running out past its
         * panel's edge. Reported at the innermost box only: every ancestor
         * up to the page overflows by the same amount and would only repeat
         * the finding.
         */
        const dzieckoWystaje = [...element.children].some(
          (dziecko) => dziecko.scrollWidth > dziecko.clientWidth + 1,
        );
        if (
          overflowX === "visible" &&
          styl.display !== "inline" &&
          wystaje &&
          !dzieckoWystaje
        ) {
          usterki.wylewaSie.push(
            `${opisz(element)} ${element.scrollWidth}px in ${element.clientWidth}px`,
          );
        }

        if (maWlasnyTekst(element)) {
          tekstowe.push({ element, prostokat });

          if (parseFloat(styl.fontSize) < minTekst) {
            usterki.zaMalyTekst.push(opisz(element));
          }

          // The box holding the name itself, not the link around it, whose
          // height is the badge's.
          if (
            (element.textContent ?? "").trim() === znak &&
            prostokat.height > parseFloat(styl.lineHeight) * 1.5
          ) {
            usterki.zlamanyZnak.push(opisz(element));
          }
        }

        if (element.matches(cele)) {
          // In a sentence, and so as tall as the line the sentence sets.
          const wTekscie =
            styl.display === "inline" && element.closest("p, dd") !== null;
          const minimum = wTekscie ? minCelWTekscie : minCelSamodzielny;
          if (prostokat.height < minimum || prostokat.width < minimum) {
            usterki.zaMaleCele.push(
              `${opisz(element)} ${Math.round(prostokat.width)}x${Math.round(prostokat.height)}`,
            );
          }
        }
      }

      /*
       * Two boxes that each carry text and share more than a hairline of
       * screen, neither inside the other. Padding counts: a link's tap box
       * over a neighbouring line is a mis-tap waiting to happen even when
       * the letters themselves stay apart.
       */
      for (let i = 0; i < tekstowe.length; i += 1) {
        for (let j = i + 1; j < tekstowe.length; j += 1) {
          const a = tekstowe[i];
          const b = tekstowe[j];
          if (a.element.contains(b.element) || b.element.contains(a.element)) {
            continue;
          }
          const szerokosc =
            Math.min(a.prostokat.right, b.prostokat.right) -
            Math.max(a.prostokat.left, b.prostokat.left);
          const wysokosc =
            Math.min(a.prostokat.bottom, b.prostokat.bottom) -
            Math.max(a.prostokat.top, b.prostokat.top);
          if (szerokosc > 2 && wysokosc > 2) {
            usterki.nachodza.push(`${opisz(a.element)} + ${opisz(b.element)}`);
          }
        }
      }

      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        usterki,
      };
    },
    {
      minTekst: MIN_ROZMIAR_TEKSTU,
      minCelWTekscie: MIN_CEL_W_TEKSCIE,
      minCelSamodzielny: MIN_CEL_SAMODZIELNY,
      znak: site.wordmark,
      nazwyUsterek: Object.keys(USTERKI) as Usterka[],
    },
  );
}

/**
 * What is wrong with one page at one width, as lines a reader can act on.
 * Empty when the page fits.
 */
function opiszUsterki(pomiar: Pomiar, sciezka: string, width: number) {
  const gdzie = `${sciezka} at ${width}px`;
  const wynik: string[] = [];

  if (pomiar.scrollWidth > pomiar.innerWidth) {
    wynik.push(
      `${gdzie} scrolls sideways: ${pomiar.scrollWidth}px wide in ${pomiar.innerWidth}px`,
    );
  }

  for (const [nazwa, etykieta] of Object.entries(USTERKI)) {
    // Tap targets are a phone's problem; a pointer lands where it is put.
    if (nazwa === "zaMaleCele" && width >= SZEROKOSC_TABLETU) continue;

    wynik.push(
      ...pomiar.usterki[nazwa as Usterka].map(
        (co) => `${gdzie}, ${etykieta}: ${co}`,
      ),
    );
  }

  return wynik;
}

for (const { width, height } of SZEROKOSCI) {
  test(`every page fits a ${width}px screen`, async ({ page, baseURL }) => {
    // A full crawl with a scroll and a measurement on every page.
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });

    // Gathered rather than asserted page by page, so one run names every
    // fault at this width instead of the first one on each page in turn.
    const znalezione: string[] = [];
    const zmierz = async (sciezka: string) => {
      await przewinCalaStrone(page);
      znalezione.push(
        ...opiszUsterki(await zmierzStrone(page), sciezka, width),
      );
    };

    const odwiedzone = await przejdzCalyServis(page, baseURL!, zmierz);
    expect(odwiedzone.size).toBeGreaterThan(0);

    await page.goto(STRONA_404);
    await zmierz(STRONA_404);

    expect(znalezione).toEqual([]);
  });
}
