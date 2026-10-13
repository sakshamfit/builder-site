/**
 * Venue showcase content.
 *
 * This is the cinema-hall showcase: what the venue looks like and how films are
 * presented here. It is the centrepiece of the site, with ticketing kept as a
 * separate, secondary concern (see lib/ticketing-provider.ts).
 *
 * WHY THERE ARE NO IMAGES HERE
 * ---------------------------
 * This project previously carried original generated illustrations of a generic
 * auditorium, captioned as illustrations. They were removed at the owner's
 * instruction, and the instruction was right: an illustration of *some* cinema on
 * *this* cinema's website is decoration that reads as documentation, and a
 * visitor who has not been to the venue cannot tell the difference.
 *
 * So this file now holds no imagery at all. The showcase presents the venue's
 * own facts as a specification sheet instead — which is what the design language
 * was built for, and which has the advantage of being true. `showcaseImages` is
 * an empty array, not a list of placeholders, and nothing renders in its place.
 *
 * TO PUBLISH REAL PHOTOGRAPHY, the process is short and it is the only route:
 *   1. The venue supplies approved photographs of its own spaces (its own
 *      building, its own staff's work — no third party is involved).
 *   2. Drop the files into `public/showcase/`.
 *   3. Add an entry here with `depictsVenue: true`, a real `alt` description, a
 *      caption stating only what the photograph shows, and a `provenance` line
 *      naming who took it and when.
 *   4. Record it in ASSET_CREDITS.md.
 *
 * Nothing else changes: the gallery and spotlight components already render
 * whatever is in this array, and they stay hidden while it is empty.
 *
 * Film key art is a separate matter and is not covered by the above — posters
 * and stills belong to the distributor and reach a venue site only through a
 * studio-approved asset kit or the ticketing partner's feed.
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
   * One line describing the space. States what the photograph shows, or names
   * what is still being confirmed.
   */
  caption: string;
  /** Set true only for an approved photograph of this venue. */
  depictsVenue: boolean;
  /** Where the image came from. Shown to the visitor as a provenance line. */
  provenance: string;
};

/**
 * Empty on purpose. See the file header — the venue has not yet supplied
 * photographs, and nothing is substituted in their place.
 */
export const showcaseImages: ShowcaseImage[] = [];

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
      "Which films, languages and formats play here each week comes from the venue's own published schedule.",
    status: "pending",
  },
];

/**
 * Copy for the showcase section, kept out of the components.
 *
 * Each line here is checked against the no-invention rule: nothing claims a
 * facility, a standard or a superlative the venue has not supplied.
 */
export const showcaseCopy = {
  eyebrow: "The cinema hall",
  heading: "Inside the cinema",
  lede:
    "A venue site should show you the place before you commit to coming. This cinema has not yet supplied photographs of its own interiors, so rather than fill the space with pictures of a cinema in general, this page carries what the venue has actually told us — and names what it has not.",
  galleryNote:
    "No photographs of this cinema are published yet. Approved venue photography will replace this section when it is supplied, and each image will be credited.",
  /** Shown in the space the gallery would occupy. */
  pendingTitle: "Photography of this cinema is pending",
  pendingDetail:
    "The venue has been asked for approved photographs of the auditorium, screen, foyer, seating and concession counter. This site publishes none until then, and uses no stock or generated footage of a different cinema in their place.",
} as const;
