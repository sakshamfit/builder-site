import type { SVGProps } from "react";

/**
 * The site's interface glyphs.
 *
 * Drawn here rather than pulled from an icon package for the same reason the
 * fonts are self-hosted: no third-party request, and no icon font shipping a
 * thousand glyphs to render a dozen. All of them are plain geometry on
 * `currentColor`, drawn on a 24-unit box at one stroke weight so a row of them
 * sits on a common baseline, and all of them are decorative — the control or the
 * label beside them carries the meaning, and each icon is `aria-hidden`.
 *
 * The first two are adapted from the icon set in the owner's `vistaRail`
 * repository (see ASSET_CREDITS.md §10); the rest are drawn for the projection
 * house system in app/globals.css. No brand mark, logo or venue likeness is
 * drawn anywhere in this file.
 */

const STROKE = 1.6;

function Glyph({ children, ...props }: SVGProps<SVGSVGElement> & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <g stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

/* --- appearance ----------------------------------------------------------- */

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M20.6 13.6A8.5 8.5 0 1 1 10.4 3.4a6.7 6.7 0 0 0 10.2 10.2Z" />
    </Glyph>
  );
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.7v2.2M12 19.1v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.7 12h2.2M19.1 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" />
    </Glyph>
  );
}

/* --- header --------------------------------------------------------------- */

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="11" cy="11" r="6.2" />
      <path d="M15.6 15.6 20 20" />
    </Glyph>
  );
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M12 21s6.4-5.6 6.4-10.2A6.4 6.4 0 0 0 5.6 10.8C5.6 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.6" r="2.3" />
    </Glyph>
  );
}

export function PersonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="8.4" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </Glyph>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4 12h15M13.4 6.4 19 12l-5.6 5.6" />
    </Glyph>
  );
}

export function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M7 17 17 7M8.6 7H17v8.4" />
    </Glyph>
  );
}

/* --- state and status ----------------------------------------------------- */

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.4V12l3.2 2" />
    </Glyph>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M12 3.2 5.6 5.6v5.9c0 4 2.7 7.1 6.4 9.3 3.7-2.2 6.4-5.3 6.4-9.3V5.6Z" />
      <path d="M9.2 12.1l2 2 3.6-3.9" />
    </Glyph>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="1.6" />
      <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
    </Glyph>
  );
}

export function DeviceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="6.6" y="3.4" width="10.8" height="17.2" rx="2" />
      <path d="M10.6 6.4h2.8" />
    </Glyph>
  );
}

export function PassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="3.4" y="7.4" width="17.2" height="9.2" rx="1.6" />
      <path d="M3.4 12h17.2" />
      <path d="M7.4 15.4h2.2M14.4 15.4h2.2" />
    </Glyph>
  );
}

export function TicketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4.2 8.6V6.8h15.6v1.8a3.4 3.4 0 0 0 0 6.8v1.8H4.2v-1.8a3.4 3.4 0 0 0 0-6.8Z" />
      <path d="M12 7.2v9.6" strokeDasharray="1.6 2.2" />
    </Glyph>
  );
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="1.8" />
      <path d="m4.6 7.4 7.4 5.2 7.4-5.2" />
    </Glyph>
  );
}

/* --- getting to the seat -------------------------------------------------- */

export function LiftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="4.6" y="3.6" width="14.8" height="16.8" rx="1.6" />
      <path d="M12 3.6v16.8" />
      <path d="M8.2 9.4 6.9 8.1 5.6 9.4M15.8 14.6l1.3 1.3 1.3-1.3" />
    </Glyph>
  );
}

export function RestroomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M12 3.6c3 3.4 4.6 6 4.6 8.2a4.6 4.6 0 0 1-9.2 0c0-2.2 1.6-4.8 4.6-8.2Z" />
    </Glyph>
  );
}

export function PopcornIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M6.4 9.4h11.2l-1 10.2H7.4Z" />
      <path d="M6.4 9.4 8 6.2h8l1.6 3.2" />
      <path d="M12 9.4v10.2" />
    </Glyph>
  );
}

export function AccessibleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="4.8" r="1.9" />
      <path d="M12 7.6v5.2h4.2l2.4 7.6" />
      <path d="M12 12.8H8.4L6 20.4" />
    </Glyph>
  );
}

export function ConciergeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M3.8 18.4h16.4" />
      <path d="M6 18.4a6 6 0 0 1 12 0" />
      <path d="M12 9.2V7.4M10.6 7.4h2.8" />
      <circle cx="12" cy="5.6" r="1.6" />
    </Glyph>
  );
}

export function ScreenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="3.4" y="4.6" width="17.2" height="10.4" rx="1.4" />
      <path d="M8.4 19.4h7.2M12 15v4.4" />
    </Glyph>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="4" y="5.4" width="16" height="14.4" rx="1.6" />
      <path d="M4 10h16M8.6 3.6v3.4M15.4 3.6v3.4" />
    </Glyph>
  );
}

export function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 11v5.2M12 7.9h.01" />
    </Glyph>
  );
}

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4 6.6h16M7 12h10M10 17.4h4" />
    </Glyph>
  );
}
