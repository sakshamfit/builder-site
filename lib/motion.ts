/**
 * Motion.
 *
 * One source of truth for the site's easings and durations — the same values
 * `app/globals.css` publishes as custom properties, kept here so client
 * components can drive a transition without hard-coding a curve, and so the two
 * can be checked against each other (`npm run check` reads the stylesheet and
 * fails if these drift).
 *
 * The motion is deliberately slight: the site moves the way paper does, not the
 * way a trailer does. Reveals are opacity and translate; nothing bounces, nothing
 * loops except the marquee, and everything here is inert for a reader who has
 * asked for reduced motion — the global rule in `app/globals.css` removes it.
 *
 * Adapted from the motion language of the owner's `vistaRail` repository (see
 * ASSET_CREDITS.md §10), which is where the day↔night crossfade and the quiet
 * scroll cue are also adapted from. Its easing curves are kept; its
 * framer-motion dependency is not — these are plain values applied through CSS.
 */

export const MOTION = {
  /** Named curves. The names are the ones in the stylesheet. */
  ease: {
    /** Default: a calm decelerating curve. `--ease`. */
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    /** Symmetric, for reversible changes such as the day↔night flip. `--ease-inout`. */
    inOut: "cubic-bezier(0.76, 0, 0.24, 1)",
    /** Slightly slower to settle: used for the theme crossfade and the cue. `--ease-premium`. */
    premium: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  /** Durations in milliseconds, as the CSS custom properties express them. */
  duration: {
    fast: 150,
    base: 280,
    slow: 600,
    /** The day↔night crossfade. Long enough to read as a lighting change. */
    theme: 620,
    /** Reveal-on-scroll travel. */
    reveal: 900,
    /** The hero's own entrance animation, matched by the cue's delay. */
    heroEntrance: 1100,
  },
  /**
   * When things happen, in milliseconds from the moment the page is ready.
   * The hero's title animates itself in CSS first; the cue follows it, so the
   * invitation to scroll never lands on top of the title still arriving.
   */
  sequence: {
    scrollCue: 1100 + 260,
  },
} as const;

/**
 * The stylesheet properties these values are published as. The check suite
 * compares each entry here against `app/globals.css`, which is what keeps the
 * claim in this file's header honest.
 */
export const MOTION_CSS_PROPERTIES = {
  "ease.out": "--ease",
  "ease.inOut": "--ease-inout",
  "ease.premium": "--ease-premium",
  "duration.fast": "--dur-fast",
  "duration.base": "--dur",
  "duration.slow": "--dur-slow",
  "duration.theme": "--theme-dur",
} as const;
