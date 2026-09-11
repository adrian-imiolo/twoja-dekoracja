import { expect, test } from "@playwright/test";

/**
 * One of the realizations the repository publishes today. These are authored
 * content, so replacing this event means editing them — a coupling that is
 * deliberate, and that fails loudly rather than quietly passing against a
 * page that no longer exists.
 */
const SLUG = "wesele";
const TITLE = "Wesele";
const STYLE =
  "Balonowe kolumny i łuki w zieleni, złocie, srebrze i bieli - wewnątrz sali i w plenerze ogrodu";
const PHOTO_COUNT = 7;

const url = `/realizacje/${SLUG}`;

/** Scroll the whole page so lazily loaded photographs are actually requested. */
async function scrollToBottom(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    }
    window.scrollTo(0, document.body.scrollHeight);
  });
}

test("shows its style and an introduction, and no unfilled placeholder text", async ({
  page,
}) => {
  await page.goto(url);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(TITLE);

  const article = page.getByRole("main");
  await expect(article).toContainText(STYLE);
  // A distinctive fragment of the two-sentence introduction.
  await expect(article).toContainText("stołu prezydialnego");

  /*
   * `place` and `date` are outstanding client input for every launch
   * realization and ship as `[DO UZUPEŁNIENIA]` — rendered conditionally
   * rather than as literal text, so a visitor to this real, published page
   * never sees the marker. A regression here would be a silent one: the page
   * would still look complete.
   */
  await expect(article).not.toContainText("DO UZUPEŁNIENIA");
});

test("shows every photograph of the event, each with its own description", async ({
  page,
}) => {
  // Seven photographs, each brought into view and waited for in turn.
  test.slow();

  await page.goto(url);

  const photographs = page.getByRole("main").getByRole("img");
  await expect(photographs).toHaveCount(PHOTO_COUNT);

  const alts = await photographs.evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).alt),
  );
  for (const alt of alts) {
    expect(alt.trim()).not.toBe("");
  }
  // Templated alt text ("… — zdjęcie 3") would repeat itself; authored text
  // does not.
  expect(new Set(alts).size).toBe(alts.length);

  /*
   * Each photograph is waited for where a visitor meets it — in view — rather
   * than by scrolling past the whole gallery and then asking whether
   * everything arrived.
   *
   * The difference is not pedantry. A browser gives an image that has scrolled
   * out of sight the lowest priority it has, and will leave the request
   * unfinished indefinitely rather than spend a connection on something nobody
   * is looking at. Traces of three CI runs show exactly that: the first, sixth,
   * seventh and eighth photographs served in under 60 ms, and the three left
   * far above the fold by the scroll never delivered at all. A fast machine
   * hides it by finishing them before the scroll ends.
   */
  for (let index = 0; index < PHOTO_COUNT; index += 1) {
    const photograph = photographs.nth(index);
    await photograph.scrollIntoViewIfNeeded();

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
  await scrollToBottom(page);

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

/**
 * Where each photograph sits on the page, in document coordinates rather than
 * viewport ones, so the measurements survive the scrolling above.
 */
async function photographBoxes(page: import("@playwright/test").Page) {
  return page
    .getByRole("main")
    .getByRole("img")
    .evaluateAll((images) =>
      images.map((image) => {
        const rect = image.getBoundingClientRect();
        return {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          width: rect.width,
        };
      }),
    );
}

test("sets its photographs one after another rather than in a grid", async ({
  page,
}) => {
  await page.goto(url);
  await scrollToBottom(page);

  const boxes = await photographBoxes(page);
  expect(boxes.length).toBeGreaterThan(1);

  // No two photographs share a row. This is what lets the page hold up at
  // five: a grid's final row would be left with orphans, a sequence has no
  // final row to strand them in.
  for (let i = 1; i < boxes.length; i += 1) {
    expect(boxes[i].top).toBeGreaterThanOrEqual(boxes[i - 1].bottom - 1);
  }
});

test("scrolls vertically on a phone, with nothing pushed off the side", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await scrollToBottom(page);

  const { scrollWidth, innerWidth, scrollHeight, innerHeight } =
    await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));

  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  expect(scrollHeight).toBeGreaterThan(innerHeight);

  // Large photographs, not thumbnails: each one fills the column it is given.
  for (const box of await photographBoxes(page)) {
    expect(box.width).toBeGreaterThan(innerWidth * 0.8);
  }
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
