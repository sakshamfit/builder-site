"use client";

import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { useMode } from "@/components/layout/ModeProvider";
import styles from "./layout.module.css";

/**
 * The appearance switch.
 *
 * Adapted from the day↔night control in the header of the owner's `vistaRail`
 * repository (see ASSET_CREDITS.md §10). The choreography is kept — both glyphs
 * sit in the same box and cross-fade in place, rotating and scaling, so the
 * button never changes width and nothing on the row moves — and the two stacked
 * labels are reduced to one, because this header carries four navigation links
 * and a menu button beside it.
 *
 * It is a real toggle button, and the two halves of that are kept apart: the
 * accessible name says what the control *is* and never changes, while
 * `aria-pressed` reports whether it is on. The visible word follows the
 * destination instead — a moon and "Night" while the page is paper — which is
 * clearer to the eye than a state, and which is `aria-hidden` so it cannot
 * contradict the name a screen reader announces.
 */
export function ModeToggle() {
  const { mode, toggle } = useMode();
  const isNight = mode === "night";

  return (
    <button
      type="button"
      className={styles.modeToggle}
      aria-pressed={isNight}
      aria-label="Night appearance"
      onClick={toggle}
    >
      <span className={styles.modeGlyphs} aria-hidden="true">
        <MoonIcon className={`${styles.modeGlyph} ${styles.modeGlyphMoon}`} />
        <SunIcon className={`${styles.modeGlyph} ${styles.modeGlyphSun}`} />
      </span>
      <span className={styles.modeWord} aria-hidden="true">
        {isNight ? "Day" : "Night"}
      </span>
    </button>
  );
}
