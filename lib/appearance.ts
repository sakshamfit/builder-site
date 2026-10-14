/**
 * Appearance — the day sheet and the night sheet.
 *
 * The site is a printed poster by day: cream stock, crimson ink. This module is
 * the switch that flips it to the late show — the same poster printed in reverse
 * — and it exists so that switch has exactly one definition, shared by the three
 * places that need it:
 *
 *   1. `APPEARANCE_BOOTSTRAP`, the tiny script in `app/layout.tsx` that runs
 *      before first paint and sets the attribute, so a reader who left the site
 *      at night does not get a cream flash first;
 *   2. `components/layout/ModeProvider.tsx`, which owns the state in React and
 *      keeps the `<html>` attribute and the browser theme colour in step;
 *   3. `app/globals.css`, where `[data-mode="night"]` redefines the palette
 *      tokens. No component knows about the theme — they all paint from tokens.
 *
 * Read before changing: the night palette is contrast-checked, and
 * `npm run check` recomputes those ratios from the stylesheet. A colour that
 * fails is a failing build, not a matter of taste.
 */

export type Mode = "day" | "night";

/** The attribute the theme is applied with, on `<html>`. */
export const APPEARANCE_ATTRIBUTE = "data-mode";

/**
 * Attribute present only while a day↔night crossfade is in flight. It exists so
 * the stylesheet can allow surfaces to animate *during* the change without every
 * element carrying a permanent transition on its paint properties.
 */
export const APPEARANCE_TRANSITION_ATTRIBUTE = "data-mode-transition";

/** `localStorage` key holding the reader's explicit choice. */
export const APPEARANCE_STORAGE_KEY = "cinema-at-madhuban:appearance";

/**
 * Browser chrome colour per mode. Must match `--paper` in `app/globals.css`;
 * `npm run check` asserts that it does.
 */
export const APPEARANCE_COLORS: Record<Mode, string> = {
  day: "#f4f1e6",
  night: "#14120f",
};

export function isMode(value: unknown): value is Mode {
  return value === "day" || value === "night";
}

/**
 * The rule, in one place: an explicit choice always wins; otherwise the site
 * follows the operating system, because a visitor whose whole device is dark has
 * already answered the question. Nothing else decides.
 */
export function resolveMode(stored: string | null | undefined, prefersDark: boolean): Mode {
  if (isMode(stored)) return stored;
  return prefersDark ? "night" : "day";
}

/**
 * The pre-paint script.
 *
 * Deliberately tiny and dependency-free: it must be parsed and run before the
 * first paint, and it must never throw in a browser that blocks storage or
 * `matchMedia` (private modes, hardened settings) — every failure falls through
 * to the cream default the server already rendered, which is a page that works.
 *
 * It is built from the constants above rather than typed out again, so the key
 * and the attribute cannot drift apart from the rest of the site.
 */
export const APPEARANCE_BOOTSTRAP = [
  "(function(){try{",
  `var k=${JSON.stringify(APPEARANCE_STORAGE_KEY)},a=${JSON.stringify(APPEARANCE_ATTRIBUTE)};`,
  "var s=null;try{s=window.localStorage.getItem(k);}catch(e){}",
  'var m=(s==="day"||s==="night")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"night":"day");',
  "document.documentElement.setAttribute(a,m);",
  "}catch(e){}})();",
].join("");
