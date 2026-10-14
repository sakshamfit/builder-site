import type { SVGProps } from "react";

/**
 * The two interface glyphs the appearance switch needs.
 *
 * Drawn here rather than pulled from an icon package for the same reason the
 * fonts are self-hosted: no third-party request, and no icon font shipping a
 * thousand glyphs to render two. Both are plain geometry on `currentColor`, at
 * the interface weight used elsewhere on the site, and both are decorative —
 * the control carries its own accessible name.
 *
 * Adapted from the icon set in the owner's `vistaRail` repository (see
 * ASSET_CREDITS.md §10): same idea, redrawn to this project's 1.7 stroke and
 * 24-unit box. No brand mark is drawn anywhere on this site.
 */

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M20.6 13.6A8.5 8.5 0 1 1 10.4 3.4a6.7 6.7 0 0 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2.7v2.2M12 19.1v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.7 12h2.2M19.1 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
