/**
 * Venue showcase content.
 *
 * This is the cinema-hall showcase: what the venue looks like and how films are
 * presented here. It is the centrepiece of the site, with ticketing kept as a
 * separate, secondary concern (see lib/ticketing-provider.ts).
 *
 * RIGHTS AND HONESTY RULES FOR THIS FILE
 * -------------------------------------
 * 1. No third-party imagery. Every image here is original artwork generated for
 *    this project — never a film still, poster, studio key art or frame from a
 *    trailer, and never fan-project artwork. Film key art can only be added by
 *    the venue with the distributor's approval, and it must be recorded in
 *    ASSET_CREDITS.md before it ships.
 * 2. `depictsVenue` is false for every placeholder. The UI relies on it: a
 *    placeholder is captioned as illustrative, so nobody reads a generated
 *    image as a photograph of this cinema.
 * 3. A caption never states a fact the venue has not confirmed. Where a
 *    physical detail (screen size, seat type, sound system) is unknown, the
 *    caption says it is being confirmed instead of describing it.
 *
 * To publish real venue photography: drop the approved files into
 * `public/showcase/`, set `depictsVenue: true`, update `src`/`alt`/`caption`,
 * and record the photographer and licence in ASSET_CREDITS.md.
 */

import type { FactStatus } from "@/lib/types";

export type ShowcaseImage = {
  id: string;
  /** Path under /public. */
  src: string;
  /** Describes the image content for assistive technology. */
  alt: string;
  /** Short label shown over the tile. */
  title: string;
  /**
   * One line describing the space. States a confirmed fact, or names what is
   * still being confirmed.
   */
  caption: string;
  /** True only when the image is an approved photograph of this venue. */
  depictsVenue: boolean;
  /** Where the image came from. Shown to the visitor as a provenance line. */
  provenance: string;
};

const PLACEHOLDER_PROVENANCE =
  "Original illustration made for this project — not a photograph of this cinema";

export const showcaseImages: ShowcaseImage[] = [
  {
    id: "auditorium",
    src: "/stills/auditorium.jpg",
    alt: "Illustration of an empty cinema auditorium, rows of dark seats facing a softly glowing blank screen",
    title: "The auditorium",
    caption:
      "Seating, legroom, recliner provision and auditorium layout are still being confirmed with the venue.",
    depictsVenue: false,
    provenance: PLACEHOLDER_PROVENANCE,
  },
  {
    id: "screen",
    src: "/showcase/screen-wall.jpg",
    alt: "Illustration of a large blank cinema screen glowing warmly between dark side curtains",
    title: "The screen",
    caption:
      "Screen size, aspect ratio and projector specification are still being confirmed with the venue.",
    depictsVenue: false,
    provenance: PLACEHOLDER_PROVENANCE,
  },
  {
    id: "seats",
    src: "/showcase/seats.jpg",
    alt: "Illustration of rows of dark upholstered cinema seats lit by a warm aisle light",
    title: "The seating",
    caption:
      "Seat type, row layout and companion-seating provision are still being confirmed with the venue.",
    depictsVenue: false,
    provenance: PLACEHOLDER_PROVENANCE,
  },
  {
    id: "foyer",
    src: "/showcase/foyer.jpg",
    alt: "Illustration of a dark cinema foyer with a long low counter lit by warm cove lighting",
    title: "The foyer",
    caption:
      "Box office location, opening hours and the mall-level entrance used by the cinema are still being confirmed.",
    depictsVenue: false,
    provenance: PLACEHOLDER_PROVENANCE,
  },
  {
    id: "concessions",
    src: "/showcase/concessions.jpg",
    alt: "Illustration of a dark concession counter with warm under-shelf lighting and out-of-focus cups",
    title: "Food and drink",
    caption:
      "Menu, pricing and whether outside food is permitted are still being confirmed with the venue.",
    depictsVenue: false,
    provenance: PLACEHOLDER_PROVENANCE,
  },
  {
    id: "corridor",
    src: "/showcase/corridor.jpg",
    alt: "Illustration of a dark corridor with a line of warm light leading to a glowing opening",
    title: "Getting to your screen",
    caption:
      "Step-free routes from the mall levels, lift access and accessible washroom provision are still being confirmed.",
    depictsVenue: false,
    provenance: PLACEHOLDER_PROVENANCE,
  },
];

export type ShowcaseHighlight = {
  id: string;
  label: string;
  detail: string;
  status: FactStatus;
};

/**
 * The short "how this cinema presents films" list on the home page.
 *
 * Only the location claim is confirmed. The rest are published as open
 * questions rather than as marketing, because a cinema's comfort and access
 * claims are exactly what people travel for.
 */
export const showcaseHighlights: ShowcaseHighlight[] = [
  {
    id: "location",
    label: "Inside Elante Mall, Chandigarh",
    detail: "On Purv Marg, Industrial Area Phase I — a cinema inside the mall, not a standalone site.",
    status: "confirmed",
  },
  {
    id: "presentation",
    label: "How films are presented here",
    detail: "Formats, projection, sound system and screen specification are awaiting confirmation.",
    status: "pending",
  },
  {
    id: "comfort",
    label: "Comfort and seating",
    detail: "Seat type, recliner provision and legroom are awaiting confirmation.",
    status: "pending",
  },
  {
    id: "access",
    label: "Step-free access and assisted screenings",
    detail: "Lift access, wheelchair spaces and assisted-audio provision are awaiting confirmation.",
    status: "pending",
  },
  {
    id: "concessions",
    label: "Food and drink",
    detail: "Concession menu, pricing and outside-food rules are awaiting confirmation.",
    status: "pending",
  },
  {
    id: "programming",
    label: "Programming and languages",
    detail:
      "Languages and formats shown each week are taken from the venue's own published schedule.",
    status: "pending",
  },
];

/** Copy for the showcase section, kept out of the components. */
export const showcaseCopy = {
  eyebrow: "The cinema hall",
  heading: "Inside the cinema",
  lede:
    "A look at the space itself: the auditorium, the screen, the foyer and everything between the mall and your seat. Photographs of this cinema are still being supplied — the images below are original illustrations, and each one says what is still being confirmed.",
  galleryNote:
    "Every tile above is an illustration made for this project. Approved photographs of this cinema will replace them, and each will be captioned with its source.",
} as const;
