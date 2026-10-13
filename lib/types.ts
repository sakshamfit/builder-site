/**
 * Shared domain types.
 *
 * Everything the UI renders is described here once, so the sourced release
 * programme and the operator feed are validated against the same contract.
 */

/** How confident we are in a piece of public information. */
export type FactStatus =
  /** Supplied or approved by the venue. Safe to state plainly. */
  | "confirmed"
  /** A placeholder that still needs owner sign-off. Always rendered as such. */
  | "pending";

/**
 * A public claim plus its verification state. Keeping the status next to the
 * value means a placeholder can never silently become a stated fact.
 */
export type Fact<T> = {
  value: T | null;
  status: FactStatus;
  /** Where this came from, e.g. "owner email 2026-10-14". Shown in build notes. */
  source?: string;
  /** Shown to the visitor instead of the value when status is "pending". */
  pendingNote?: string;
};

export type Language = {
  /** BCP-47-ish tag, e.g. "hi", "en", "pa". */
  code: string;
  /** Display label, e.g. "Hindi". */
  label: string;
};

/**
 * A presentation format. Formats are only ever listed on a film when the
 * operator's feed states them — this site never infers 3D/large-format from a
 * title. See README "Never claim a format we were not given".
 */
export type Format = "2D" | "3D" | "IMAX" | "4DX" | "ScreenX" | "Dolby Atmos";

export type MovieStatus = "now_showing" | "coming_soon";

/** A citation. Every film in a sourced programme carries at least one. */
export type SourceRef = {
  label: string;
  url: string;
};

/**
 * Film artwork.
 *
 * There are exactly two ways artwork can reach this site: the venue supplies a
 * licensed file, or the partner feed supplies a URL on an allow-listed host with
 * a stated licence. Searching for a poster is not one of them. When a film has no
 * artwork, `Movie.artwork` is null and the UI renders a typographic plate — it
 * never substitutes a lookalike.
 */
export type Artwork = {
  /** Remote URL from the feed, or a path under /public supplied by the venue. */
  url: string;
  /** Describes the artwork for assistive technology. */
  alt: string;
  /** Who licensed it. Rendered to the visitor; never blank when artwork exists. */
  licence: string;
};

export type Movie = {
  /** Stable identifier used in URLs and provider deep links. */
  slug: string;
  title: string;
  /** Only when the source supplies one; otherwise null and the UI omits it. */
  originalTitle: string | null;
  status: MovieStatus;
  /**
   * Null unless the source actually published a synopsis. A sourced release
   * programme carries none, so the UI shows the release facts instead of prose.
   */
  synopsis: string | null;
  languages: Language[];
  /** Whole minutes. Null when the source does not state a runtime. */
  runtimeMinutes: number | null;
  genres: string[];
  /**
   * Certification exactly as issued, with its issuing body, e.g.
   * { label: "U/A 13+", body: "CBFC" }. Never invented, never localised.
   */
  certification: { label: string; body: string } | null;
  formats: Format[];
  /** Null when no licensed artwork exists. Never a stand-in. */
  artwork: Artwork | null;
  /**
   * Release date when the source states one.
   * ISO calendar date (no time), e.g. "2026-11-06".
   */
  releaseDate: string | null;
  /**
   * How far the release date reaches, in the source's own terms — e.g.
   * "Announced national theatrical release in India". Null for feed films, where
   * the date belongs to this venue's programme instead.
   */
  releaseScope: string | null;
  /** Where the facts in this record came from. */
  sources: SourceRef[];
  /** One-line provenance, surfaced in the UI on each film page. */
  provenance: string;
};

/** Where a screen belongs in the venue. Screen identity comes from the venue. */
export type Screen = {
  id: string;
  /** Venue-supplied name. Fixtures use neutral working names. */
  name: string;
  /** Formats this screen can present, only as stated by the venue. */
  formats: Format[];
  /** Accessibility features confirmed for this screen. */
  accessibleFeatures: string[];
};

/** Provider-supplied availability. "unknown" is the honest default. */
export type Availability = "unknown" | "available" | "few_left" | "sold_out";

export type Showtime = {
  id: string;
  movieSlug: string;
  venueId: string;
  screenId: string;
  /** ISO 8601 with an explicit UTC offset, e.g. "2026-10-13T18:15:00+05:30". */
  startsAt: string;
  /** IANA zone the venue actually operates in. */
  timezone: string;
  languageCode: string;
  format: Format;
  /** Only ever set from provider data. Never guessed, never defaulted. */
  availability: Availability;
  /** Minor units (paise) so no floating-point money. Provider-supplied only. */
  priceMinor: number | null;
  currency: string | null;
  /** Provider's own id for this screening, echoed back on handoff. */
  providerShowtimeId: string | null;
  /** Whether this record is a development fixture or live provider data. */
  source: "fixture" | "live";
  /** Human-readable provenance, surfaced in the UI for fixture data. */
  provenance: string;
};

export type Venue = {
  id: string;
  /** Working name until the operator confirms the trade name. */
  name: string;
  timezone: string;
  address: VenueAddress;
  hours: HourRange[];
  screens: Screen[];
  facilities: Facility[];
  accessibility: Facility[];
  arrival: ArrivalInfo;
  contact: VenueContact;
};

export type VenueAddress = {
  street: Fact<string>;
  locality: Fact<string>;
  region: Fact<string>;
  postalCode: Fact<string>;
  country: Fact<string>;
  /** Human-readable map query. Not a pin — a pin needs verified coordinates. */
  mapQuery: Fact<string>;
  planningNote: Fact<string>;
};

export type HourRange = {
  label: string;
  value: Fact<string>;
};

export type Facility = {
  id: string;
  label: string;
  detail?: string;
  status: FactStatus;
};

export type ArrivalInfo = {
  parking: Fact<string>;
  transit: Fact<string>;
  entrance: Fact<string>;
};

export type VenueContact = {
  phone: Fact<string>;
  email: Fact<string>;
  /** External links (maps, transit) verified by the owner. */
  links: ExternalLink[];
};

export type ExternalLink = {
  id: string;
  label: string;
  href: string;
  description?: string;
  /** Verified destination vs. a link still awaiting owner confirmation. */
  status: FactStatus;
};

/** A promotion. Renders only when the venue has approved it. */
export type Offer = {
  id: string;
  title: string;
  summary: string;
  /** ISO calendar date the offer starts (inclusive). */
  validFrom: string;
  /** ISO calendar date the offer ends (inclusive). */
  validTo: string;
  terms: string[];
  approval: FactStatus;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  /** Answers derived from an unconfirmed policy are flagged, never implied. */
  status: FactStatus;
  pendingNote?: string;
};
