import type { Page } from "./test";

/**
 * Resolves a theme colour the way the browser reports a computed one, so a
 * test can compare it with `toHaveCSS` whatever notation the theme uses.
 */
export async function themeColour(page: Page, name: string): Promise<string> {
  return page.evaluate(function resolve(variable) {
    const probe = document.createElement("div");
    probe.style.color = `var(${variable})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, name);
}
