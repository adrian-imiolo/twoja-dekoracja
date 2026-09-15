import { expect, test, type Locator, type Page } from "./test";
import { themeColour } from "./theme-colour";

/**
 * The stage and thumbnails a realization's photographs are shown on.
 *
 * Against the realization with the largest set as authored today, and one that
 * mixes portraits with landscapes, so there is room to move both ways and a
 * frame that followed each photograph's shape would show. Like
 * `realizacja-nav.spec.ts`, this couples to authored content on purpose.
 */
const REALIZACJA = "chrzest-i-roczek";
const LICZBA_ZDJEC = 5;

const url = `/realizacje/${REALIZACJA}`;

function gallery(page: Page): Locator {
  return page.getByRole("region", { name: "Galeria" });
}

function stage(page: Page): Locator {
  return gallery(page).getByRole("button").first();
}

function thumbnails(page: Page): Locator {
  return gallery(page).getByRole("listitem").getByRole("button");
}

async function expectCurrent(page: Page, index: number) {
  await expect(thumbnails(page).nth(index)).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(
    gallery(page).getByRole("listitem").locator('[aria-current="true"]'),
  ).toHaveCount(1);
}

/**
 * Leaving a photograph mid-download poisons it on the test server (see
 * `./test.ts`), so the gallery's images are let finish before a test moves on
 * to closing things.
 */
async function letImagesFinish(page: Page) {
  await expect
    .poll(function allSettled() {
      return page.locator("img").evaluateAll(function settled(images) {
        return images.every(function done(image) {
          const img = image as HTMLImageElement;
          return img.complete || !img.currentSrc;
        });
      });
    })
    .toBe(true);
}

/** A one-finger drag through the DevTools protocol, from a given point. */
async function swipe(
  page: Page,
  from: { x: number; y: number },
  dx: number,
  dy: number,
) {
  const session = await page.context().newCDPSession(page);
  const steps = 8;

  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [from],
  });
  for (let step = 1; step <= steps; step += 1) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: from.x + (dx * step) / steps, y: from.y + (dy * step) / steps },
      ],
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}

async function stageCentre(page: Page) {
  const box = await stage(page).boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

test("starts on the first photograph, with a thumbnail for every one", async ({
  page,
}) => {
  await page.goto(url);

  await expect(thumbnails(page)).toHaveCount(LICZBA_ZDJEC);
  await expectCurrent(page, 0);
  await expect(
    gallery(page).getByRole("button", { name: "Poprzednie zdjęcie" }),
  ).toBeDisabled();

  await letImagesFinish(page);
});

test("the stage, its arrows and a thumbnail show the brand focus ring to a keyboard", async ({
  page,
}) => {
  await page.goto(url);
  const blush = await themeColour(page, "--color-blush-300");

  // Onto the second photograph, so neither arrow is disabled and skipped.
  await thumbnails(page).nth(1).click();
  await stage(page).focus();

  const order = [
    gallery(page).getByRole("button", { name: "Poprzednie zdjęcie" }),
    gallery(page).getByRole("button", { name: "Następne zdjęcie" }),
    thumbnails(page).first(),
  ];
  for (const control of order) {
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS("outline-style", "solid");
    await expect(control).toHaveCSS("outline-color", blush);
  }

  for (let step = 0; step < order.length; step += 1) {
    await page.keyboard.press("Shift+Tab");
  }
  await expect(stage(page)).toBeFocused();
  await expect(stage(page)).toHaveCSS("outline-style", "solid");

  await letImagesFinish(page);
});

test("a thumbnail, the arrows and the arrow keys move the stage, without wrapping", async ({
  page,
}) => {
  await page.goto(url);

  await thumbnails(page).nth(2).click();
  await expectCurrent(page, 2);

  const next = gallery(page).getByRole("button", { name: "Następne zdjęcie" });
  await next.click();
  await expectCurrent(page, 3);
  await next.click();
  await expectCurrent(page, 4);
  await expect(next).toBeDisabled();

  // The disabled arrow could not keep focus; the keys must still work.
  await expect(stage(page)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expectCurrent(page, 3);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expectCurrent(page, 4);

  await letImagesFinish(page);
});

test("moving through the stage adds nothing to the history", async ({
  page,
}) => {
  await page.goto(url);
  const before = await page.evaluate(function dlugoscHistorii() {
    return history.length;
  });

  await thumbnails(page).nth(3).click();
  await gallery(page).getByRole("button", { name: "Następne zdjęcie" }).click();
  await expectCurrent(page, 4);

  expect(
    await page.evaluate(function dlugoscHistorii() {
      return history.length;
    }),
  ).toBe(before);
  await letImagesFinish(page);
});

test("keeps the same height whatever the shape of the photograph", async ({
  page,
}) => {
  await page.goto(url);

  const heights = new Set<number>();
  for (let index = 0; index < LICZBA_ZDJEC; index += 1) {
    await thumbnails(page).nth(index).click();
    await expectCurrent(page, index);
    const box = await stage(page).boundingBox();
    heights.add(Math.round(box!.height));
  }

  expect(heights.size).toBe(1);
  await letImagesFinish(page);
});

test("on a phone, a sideways swipe moves the stage and a short one does not", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await stage(page).scrollIntoViewIfNeeded();

  await swipe(page, await stageCentre(page), -30, 0);
  await expectCurrent(page, 0);

  await swipe(page, await stageCentre(page), -200, 0);
  await expectCurrent(page, 1);

  await swipe(page, await stageCentre(page), 200, 0);
  await expectCurrent(page, 0);

  // A swipe is not a tap: the viewer stays shut.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await letImagesFinish(page);
});

test("the viewer opens on the stage's photograph and closing leaves the stage where the viewer ended", async ({
  page,
}) => {
  await page.goto(url);
  const address = page.url();

  await thumbnails(page).nth(1).click();
  await stage(page).click();

  const viewer = page.getByRole("dialog");
  await expect(viewer).toContainText(`2 / ${LICZBA_ZDJEC}`);

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(viewer).toContainText(`4 / ${LICZBA_ZDJEC}`);
  await letImagesFinish(page);

  await viewer.getByRole("button", { name: "Zamknij" }).click();
  await expect(viewer).toHaveCount(0);
  await expectCurrent(page, 3);
  await expect(stage(page)).toBeFocused();
  expect(page.url()).toBe(address);
});
