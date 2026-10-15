"use client";

import { useSyncExternalStore } from "react";
import {
  readPaused,
  readReducedMotion,
  readServerPaused,
  readServerReducedMotion,
  setPaused,
  subscribePlayback,
  subscribeReducedMotion,
} from "@/lib/playback";
import styles from "./cinematic.module.css";

/**
 * "Pause films" — one control for everything on the page that moves by itself.
 *
 * Adapted from the playback control in the owner's `gireeshkumarreddy/pk`
 * repository (ASSET_CREDITS.md §11): a quiet label fixed to a corner of the
 * screen, drawn in `difference` so it reads over cream, crimson and film alike.
 *
 * The accessible pattern is the appearance switch's: the name is a constant and
 * the state is `aria-pressed`, so a screen reader hears "Pause the moving
 * pictures, toggle button, pressed" rather than a name that changes under it.
 * The visible word follows the next action and is hidden from assistive tech.
 *
 * A reader who asks for reduced motion has nothing moving to pause — no video
 * element is ever created for them — so the control is not rendered at all.
 */
export function PlaybackControl() {
  const paused = useSyncExternalStore(subscribePlayback, readPaused, readServerPaused);
  const reduced = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readServerReducedMotion);

  if (reduced) return null;

  return (
    <div className={styles.playback} data-overlay="">
      <button
        type="button"
        className={styles.playbackButton}
        aria-pressed={paused}
        aria-label="Pause the moving pictures on this page"
        onClick={() => setPaused(!paused)}
      >
        <span className={styles.playbackIcon} data-state={paused ? "paused" : "playing"} aria-hidden="true" />
        <span aria-hidden="true">{paused ? "Play films" : "Pause films"}</span>
      </button>
    </div>
  );
}
