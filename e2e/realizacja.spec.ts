import { expect, test, type Page } from "./test";

import { przewinCalaStrone } from "./crawl";

/**
 * One of the realizations the repository publishes today. These are authored
 * content, so replacing this realization means editing them. The coupling is
 * intended: it fails loudly rather than quietly passing against a page that
 * no longer exists.
 */
const SLUG = "wesele";
const TITLE = "Wesele w ogrodzie";
const STYLE =
  "Okrągła ścianka z balonów w butelkowej zieleni, srebrze i bieli, z tropikalnymi liśćmi - w plenerze ogrodu";
const PHOTO_COUNT = 3;

const url = `/realizacje/${SLUG}`;

/** Scroll the whole page so lazily loaded photographs are requested. */
test("shows its style and an introduction, and no unfilled placeholder text", async ({
  page,
}) => {
  await page.goto(url);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(TITLE);

  const article = page.getByRole("main");
  await expect(article).toContainText(STYLE);
  // A distinctive fragment of the two-sentence introduction.
  await expect(article).toContainText("na trawniku w ogrodzie");

  /*
   * `place` and `date` are outstanding client input for every launch
   * realization and ship as `[DO UZUPEŁNIENIA]`, rendered conditionally
   * rather than as literal text, so a visitor to this real, published page
   * never sees the marker. A regression here would be a silent one: the page
   * would still look complete.
   */
  await expect(article).not.toContainText("DO UZUPEŁNIENIA");
});

/**
 * The stage's photographs: one per photograph of the event. The thumbnails
 * below carry no alt of their own (their buttons are named instead), so they
 * are not counted here.
 */
function stagePhotographs(page: Page) {
  return page
    .getByRole("region", { name: "Galeria" })
    .locator("img[alt]:not([alt=''])");
}

test("shows every photograph of the event, each with its own description", async ({
  page,
}) => {
  // Each photograph is brought onto the stage and waited for in turn.
  test.slow();

  await page.goto(url);

  const photographs = stagePhotographs(page);
  await expect(photographs).toHaveCount(PHOTO_COUNT);

  const alts = await photographs.evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).alt),
  );
  for (const alt of alts) {
    expect(alt.trim()).not.toBe("");
  }
  // Templated alt text ("… - zdjęcie 3") would repeat itself; authored text
  // does not.
  expect(new Set(alts).size).toBe(alts.length);

  /*
   * Each photograph is waited for where a visitor meets it, on the stage,
   * rather than asking whether everything arrived. A browser gives an image
   * nobody is looking at the lowest priority it has and may leave it
   * unfinished indefinitely.
   */
  const thumbnails = page
    .getByRole("region", { name: "Galeria" })
    .getByRole("listitem")
    .getByRole("button");
  for (let index = 0; index < PHOTO_COUNT; index += 1) {
    await thumbnails.nth(index).click();
    const photograph = photographs.nth(index);

    await expect
      .poll(
        () =>
          photograph.evaluate(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        { message: `zdjęcie ${index + 1} powinno się wczytać` },
      )
      .toBe(true);
  }
});

test("holds its layout still while the photographs load", async ({ page }) => {
  await page.goto(url);
  await przewinCalaStrone(page);

  const shift = await page.evaluate(() => {
    type LayoutShift = PerformanceEntry & {
      value: number;
      hadRecentInput: boolean;
    };

    return new Promise<number>((resolve) => {
      let total = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as LayoutShift[]) {
          if (!entry.hadRecentInput) total += entry.value;
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(total);
      }, 500);
    });
  });

  // The "good" threshold for Cumulative Layout Shift. Reserved space from the
  // build's intrinsic dimensions is what keeps this at zero.
  expect(shift).toBeLessThan(0.1);
});

// Whether the page fits a phone at all is `responsive.spec.ts`'s question,
// asked of every page at once; this is only about how big the stage is.
test("shows its stage large on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);

  const stage = page
    .getByRole("region", { name: "Galeria" })
    .getByRole("button")
    .first();
  const box = await stage.boundingBox();
  const innerWidth = await page.evaluate(function szerokosc() {
    return window.innerWidth;
  });

  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(innerWidth * 0.8);
});

test("previews with its own title, description and image when the link is shared", async ({
  page,
  request,
}) => {
  await page.goto(url);

  await expect(page).toHaveTitle(new RegExp(TITLE));

  const metaContent = async (selector: string) =>
    page.locator(selector).first().getAttribute("content");

  expect(await metaContent('meta[name="description"]')).toBeTruthy();
  expect(await metaContent('meta[property="og:title"]')).toContain(TITLE);
  expect(await metaContent('meta[property="og:description"]')).toBeTruthy();

  const image = await metaContent('meta[property="og:image"]');
  expect(image).toBeTruthy();
  // Messaging apps fetch the image from outside the page, so a relative URL
  // never resolves.
  const response = await request.get(new URL(image!).toString());
  expect(response.ok()).toBe(true);
});

test("returns not found for an event it does not publish", async ({ page }) => {
  const response = await page.goto("/realizacje/wesele-ktorego-nie-bylo");

  expect(response?.status()).toBe(404);
});
