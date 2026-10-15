/**
 * Playback — one switch for every moving picture on a page.
 *
 * Adapted from the `paused` state and the "pause films" control in the owner's
 * `gireeshkumarreddy/pk` repository (ASSET_CREDITS.md §11), with two changes:
 *
 *   1. **The document is the source of truth.** The reader's choice lives on
 *      <html> as `data-films="paused"` — set before first paint by the bootstrap
 *      in `lib/cinematic.ts` — so the CSS loops (the film chapters' drifting
 *      plates, the light sweeps) stop with the videos, not only the videos. The
 *      same pattern `ModeProvider` uses for the appearance.
 *   2. **The choice is remembered.** A reader who stopped the motion once does
 *      not want to stop it again on every page; it is stored, and only ever
 *      cleared by the same control.
 *
 * Separately from the reader's choice, a dialog playing the reel *holds* the
 * background films while it is open, without touching what the reader chose.
 *
 * This is the WCAG 2.2.2 mechanism for the site's moving pictures: anything that
 * moves on its own for more than five seconds can be paused from one control.
 */

export const PLAYBACK_ATTRIBUTE = "data-films";
export const PLAYBACK_STORAGE_KEY = "cinema-at-madhuban:films";

const listeners = new Set<() => void>();
let holds = 0;

export function subscribePlayback(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

/** True when the reader has paused the films. */
export function readPaused(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute(PLAYBACK_ATTRIBUTE) === "paused";
}

/** The server never knows the reader's choice; it renders the playing state. */
export function readServerPaused(): boolean {
  return false;
}

export function setPaused(paused: boolean) {
  const root = document.documentElement;
  if (paused) root.setAttribute(PLAYBACK_ATTRIBUTE, "paused");
  else root.removeAttribute(PLAYBACK_ATTRIBUTE);
  try {
    if (paused) window.localStorage.setItem(PLAYBACK_STORAGE_KEY, "paused");
    else window.localStorage.removeItem(PLAYBACK_STORAGE_KEY);
  } catch {
    /* Storage unavailable: the choice still holds for this page view. */
  }
  emit();
}

/** True while something in front of the page (the reel dialog) holds the films. */
export function readHeld(): boolean {
  return holds > 0;
}

/** Hold the background films; call the returned function to let them go. */
export function holdFilms(): () => void {
  holds += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds = Math.max(0, holds - 1);
    emit();
  };
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function subscribeReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function readReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/** The server cannot know; it renders the still poster, which is safe either way. */
export function readServerReducedMotion(): boolean {
  return true;
}
