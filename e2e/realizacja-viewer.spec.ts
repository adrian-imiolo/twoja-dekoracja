import { expect, test, type Locator, type Page } from "./test";

/**
 * The viewer that opens over a realization's column of photographs.
 *
 * Against the realization with the largest set as authored today, so there is
 * room to move in both directions and to reach the end. Like
 * `realizacja-nav.spec.ts`, this couples to authored content on purpose.
 */
const SLUG = "chrzest-i-roczek";
const PHOTO_COUNT = 5;

const url = `/realizacje/${SLUG}`;

function viewer(page: Page): Locator {
  return page.getByRole("dialog");
}

function columnButton(page: Page, index: number): Locator {
  return page.getByRole("main").getByRole("button").nth(index);
}

/**
 * Closing the viewer unmounts its images, and a request the browser drops
 * partway through poisons that image on the test server for every later test
 * (see `./test.ts`). So the viewer's image requests are let finish before it
 * is closed.
 */
async function letViewerImagesFinish(page: Page) {
  await expect
    .poll(() =>
      // Every image, not only the current one: its neighbours load too.
      viewer(page)
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete ||
              !(image as HTMLImageElement).currentSrc,
          ),
        ),
    )
    .toBe(true);
}

test("opens at the photograph clicked and moves one photograph at a time, without wrapping", async ({
  page,
}) => {
  await page.goto(url);

  await expect(viewer(page)).toHaveCount(0);

  await columnButton(page, 1).click();
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page)).toContainText(`2 / ${PHOTO_COUNT}`);

  await page.keyboard.press("ArrowRight");
  await expect(viewer(page)).toContainText(`3 / ${PHOTO_COUNT}`);

  const next = viewer(page).getByRole("button", { name: "Następne zdjęcie" });
  for (let index = 4; index <= PHOTO_COUNT; index += 1) {
    await next.click();
    await expect(viewer(page)).toContainText(`${index} / ${PHOTO_COUNT}`);
  }
  await expect(next).toBeDisabled();

  await letViewerImagesFinish(page);
});

test("shows one photograph at a time, whole within the screen", async ({
  page,
}) => {
  await page.goto(url);
  await columnButton(page, 1).click();

  const shown = viewer(page).getByRole("img").locator("visible=true");
  await expect(shown).toHaveCount(1);

  const box = await shown.boundingBox();
  const size = page.viewportSize()!;
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(size.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(size.height);

  await letViewerImagesFinish(page);
});

/**
 * A one-finger drag through the DevTools protocol, which is what reaches the
 * page as real `touchstart`/`touchmove`/`touchend`; Playwright's own
 * touchscreen only taps.
 */
async function swipe(page: Page, dx: number, dy: number) {
  const session = await page.context().newCDPSession(page);
  const size = page.viewportSize()!;
  const start = { x: size.width / 2, y: size.height / 2 };
  const steps = 8;

  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [start],
  });
  for (let step = 1; step <= steps; step += 1) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: start.x + (dx * step) / steps,
          y: start.y + (dy * step) / steps,
        },
      ],
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}

test("a sideways swipe moves to the next photograph, and a short one does not", async ({
  page,
}) => {
  await page.goto(url);
  await columnButton(page, 1).click();
  await expect(viewer(page)).toContainText(`2 / ${PHOTO_COUNT}`);

  await swipe(page, -30, 0);
  await expect(viewer(page)).toContainText(`2 / ${PHOTO_COUNT}`);

  await swipe(page, -200, 0);
  await expect(viewer(page)).toContainText(`3 / ${PHOTO_COUNT}`);

  await swipe(page, 200, 0);
  await expect(viewer(page)).toContainText(`2 / ${PHOTO_COUNT}`);

  await letViewerImagesFinish(page);
});

test("a swipe down closes it and stays on the realization", async ({
  page,
}) => {
  await page.goto(url);
  const address = page.url();
  await columnButton(page, 1).click();
  await expect(viewer(page)).toBeVisible();
  await letViewerImagesFinish(page);

  await swipe(page, 0, 40);
  await expect(viewer(page)).toBeVisible();

  await swipe(page, 0, 200);
  await expect(viewer(page)).toHaveCount(0);
  expect(page.url()).toBe(address);
});

test("a click beside the photograph closes it", async ({ page }) => {
  await page.goto(url);
  await columnButton(page, 1).click();
  await expect(viewer(page)).toBeVisible();
  await letViewerImagesFinish(page);

  await viewer(page).click({ position: { x: 5, y: 200 } });
  await expect(viewer(page)).toHaveCount(0);
});

test("Escape closes it, hands focus back to the photograph and leaves the address alone", async ({
  page,
}) => {
  await page.goto(url);
  const address = page.url();

  await columnButton(page, 1).click();
  await expect(viewer(page)).toBeVisible();
  await letViewerImagesFinish(page);

  await page.keyboard.press("Escape");
  await expect(viewer(page)).toHaveCount(0);
  await expect(columnButton(page, 1)).toBeFocused();
  expect(page.url()).toBe(address);
});

test("the back button closes it and stays on the realization", async ({
  page,
}) => {
  await page.goto(url);
  const address = page.url();

  await columnButton(page, 1).click();
  await expect(viewer(page)).toBeVisible();
  await letViewerImagesFinish(page);

  await page.goBack();
  await expect(viewer(page)).toHaveCount(0);
  expect(page.url()).toBe(address);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
