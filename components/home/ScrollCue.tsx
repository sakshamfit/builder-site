"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { MOTION } from "@/lib/motion";
import styles from "./home.module.css";

/**
 * Scroll cue — the quiet invitation at the foot of the hero.
 *
 * Adapted from `ScrollCue` in the owner's `vistaRail` repository (see
 * ASSET_CREDITS.md §10). Same behaviour: it waits for the hero's entrance to
 * finish, then fades in, and it fades away as the reader begins to scroll so it
 * never has to be dismissed.
 *
 * Two deliberate differences. The mark is a travelling hairline rather than a
 * mouse outline, to match this site's ruled-poster linework; and the whole cue is
 * *decorative and absent* for a reader who has asked for reduced motion —
 * upstream animates a still dot in that case, here the element is not rendered at
 * all. Nothing is lost: the primary action in the hero already links onward.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** How far the page must scroll before the cue has gone completely. */
const FADE_DISTANCE_PX = 180;

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function ScrollCue() {
  const wrap = useRef<HTMLDivElement>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  useEffect(() => {
    if (reducedMotion) return;
    const element = wrap.current;
    if (!element) return;

    let frame = 0;

    function update() {
      frame = 0;
      const travel = Math.min(1, Math.max(0, window.scrollY / FADE_DISTANCE_PX));
      element!.style.opacity = String(1 - travel);
    }

    function onScroll() {
      /* One update per frame: scroll fires far more often than the screen draws. */
      if (frame === 0) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    /* `scroll-cue` is a stable, un-hashed hook for the print and reduced-motion
       rules in app/globals.css, which cannot address a CSS-module class. */
    <div className={`${styles.cueWrap} scroll-cue`} ref={wrap} aria-hidden="true">
      <div
        className={styles.cue}
        style={{
          animationDelay: `${MOTION.sequence.scrollCue}ms`,
          transitionTimingFunction: MOTION.ease.premium,
        }}
      >
        <span className={styles.cueLabel}>Scroll</span>
        <span className={styles.cueRule}>
          <span className={styles.cueDot} />
        </span>
      </div>
    </div>
  );
}
