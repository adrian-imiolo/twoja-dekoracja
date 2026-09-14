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
      viewer(page)
        .getByRole("img")
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

test("zooms the photograph to its own size and back", async ({ page }) => {
  await page.goto(url);
  await columnButton(page, 1).click();

  const slide = viewer(page).getByTestId("slajd").nth(1);
  const zoomIn = slide.getByRole("button", { name: "Powiększ" });
  await zoomIn.click();

  const zoomOut = slide.getByRole("button", { name: "Pomniejsz" });
  await expect(zoomOut).toBeVisible();
  const overflows = await slide.evaluate((element) => {
    const image = element.querySelector("img")!;
    return (
      element.scrollWidth > element.clientWidth ||
      image.getBoundingClientRect().width > window.innerWidth
    );
  });
  expect(overflows).toBe(true);

  await zoomOut.click();
  await expect(slide.getByRole("button", { name: "Powiększ" })).toBeVisible();
  const fits = await slide.evaluate(
    (element) => element.scrollWidth <= element.clientWidth,
  );
  expect(fits).toBe(true);

  await letViewerImagesFinish(page);
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
